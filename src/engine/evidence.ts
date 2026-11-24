import type {
  Address,
  Email,
  EvidencePanel,
  LocalizedText,
  Message,
  ScenarioData,
  ScenarioNode,
  Segment,
} from "./schema";

/**
 * Where a flaggable item sits. The debrief shows it ("Reply-To", "PDF fine print") and scoring
 * uses it to tell items on screen from items behind an inspection.
 */
export type EvidenceWhere =
  | "message"
  | "email-body"
  | "from"
  | "reply-to"
  | "to"
  | "attachment"
  | "link"
  | "panel-field"
  | "fine-print";

/** Anything the player can flag: a message, a phrase, an email header, a profile line, a PDF clause. */
export interface Flaggable {
  id: string;
  redFlagId?: string;
  /** What the debrief quotes. */
  text: LocalizedText;
  where: EvidenceWhere;
  /** The panel it lives in, for panel fields. */
  panelId?: string;
  /** Nodes from which the player can reveal it. */
  nodeIds: string[];
  /**
   * True if the player must act to see it (tap the sender, open a panel or an email in the inbox).
   * False if it shows as soon as the node is on screen.
   */
  hidden: boolean;
}

const plain = (s: string): LocalizedText => ({ en: s });

/** Joins localized parts. Hinglish is set only if some part has it; other parts fall back to English. */
export function joinText(parts: readonly LocalizedText[], separator = ""): LocalizedText {
  const en = parts.map((p) => p.en).join(separator);
  if (!parts.some((p) => p.hinglish !== undefined)) return { en };
  return { en, hinglish: parts.map((p) => p.hinglish ?? p.en).join(separator) };
}

/** The whole text of a message, whether written as `text` or as `segments`. */
export function messageText(message: Message): LocalizedText {
  if (message.text !== undefined) return message.text;
  return joinText((message.segments ?? []).map((s) => s.text));
}

/** Flaggable ids that appear the moment a message is shown. */
export function messageRevealIds(message: Message): string[] {
  const segmentIds = (message.segments ?? []).flatMap((s) => (s.id === undefined ? [] : [s.id]));
  return [message.id, ...segmentIds];
}

function segmentIds(segments: readonly Segment[]): string[] {
  return segments.flatMap((s) => (s.id === undefined ? [] : [s.id]));
}

/** Flaggable ids visible as soon as an email is open: body phrases, and From if it's shown. */
export function emailOpenIds(email: Email): string[] {
  const ids = email.body.flatMap(segmentIds);
  if (email.showFromAddress === true) ids.push(email.from.id);
  return ids;
}

/** Flaggable ids revealed by tapping the sender: From, Reply-To and To. */
export function emailDetailIds(email: Email): string[] {
  return [email.from.id, ...(email.replyTo === undefined ? [] : [email.replyTo.id]), email.to.id];
}

/** Every field id in a panel. Opening the panel reveals all of them. */
export function panelFieldIds(panel: EvidencePanel): string[] {
  return panel.sections.flatMap((section) => section.fields.map((f) => f.id));
}

/** The panels a node lets the player open: its evidence buttons and its attachments' previews. */
export function panelsForNode(node: ScenarioNode): string[] {
  const ids = new Set<string>();
  if (node.kind === "thread" || node.kind === "email") {
    for (const id of node.evidence ?? []) ids.add(id);
  }
  const emails =
    node.kind === "email"
      ? [node.email]
      : node.kind === "triage"
        ? node.items.map((i) => i.email)
        : [];
  for (const email of emails) {
    for (const a of email.attachments ?? []) if (a.documentId !== undefined) ids.add(a.documentId);
  }
  return [...ids];
}

function emailFlaggables(email: Email, nodeId: string, inInbox: boolean): Flaggable[] {
  const out: Flaggable[] = [];
  const nodeIds = [nodeId];
  const address = (a: Address, where: EvidenceWhere, hidden: boolean) =>
    out.push({ id: a.id, redFlagId: a.redFlagId, text: plain(a.address), where, nodeIds, hidden });

  address(email.from, "from", inInbox || email.showFromAddress !== true);
  if (email.replyTo !== undefined) address(email.replyTo, "reply-to", true);
  address(email.to, "to", true);
  for (const paragraph of email.body) {
    for (const segment of paragraph) {
      if (segment.id === undefined) continue;
      out.push({
        id: segment.id,
        redFlagId: segment.redFlagId,
        text: segment.text,
        where: "email-body",
        nodeIds,
        hidden: inInbox,
      });
    }
  }
  for (const a of email.attachments ?? []) {
    out.push({
      id: a.id,
      redFlagId: a.redFlagId,
      text: plain(a.fullName),
      where: "attachment",
      nodeIds,
      hidden: true,
    });
  }
  for (const link of email.links ?? []) {
    out.push({
      id: link.id,
      redFlagId: link.redFlagId,
      text: joinText([link.text, plain(link.actualUrl)], " → "),
      where: "link",
      nodeIds,
      hidden: true,
    });
  }
  return out;
}

/**
 * Every flaggable item in a scenario, in reading order. The one place that knows them all:
 * the schema checks ids and red flags with it, and scoring builds the debrief from it.
 */
export function collectFlaggables(scenario: ScenarioData): Flaggable[] {
  const out: Flaggable[] = [];
  const panelNodes = new Map<string, string[]>();

  for (const [nodeId, node] of Object.entries(scenario.nodes)) {
    for (const panelId of panelsForNode(node)) {
      panelNodes.set(panelId, [...(panelNodes.get(panelId) ?? []), nodeId]);
    }
    switch (node.kind) {
      case "thread":
        for (const message of node.messages) {
          out.push({
            id: message.id,
            redFlagId: message.redFlagId,
            text: messageText(message),
            where: "message",
            nodeIds: [nodeId],
            hidden: false,
          });
          for (const segment of message.segments ?? []) {
            if (segment.id === undefined) continue;
            out.push({
              id: segment.id,
              redFlagId: segment.redFlagId,
              text: segment.text,
              where: "message",
              nodeIds: [nodeId],
              hidden: false,
            });
          }
        }
        break;
      case "email":
        out.push(...emailFlaggables(node.email, nodeId, false));
        break;
      case "triage":
        for (const item of node.items) out.push(...emailFlaggables(item.email, nodeId, true));
        break;
      case "compose":
        out.push({
          id: node.to.id,
          redFlagId: node.to.redFlagId,
          text: plain(node.to.address),
          where: "to",
          nodeIds: [nodeId],
          hidden: false,
        });
        break;
      case "outcome":
        break;
    }
  }

  for (const [panelId, panel] of Object.entries(scenario.evidence ?? {})) {
    for (const section of panel.sections) {
      for (const field of section.fields) {
        out.push({
          id: field.id,
          redFlagId: field.redFlagId,
          text:
            field.label === undefined ? field.value : joinText([field.label, field.value], ": "),
          where: field.finePrint === true ? "fine-print" : "panel-field",
          panelId,
          nodeIds: panelNodes.get(panelId) ?? [],
          hidden: true,
        });
      }
    }
  }

  return out;
}

/** The nodes a node leads to. */
export function nextNodeIds(node: ScenarioNode): string[] {
  switch (node.kind) {
    case "thread":
    case "email":
    case "compose":
      return node.choices.map((c) => c.nextNodeId);
    case "triage":
      return [node.nextNodeId];
    case "outcome":
      return [];
  }
}
