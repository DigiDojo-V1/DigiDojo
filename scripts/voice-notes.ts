/**
 * Prints every voice note in the registered dojos as JSON, one entry per recording to make.
 * scripts/generate-voices.py reads it: `npm run voices`.
 */
import { DOJOS } from "@/dojos/registry";
import { messageText } from "@/engine/evidence";
import { voiceFileName } from "@/engine/voice";
import { LOCALES } from "@/i18n/locale";

const notes = [];
for (const dojo of DOJOS) {
  for (const scenario of dojo.scenarios) {
    for (const node of Object.values(scenario.nodes)) {
      if (node.kind !== "thread") continue;
      for (const message of node.messages) {
        if (message.voiceNote === undefined) continue;
        const text = messageText(message);
        for (const locale of LOCALES) {
          const spoken = locale === "en" ? text.en : text.hinglish;
          if (spoken === undefined) continue;
          notes.push({
            path: `public/voices/${dojo.id}/${scenario.id}/${voiceFileName(message.id, locale)}`,
            locale,
            text: spoken,
            voice: message.voiceNote.voice ?? "male",
            mood: message.voiceNote.mood ?? "casual",
          });
        }
      }
    }
  }
}
console.log(JSON.stringify(notes, null, 2));
