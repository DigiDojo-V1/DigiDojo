import {
  FunctionResponseScheduling,
  GoogleGenAI,
  type LiveServerMessage,
  type Session,
} from "@google/genai";
import type { LiveConfig } from "@/server/call-api";
import { toSdkConfig } from "./sdk-config";

/**
 * One Gemini Live session, connected straight from the browser with a single-use token from
 * `/api/call/token`. Turns server messages into plain callbacks.
 */

export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
}

export interface LiveSessionHandlers {
  /** Setup finished: safe to send audio. */
  onReady(): void;
  onAudio(base64: string): void;
  /** The player talked over the caller: stop playback. */
  onInterrupted(): void;
  onCallerText(text: string): void;
  onPlayerText(text: string): void;
  /** The caller finished a turn. */
  onTurnComplete(): void;
  onToolCall(call: ToolCall): void;
  onClose(reason: string): void;
}

export interface TokenResponse {
  token: string;
  model: string;
  config: LiveConfig;
}

export class LiveSession {
  private session: Session | null = null;
  private closed = false;

  constructor(private readonly handlers: LiveSessionHandlers) {}

  async connect({ token, model, config }: TokenResponse): Promise<void> {
    const ai = new GoogleGenAI({ apiKey: token, httpOptions: { apiVersion: "v1beta" } });
    this.session = await ai.live.connect({
      model,
      // The token already locks this config; sending it too keeps both ends in step.
      config: toSdkConfig(config),
      callbacks: {
        onmessage: (message) => this.receive(message),
        onerror: (event) => this.finish(event.message || "connection error"),
        onclose: (event) => this.finish(event.reason || `closed (${event.code})`),
      },
    });
    if (this.closed) this.session.close();
  }

  private receive(message: LiveServerMessage) {
    if (this.closed) return;
    if (message.setupComplete !== undefined) this.handlers.onReady();
    const content = message.serverContent;
    if (content !== undefined) {
      if (content.interrupted === true) this.handlers.onInterrupted();
      for (const part of content.modelTurn?.parts ?? []) {
        if (part.inlineData?.data !== undefined) this.handlers.onAudio(part.inlineData.data);
      }
      if (content.inputTranscription?.text)
        this.handlers.onPlayerText(content.inputTranscription.text);
      if (content.outputTranscription?.text)
        this.handlers.onCallerText(content.outputTranscription.text);
      if (content.turnComplete === true) this.handlers.onTurnComplete();
    }
    for (const call of message.toolCall?.functionCalls ?? []) {
      if (call.name === undefined) continue;
      this.handlers.onToolCall({ id: call.id ?? "", name: call.name, args: call.args ?? {} });
    }
  }

  private finish(reason: string) {
    if (this.closed) return;
    this.closed = true;
    this.handlers.onClose(reason);
  }

  sendAudio(base64: string): void {
    if (this.closed) return;
    this.session?.sendRealtimeInput({ audio: { data: base64, mimeType: "audio/pcm;rate=16000" } });
  }

  sendText(text: string): void {
    if (this.closed) return;
    this.session?.sendRealtimeInput({ text });
  }

  /** Answer a tool call. `silent` adds it to the context without making the caller speak. */
  respond(call: ToolCall, response: Record<string, unknown>, silent: boolean): void {
    if (this.closed) return;
    this.session?.sendToolResponse({
      functionResponses: [
        {
          id: call.id,
          name: call.name,
          response,
          scheduling: silent
            ? FunctionResponseScheduling.SILENT
            : FunctionResponseScheduling.WHEN_IDLE,
        },
      ],
    });
  }

  close(): void {
    this.closed = true;
    this.session?.close();
  }
}
