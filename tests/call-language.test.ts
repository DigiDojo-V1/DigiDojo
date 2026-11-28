import { describe, expect, it } from "vitest";
import { cardAlert } from "@/dojos/authority/scenarios/card-alert";
import { kycCall } from "@/dojos/authority/scenarios/kyc-call";
import {
  agentInstructions,
  CALL_LANGUAGES,
  liveCallNode,
  saidCode,
  spokenDigits,
  transcriptionVocabulary,
} from "@/engine/live-call";
import { liveConfig } from "@/server/call-api";

const kycNode = liveCallNode(kycCall, "kyc-call")!;

describe("calls are limited to English and Hindi", () => {
  it("tells the speech-to-text to expect only English and Hindi, both ways", () => {
    const config = liveConfig(kycCall, kycNode, "hinglish");
    expect(CALL_LANGUAGES).toEqual(["en", "hi"]);
    expect(config.inputAudioTranscription.languageCodes).toEqual(["en", "hi"]);
    expect(config.outputAudioTranscription.languageCodes).toEqual(["en", "hi"]);
  });

  it("tells the caller never to speak another language", () => {
    for (const locale of ["en", "hinglish"] as const) {
      expect(agentInstructions(kycCall, kycNode, locale)).toContain(
        "Only ever speak English, Hindi or a mix of the two",
      );
    }
  });
});

describe("transcription vocabulary", () => {
  it("includes call jargon, both names, the player's details and the scenario's own terms", () => {
    const vocabulary = transcriptionVocabulary(kycNode);
    for (const term of [
      "OTP",
      "KYC",
      "Aadhaar",
      "Nimbus Bank KYC",
      "Priya Nair",
      "BXKPN4821Q",
      "NN-48213",
    ]) {
      expect(vocabulary).toContain(term);
    }
    expect(new Set(vocabulary).size).toBe(vocabulary.length);
    expect(vocabulary.length).toBeLessThanOrEqual(100);
  });

  it("goes into the session config", () => {
    const node = liveCallNode(cardAlert, "alert-call")!;
    const config = liveConfig(cardAlert, node, "en");
    expect(config.inputAudioTranscription.customVocabulary).toContain("CS-20418");
  });
});

describe("codes read out in Hindi script", () => {
  it("reads Devanagari digits and Hindi number words", () => {
    expect(spokenDigits("ओटीपी ४८२९१३ है")).toBe("482913");
    expect(spokenDigits("चार आठ दो नौ एक तीन")).toBe("482913");
    expect(spokenDigits("पाँच पांच छह")).toBe("556");
  });

  it("catches a code read out in mixed scripts", () => {
    expect(saidCode("OTP hai चार आठ two nine एक 3", "482913")).toBe(true);
    expect(saidCode("मैं OTP नहीं बताऊंगा", "482913")).toBe(false);
  });
});
