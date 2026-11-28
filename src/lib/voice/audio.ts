/**
 * Browser audio for live calls: the microphone as 16 kHz, 16-bit PCM chunks (what the Live API
 * takes), and a player for the caller's 24 kHz PCM that can be cut off mid-word when the player
 * interrupts.
 */

const INPUT_RATE = 16_000;
const OUTPUT_RATE = 24_000;
/** 80 ms of audio per chunk sent. */
const CHUNK_SAMPLES = 1280;

/**
 * Resamples the mic to 16 kHz (linear interpolation is plenty for speech) and posts Int16 chunks
 * with their loudness. `sampleRate` is the AudioWorklet global for the context's rate.
 */
const CAPTURE_WORKLET = `
class PcmCapture extends AudioWorkletProcessor {
  constructor() {
    super();
    this.ratio = sampleRate / ${INPUT_RATE};
    this.pos = 0;
    this.buf = new Int16Array(${CHUNK_SAMPLES});
    this.n = 0;
    this.sum = 0;
  }
  process(inputs) {
    const ch = inputs[0] && inputs[0][0];
    if (!ch) return true;
    for (; this.pos < ch.length; this.pos += this.ratio) {
      const i = Math.floor(this.pos);
      const f = this.pos - i;
      const a = ch[i];
      const b = i + 1 < ch.length ? ch[i + 1] : a;
      const v = Math.max(-1, Math.min(1, a + (b - a) * f));
      this.buf[this.n++] = v < 0 ? v * 0x8000 : v * 0x7fff;
      this.sum += v * v;
      if (this.n === this.buf.length) {
        this.port.postMessage({ pcm: this.buf.buffer, level: Math.sqrt(this.sum / this.n) }, [this.buf.buffer]);
        this.buf = new Int16Array(${CHUNK_SAMPLES});
        this.n = 0;
        this.sum = 0;
      }
    }
    this.pos -= ch.length;
    return true;
  }
}
registerProcessor("pcm-capture", PcmCapture);
`;

export function bytesToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

export function base64ToBytes(base64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(base64);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export interface Mic {
  setMuted(muted: boolean): void;
  /** Loudness of the last chunk, 0 to about 1. */
  level(): number;
  stop(): void;
}

export class MicError extends Error {
  constructor(
    readonly reason: "denied" | "unavailable",
    message: string,
  ) {
    super(message);
  }
}

/** Starts the microphone. `onChunk` gets base64 PCM at 16 kHz, nothing while muted. */
export async function startMic(onChunk: (base64: string) => void): Promise<Mic> {
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
  } catch (error) {
    const denied = error instanceof DOMException && error.name === "NotAllowedError";
    throw new MicError(denied ? "denied" : "unavailable", String(error));
  }

  const ctx = new AudioContext();
  const url = URL.createObjectURL(new Blob([CAPTURE_WORKLET], { type: "text/javascript" }));
  try {
    await ctx.audioWorklet.addModule(url);
  } finally {
    URL.revokeObjectURL(url);
  }
  const source = ctx.createMediaStreamSource(stream);
  const node = new AudioWorkletNode(ctx, "pcm-capture");
  // A silent path to the speakers keeps the worklet running in every browser.
  const sink = ctx.createGain();
  sink.gain.value = 0;
  source.connect(node);
  node.connect(sink);
  sink.connect(ctx.destination);

  let muted = false;
  let lastLevel = 0;
  node.port.onmessage = (event: MessageEvent<{ pcm: ArrayBuffer; level: number }>) => {
    lastLevel = muted ? 0 : event.data.level;
    if (!muted) onChunk(bytesToBase64(event.data.pcm));
  };

  return {
    setMuted: (m) => {
      muted = m;
    },
    level: () => lastLevel,
    stop: () => {
      node.port.onmessage = null;
      stream.getTracks().forEach((track) => track.stop());
      void ctx.close();
    },
  };
}

/** Plays the caller's audio chunks back to back. */
export class PcmPlayer {
  private ctx = new AudioContext({ sampleRate: OUTPUT_RATE });
  private analyser = this.ctx.createAnalyser();
  private nextStart = 0;
  private sources = new Set<AudioBufferSourceNode>();
  private samples = new Float32Array(512);

  constructor() {
    this.analyser.fftSize = 512;
    this.analyser.connect(this.ctx.destination);
  }

  /** Browsers start audio only after a tap: call this from the Answer button. */
  async resume(): Promise<void> {
    if (this.ctx.state === "suspended") await this.ctx.resume();
  }

  play(base64: string): void {
    const bytes = base64ToBytes(base64);
    const pcm = new Int16Array(bytes.buffer, 0, Math.floor(bytes.length / 2));
    if (pcm.length === 0) return;
    const buffer = this.ctx.createBuffer(1, pcm.length, OUTPUT_RATE);
    const channel = buffer.getChannelData(0);
    for (let i = 0; i < pcm.length; i++) channel[i] = pcm[i]! / 0x8000;
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.analyser);
    const startAt = Math.max(this.nextStart, this.ctx.currentTime + 0.05);
    source.start(startAt);
    this.nextStart = startAt + buffer.duration;
    this.sources.add(source);
    source.onended = () => this.sources.delete(source);
  }

  /** Cut the caller off: the player started talking over them. */
  interrupt(): void {
    for (const source of this.sources) {
      try {
        source.stop();
      } catch {
        // Already stopped.
      }
    }
    this.sources.clear();
    this.nextStart = 0;
  }

  get speaking(): boolean {
    return this.sources.size > 0;
  }

  level(): number {
    if (!this.speaking) return 0;
    this.analyser.getFloatTimeDomainData(this.samples);
    let sum = 0;
    for (const v of this.samples) sum += v * v;
    return Math.sqrt(sum / this.samples.length);
  }

  close(): void {
    this.interrupt();
    void this.ctx.close();
  }
}
