import type { Locale } from "@/i18n/locale";
import { resolveText } from "@/i18n/text";
import type { ChatBubble } from "@/shells/types";
import { messageText } from "./evidence";
import type { Message, Scenario, ScenarioNode, ThreadNode } from "./schema";
import type { TrailStep } from "./store";

/** A message as the shell draws it, with its text in `locale`. */
export function toBubble(message: Message, locale: Locale): ChatBubble {
  return {
    id: message.id,
    from: message.from,
    sender: message.sender === undefined ? undefined : resolveText(message.sender, locale),
    text: resolveText(messageText(message), locale),
    // A message written in segments is flagged phrase by phrase, never as a whole.
    flaggable: message.from !== "me" && message.segments === undefined,
    segments: message.segments?.map((segment) => ({
      id: segment.id,
      text: resolveText(segment.text, locale),
      flaggable: segment.id !== undefined && message.from !== "me",
    })),
  };
}

/** Same app and same contact (compared by the English name, which never changes with locale). */
function sameConversation(a: ScenarioNode | undefined, b: ThreadNode): a is ThreadNode {
  return a?.kind === "thread" && a.app === b.app && a.contact.name.en === b.contact.name.en;
}

/**
 * Earlier messages in the same chat, shown above the current node's messages.
 * Walks back along the trail while the nodes share the same app and contact, and adds the
 * player's chosen reply after each one as a "me" bubble. So `dm` → `task` reads as one chat.
 */
export function priorTranscript(
  scenario: Scenario,
  trail: readonly TrailStep[],
  locale: Locale,
): ChatBubble[] {
  const current = trail.at(-1);
  const node = current === undefined ? undefined : scenario.nodes[current.nodeId];
  if (node?.kind !== "thread") return [];

  let start = trail.length - 1;
  while (start > 0 && sameConversation(scenario.nodes[trail[start - 1]!.nodeId], node)) start--;

  const bubbles: ChatBubble[] = [];
  for (let i = start; i < trail.length - 1; i++) {
    const step = trail[i]!;
    const stepNode = scenario.nodes[step.nodeId];
    if (stepNode?.kind !== "thread") continue;
    bubbles.push(...stepNode.messages.map((m) => toBubble(m, locale)));
    if (step.choiceLabel !== undefined) {
      bubbles.push({
        id: `reply-${i}`,
        from: "me",
        text: resolveText(step.choiceLabel, locale),
        flaggable: false,
      });
    }
  }
  return bubbles;
}
