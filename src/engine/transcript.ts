import type { ChatBubble } from "@/shells/types";
import type { Message, Scenario, ScenarioNode, ThreadNode } from "./schema";
import type { TrailStep } from "./store";

export function toBubble(message: Message): ChatBubble {
  return {
    id: message.id,
    from: message.from,
    sender: message.sender,
    text: message.text,
    flaggable: message.from !== "me",
  };
}

function sameConversation(a: ScenarioNode | undefined, b: ThreadNode): a is ThreadNode {
  return a?.kind === "thread" && a.app === b.app && a.contact.name === b.contact.name;
}

/**
 * Earlier messages in the same chat, shown above the current node's messages.
 * Walks back along the trail while the nodes share the same app and contact, and adds the
 * player's chosen reply after each one as a "me" bubble. So `dm` → `task` reads as one chat.
 */
export function priorTranscript(scenario: Scenario, trail: readonly TrailStep[]): ChatBubble[] {
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
    bubbles.push(...stepNode.messages.map(toBubble));
    if (step.choiceLabel !== undefined) {
      bubbles.push({ id: `reply-${i}`, from: "me", text: step.choiceLabel, flaggable: false });
    }
  }
  return bubbles;
}
