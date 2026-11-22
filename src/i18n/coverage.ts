import type { Dojo, LocalizedText, Scenario } from "@/engine/schema";

/** One player-facing text field and where it lives, e.g. `nodes.dm.messages.dm-offer.text`. */
export interface TextField {
  path: string;
  text: LocalizedText;
}

/** Every player-facing text field in a scenario, in reading order. */
export function collectTexts(scenario: Scenario): TextField[] {
  const out: TextField[] = [];
  const add = (path: string, text: LocalizedText | undefined) => {
    if (text !== undefined) out.push({ path, text });
  };

  add("title", scenario.title);
  add("summary", scenario.summary);
  add("primer.title", scenario.primer?.title);
  add("primer.body", scenario.primer?.body);

  for (const [nodeId, node] of Object.entries(scenario.nodes)) {
    const at = `nodes.${nodeId}`;
    if (node.kind === "thread") {
      add(`${at}.contact.name`, node.contact.name);
      add(`${at}.contact.subtitle`, node.contact.subtitle);
      for (const message of node.messages) {
        add(`${at}.messages.${message.id}.sender`, message.sender);
        add(`${at}.messages.${message.id}.text`, message.text);
      }
      node.choices.forEach((choice, i) => add(`${at}.choices.${i}.label`, choice.label));
    } else {
      add(`${at}.title`, node.title);
      add(`${at}.body`, node.body);
    }
  }

  for (const [redFlagId, redFlag] of Object.entries(scenario.redFlags)) {
    add(`redFlags.${redFlagId}.label`, redFlag.label);
    add(`redFlags.${redFlagId}.explanation`, redFlag.explanation);
  }

  add("debrief.rule", scenario.debrief.rule);
  add("debrief.realWorldAction", scenario.debrief.realWorldAction);
  return out;
}

/** The dojo's own text fields (not its scenarios'). */
export function collectDojoTexts(dojo: Dojo): TextField[] {
  return [
    { path: "name", text: dojo.name },
    { path: "tagline", text: dojo.tagline },
  ];
}

export interface Coverage {
  total: number;
  missing: TextField[];
}

/** How many fields still have no Hinglish. A report only: missing Hinglish is never an error. */
export function hinglishCoverage(fields: readonly TextField[]): Coverage {
  return { total: fields.length, missing: fields.filter((f) => f.text.hinglish === undefined) };
}
