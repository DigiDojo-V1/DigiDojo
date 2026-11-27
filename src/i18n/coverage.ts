import type { Dojo, Email, LocalizedText, Scenario, Segment } from "@/engine/schema";

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
  add("primer.setup", scenario.primer?.setup);
  scenario.primer?.watchFor?.forEach((q, i) => add(`primer.watchFor.${i}`, q));

  const addSegments = (at: string, segments: readonly Segment[]) =>
    segments.forEach((segment, i) => add(`${at}.${segment.id ?? i}`, segment.text));
  const addEmail = (at: string, email: Email) => {
    add(`${at}.displayName`, email.displayName);
    add(`${at}.date`, email.date);
    add(`${at}.subject`, email.subject);
    add(`${at}.preview`, email.preview);
    email.body.forEach((paragraph, p) => addSegments(`${at}.body.${p}`, paragraph));
    for (const a of email.attachments ?? [])
      add(`${at}.attachments.${a.id}.actualType`, a.actualType);
    for (const link of email.links ?? []) add(`${at}.links.${link.id}.text`, link.text);
  };

  for (const [nodeId, node] of Object.entries(scenario.nodes)) {
    const at = `nodes.${nodeId}`;
    switch (node.kind) {
      case "thread":
        add(`${at}.contact.name`, node.contact.name);
        add(`${at}.contact.subtitle`, node.contact.subtitle);
        for (const message of node.messages) {
          add(`${at}.messages.${message.id}.sender`, message.sender);
          add(`${at}.messages.${message.id}.text`, message.text);
          addSegments(`${at}.messages.${message.id}.segments`, message.segments ?? []);
        }
        node.choices.forEach((choice, i) => add(`${at}.choices.${i}.label`, choice.label));
        break;
      case "email":
        addEmail(`${at}.email`, node.email);
        node.choices.forEach((choice, i) => add(`${at}.choices.${i}.label`, choice.label));
        break;
      case "compose":
        add(`${at}.subject`, node.subject);
        add(`${at}.body`, node.body);
        node.choices.forEach((choice, i) => add(`${at}.choices.${i}.label`, choice.label));
        break;
      case "triage":
        for (const item of node.items) {
          addEmail(`${at}.items.${item.id}.email`, item.email);
          add(`${at}.items.${item.id}.explanation`, item.explanation);
        }
        break;
      case "live-call":
        add(`${at}.caller.name`, node.caller.name);
        add(`${at}.caller.label`, node.caller.label);
        node.player.details.forEach((d, i) => add(`${at}.player.details.${i}.label`, d.label));
        for (const [eventId, event] of Object.entries(node.events ?? {})) {
          const e = `${at}.events.${eventId}`;
          if (event.kind === "sms") add(`${e}.text`, event.text);
          if (event.kind === "payment") {
            add(`${e}.payee`, event.payee);
            add(`${e}.note`, event.note);
          }
          if (event.kind === "document") add(`${e}.sender`, event.sender);
        }
        for (const lifeline of node.lifelines ?? []) {
          const l = `${at}.lifelines.${lifeline.id}`;
          add(`${l}.name`, lifeline.name);
          add(`${l}.message`, lifeline.message);
          add(`${l}.reply`, lifeline.reply);
        }
        break;
      case "outcome":
        add(`${at}.title`, node.title);
        add(`${at}.body`, node.body);
        break;
    }
  }

  for (const [panelId, panel] of Object.entries(scenario.evidence ?? {})) {
    const at = `evidence.${panelId}`;
    add(`${at}.title`, panel.title);
    add(`${at}.subtitle`, panel.subtitle);
    panel.sections.forEach((section, i) => {
      add(`${at}.sections.${i}.heading`, section.heading);
      for (const field of section.fields) {
        add(`${at}.fields.${field.id}.label`, field.label);
        add(`${at}.fields.${field.id}.value`, field.value);
      }
    });
  }

  for (const [redFlagId, redFlag] of Object.entries(scenario.redFlags)) {
    add(`redFlags.${redFlagId}.label`, redFlag.label);
    add(`redFlags.${redFlagId}.explanation`, redFlag.explanation);
  }

  add("debrief.rule", scenario.debrief.rule);
  add("debrief.summary", scenario.debrief.summary);
  add("debrief.realWorldAction", scenario.debrief.realWorldAction);
  return out;
}

/** The dojo's own text fields (not its scenarios'). */
export function collectDojoTexts(dojo: Dojo): TextField[] {
  return [
    { path: "name", text: dojo.name },
    { path: "tagline", text: dojo.tagline },
    ...(dojo.takeaways ?? []).map((text, i) => ({ path: `takeaways.${i}`, text })),
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
