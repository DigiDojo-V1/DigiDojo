import { z } from "zod";
import { collectFlaggables, nextNodeIds } from "./evidence";

/**
 * Scenario and dojo schemas. The TypeScript types are inferred from these, so the
 * schema is the single source of truth. See docs/CONTEXT.md §5.
 */

const kebabCase = z
  .string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "must be kebab-case (lowercase letters, digits and dashes)");

/**
 * Player-facing text. Authors write a plain string (English) or `{ en, hinglish }`; parsing
 * turns both into `{ en, hinglish? }`. Components never read the fields directly: they use
 * `useText()` from `@/i18n/hooks`, which falls back to English when Hinglish is missing.
 */
const LocalizedTextObjectSchema = z.strictObject({
  en: z.string().min(1),
  hinglish: z.string().min(1).optional(),
});
/** Parsed form: always an object. */
export type LocalizedText = z.output<typeof LocalizedTextObjectSchema>;

export const LocalizedTextSchema = z.union([
  z
    .string()
    .min(1)
    .transform((en): LocalizedText => ({ en })),
  LocalizedTextObjectSchema,
]);
/** What an author may write: a plain English string or `{ en, hinglish? }`. */
export type LocalizedTextInput = z.input<typeof LocalizedTextSchema>;

export const APP_THEMES = [
  "whatsapp",
  "telegram",
  "instagram",
  "linkedin",
  "sms",
  "upi",
  "call",
  "gmail",
] as const;
export const AppThemeSchema = z.enum(APP_THEMES);
export type AppTheme = z.infer<typeof AppThemeSchema>;
/** Apps a chat-style `thread` node can use. Email lives in `email`, `compose` and `triage` nodes. */
export const ThreadAppSchema = AppThemeSchema.exclude(["gmail"]);
export type ThreadApp = z.infer<typeof ThreadAppSchema>;

export const TACTICS = [
  "small-win-first",
  "pay-to-earn",
  "urgency",
  "social-proof",
  "sunk-cost",
  "authority",
  "isolation",
  "too-good-to-be-true",
  "flattery",
  "impersonation",
  "no-real-process",
  "data-harvest",
  "malicious-file",
  "disguised-link",
  "fear",
  "blocks-verification",
  "fake-proof",
  "secret-code",
  "small-ask",
  "pay-to-clear",
] as const;
export const TacticSchema = z.enum(TACTICS);
export type Tactic = z.infer<typeof TacticSchema>;

export const DOJO_IDS = ["easy-money", "dream-job", "trust-me-bro", "authority"] as const;
export const DojoIdSchema = z.enum(DOJO_IDS);
export type DojoId = z.infer<typeof DojoIdSchema>;

/**
 * Part of a message or email paragraph. Give it an `id` to make it flaggable on its own
 * (phrase-level flagging); a segment with a `redFlagId` must have an `id`.
 */
export const SegmentSchema = z.strictObject({
  id: kebabCase.optional(),
  text: LocalizedTextSchema,
  redFlagId: kebabCase.optional(),
});
export type Segment = z.output<typeof SegmentSchema>;

/**
 * Draws a message as a voice note: a play button, a waveform and the length. The message's
 * `text` (or `segments`) is the transcript, shown under the player and flaggable as usual.
 */
export const VoiceNoteSchema = z.strictObject({
  /** Length shown on the note, in seconds. */
  durationSec: z.number().int().min(1).max(300),
  /** Which generated voice reads it. Default "male". */
  voice: z.enum(["male", "female"]).optional(),
  /** How it's spoken. Default "casual". */
  mood: z.enum(["casual", "urgent", "pleading"]).optional(),
});
export type VoiceNote = z.output<typeof VoiceNoteSchema>;

export const MessageSchema = z.strictObject({
  /** Unique within the scenario, across every flaggable item. */
  id: kebabCase,
  /** `system` = credit alerts, "X joined the group", etc. */
  from: z.enum(["them", "me", "system"]),
  /** Display name inside group chats. */
  sender: LocalizedTextSchema.optional(),
  /** The whole message. Write exactly one of `text` or `segments`. */
  text: LocalizedTextSchema.optional(),
  /** The message in parts, so the player can flag single phrases. The message itself is then not flaggable. */
  segments: z.array(SegmentSchema).min(1).optional(),
  /** Wait before this message appears. Default 800. */
  delayMs: z.number().int().nonnegative().optional(),
  /** Display only: the time shown next to the sender's name, e.g. "09:14". */
  time: z.string().min(1).optional(),
  /** Set only if this message carries a red flag. Not allowed with `segments`. */
  redFlagId: kebabCase.optional(),
  /** Show it as a voice note, with the text as its transcript. Not for `system` messages. */
  voiceNote: VoiceNoteSchema.optional(),
});
export type Message = z.output<typeof MessageSchema>;

export const ChoiceSchema = z.strictObject({
  label: LocalizedTextSchema,
  nextNodeId: kebabCase,
  /**
   * Display only, call screens only: this choice is the red hang-up button. At most one per
   * node. On a real call you can always hang up, so every call node should offer it.
   */
  hangUp: z.boolean().optional(),
});
export type Choice = z.output<typeof ChoiceSchema>;

export const ContactSchema = z.strictObject({
  name: LocalizedTextSchema,
  subtitle: LocalizedTextSchema.optional(),
  /** Image path under /public. Without it the shell shows the first letter of the name. */
  avatar: z.string().min(1).optional(),
});
export type Contact = z.output<typeof ContactSchema>;

export const PROFILE_SLOTS = ["name", "headline", "location", "connections"] as const;
export type ProfileSlot = (typeof PROFILE_SLOTS)[number];

/**
 * How a line is drawn on a PDF page. Without one it is a body paragraph.
 * letterhead: company name on the first line, address lines under it.
 * title: centred heading such as "OFFER LETTER". meta: date or reference line.
 * term: a row in a terms table (label | value). clause: a numbered clause.
 * signature: a closing block; signed: the same with a handwritten signature of its second line.
 */
export const DOCUMENT_LOOKS = [
  "letterhead",
  "title",
  "meta",
  "paragraph",
  "term",
  "clause",
  "signature",
  "signed",
] as const;
export type DocumentLook = (typeof DOCUMENT_LOOKS)[number];

/** One inspectable fact in an evidence panel: a profile line, a company record entry, a PDF clause. */
export const FieldSchema = z.strictObject({
  id: kebabCase,
  label: LocalizedTextSchema.optional(),
  value: LocalizedTextSchema,
  redFlagId: kebabCase.optional(),
  /** Small print, e.g. a buried clause in a PDF. */
  finePrint: z.boolean().optional(),
  /**
   * Display only, profiles only: draws the field in the profile header under the avatar
   * instead of in a section card. Still flaggable.
   */
  slot: z.enum(PROFILE_SLOTS).optional(),
  /** Display only, documents only: how the line is drawn on the page. */
  look: z.enum(DOCUMENT_LOOKS).optional(),
});
export type Field = z.output<typeof FieldSchema>;

export const EVIDENCE_KINDS = ["profile", "company", "web-page", "document"] as const;

/** Something the player can open and inspect: a profile, a company page, a web page, a PDF. */
export const EvidencePanelSchema = z.strictObject({
  kind: z.enum(EVIDENCE_KINDS),
  /** Display only: draw a company panel as an official registry record. */
  variant: z.enum(["official-record"]).optional(),
  title: LocalizedTextSchema,
  subtitle: LocalizedTextSchema.optional(),
  /** Documents only: the running footer printed at the foot of every page. */
  footer: LocalizedTextSchema.optional(),
  /** For a document, one section per page. */
  sections: z
    .array(
      z.strictObject({
        heading: LocalizedTextSchema.optional(),
        fields: z.array(FieldSchema).min(1),
      }),
    )
    .min(1),
});
export type EvidencePanel = z.output<typeof EvidencePanelSchema>;
export type EvidencePanelInput = z.input<typeof EvidencePanelSchema>;

/** An email address the player can inspect and flag. Addresses are never translated. */
export const AddressSchema = z.strictObject({
  id: kebabCase,
  address: z.string().min(1),
  redFlagId: kebabCase.optional(),
});
export type Address = z.output<typeof AddressSchema>;

export const AttachmentSchema = z.strictObject({
  id: kebabCase,
  /** The name on the chip, possibly cut short. */
  shownName: z.string().min(1),
  /** The full filename, shown when the player taps the chip. */
  fullName: z.string().min(1),
  /** What the file really is, e.g. "PDF document" or "Android application (.apk)". */
  actualType: LocalizedTextSchema,
  sizeLabel: z.string().min(1).optional(),
  /** The evidence panel that previews it. */
  documentId: kebabCase.optional(),
  redFlagId: kebabCase.optional(),
});
export type Attachment = z.output<typeof AttachmentSchema>;

/** A button or link in an email. Inert: the destination is shown as text, never opened. */
export const LinkSchema = z.strictObject({
  id: kebabCase,
  text: LocalizedTextSchema,
  actualUrl: z.string().min(1),
  redFlagId: kebabCase.optional(),
});
export type Link = z.output<typeof LinkSchema>;

export const EmailSchema = z.strictObject({
  displayName: LocalizedTextSchema,
  from: AddressSchema,
  /** Show the From address next to the name. Otherwise the player taps the name to see it. */
  showFromAddress: z.boolean().optional(),
  replyTo: AddressSchema.optional(),
  to: AddressSchema,
  date: LocalizedTextSchema,
  subject: LocalizedTextSchema,
  /** One line for the inbox list. */
  preview: LocalizedTextSchema,
  /** Paragraphs, each a list of segments. */
  body: z.array(z.array(SegmentSchema).min(1)).min(1),
  attachments: z.array(AttachmentSchema).optional(),
  links: z.array(LinkSchema).optional(),
});
export type Email = z.output<typeof EmailSchema>;
export type EmailInput = z.input<typeof EmailSchema>;

/** Ids of evidence panels the player can open from a screen (view profile, check company page). */
const EvidenceRefsSchema = z.array(kebabCase).min(1).optional();

export const ThreadNodeSchema = z.strictObject({
  kind: z.literal("thread"),
  app: ThreadAppSchema,
  contact: ContactSchema,
  messages: z.array(MessageSchema).min(1),
  evidence: EvidenceRefsSchema,
  /**
   * Display only. "split": show the messages and the evidence panels as two panes with a
   * switch, so the player can compare them (needs `evidence`).
   */
  layout: z.enum(["split"]).optional(),
  choices: z.array(ChoiceSchema).min(1),
});
export type ThreadNode = z.output<typeof ThreadNodeSchema>;

/** One email, open in the reading pane. */
export const EmailNodeSchema = z.strictObject({
  kind: z.literal("email"),
  app: z.literal("gmail"),
  email: EmailSchema,
  evidence: EvidenceRefsSchema,
  choices: z.array(ChoiceSchema).min(1),
});
export type EmailNode = z.output<typeof EmailNodeSchema>;

/** The reply composer, shown before sending, so the player can check the To field. */
export const ComposeNodeSchema = z.strictObject({
  kind: z.literal("compose"),
  app: z.literal("gmail"),
  to: AddressSchema,
  subject: LocalizedTextSchema,
  body: LocalizedTextSchema,
  choices: z.array(ChoiceSchema).min(1),
});
export type ComposeNode = z.output<typeof ComposeNodeSchema>;

export const TRIAGE_LABELS = ["legit", "scam", "needs-checking"] as const;
export const TriageLabelSchema = z.enum(TRIAGE_LABELS);
export type TriageLabel = z.infer<typeof TriageLabelSchema>;

export const TriageItemSchema = z.strictObject({
  id: kebabCase,
  email: EmailSchema,
  correct: TriageLabelSchema,
  /** Why the correct label is correct. Shown in the debrief. */
  explanation: LocalizedTextSchema,
});
export type TriageItem = z.output<typeof TriageItemSchema>;

/** An inbox where the player labels every email Legit, Scam or Needs checking. */
export const TriageNodeSchema = z.strictObject({
  kind: z.literal("triage"),
  app: z.literal("gmail"),
  items: z.array(TriageItemSchema).min(1),
  nextNodeId: kebabCase,
});
export type TriageNode = z.output<typeof TriageNodeSchema>;

/* ------------------------------------------------------------------ */
/* Live voice calls (added for Authority)                              */
/* ------------------------------------------------------------------ */

/**
 * Text for the voice agent or the call judge, never shown to the player. Always English: the
 * agent is told separately which language to speak.
 */
const AgentText = z.string().trim().min(1);

/** Something the caller makes happen on the player's phone during a live call. */
export const CallEventSchema = z.discriminatedUnion("kind", [
  z.strictObject({
    /** A text message drops in from the top of the screen. */
    kind: z.literal("sms"),
    /** Sender id, e.g. "AX-NIMBNK". Never translated. */
    sender: z.string().min(1),
    /** With `otp`, write `{otp}` where the code goes. */
    text: LocalizedTextSchema,
    /**
     * The message carries a one-time code, made up fresh for every call. If the player reads it
     * out, the call records the signal `<eventId>.read`.
     */
    otp: z.literal(true).optional(),
    /** For the agent: when to trigger it. */
    cue: AgentText,
  }),
  z.strictObject({
    /** A payment request sheet. Paying records `<eventId>.paid`, declining `<eventId>.declined`. */
    kind: z.literal("payment"),
    payee: LocalizedTextSchema,
    /** Rupees. */
    amount: z.number().int().positive(),
    note: LocalizedTextSchema.optional(),
    cue: AgentText,
  }),
  z.strictObject({
    /** A file arrives in a chat app. Opening it shows an evidence panel and records `<eventId>.opened`. */
    kind: z.literal("document"),
    app: z.enum(["whatsapp", "sms"]),
    sender: LocalizedTextSchema,
    fileName: z.string().min(1),
    /** The evidence panel (kind "document") that opens. */
    panelId: kebabCase,
    cue: AgentText,
  }),
]);
export type CallEvent = z.output<typeof CallEventSchema>;

/** Someone the player can quietly message during the call. Sending records `<id>.sent`. */
export const LifelineSchema = z.strictObject({
  id: kebabCase,
  name: LocalizedTextSchema,
  /** What the player sends. */
  message: LocalizedTextSchema,
  /** Their answer. */
  reply: LocalizedTextSchema,
});
export type Lifeline = z.output<typeof LifelineSchema>;

/** Signals a live call can record, from its events and lifelines. */
export const CALL_SIGNAL_RE = /^[a-z0-9]+(-[a-z0-9]+)*\.(read|paid|declined|opened|sent)$/;

export const LiveCallNodeSchema = z.strictObject({
  kind: z.literal("live-call"),
  app: z.literal("call"),
  /** A video call (the "digital arrest" look). Display only. */
  video: z.boolean().optional(),
  caller: z.strictObject({
    name: LocalizedTextSchema,
    /** Never translated, e.g. "+91 70000 48213". */
    number: z.string().min(1),
    /** A line under the number, e.g. "Mobile · Delhi". */
    label: LocalizedTextSchema.optional(),
  }),
  /** The made-up identity the player uses on the call, so they never say real details. */
  player: z.strictObject({
    name: z.string().min(1),
    details: z
      .array(z.strictObject({ label: LocalizedTextSchema, value: z.string().min(1) }))
      .min(1),
  }),
  /** The voice agent: who it plays and how the call goes. English, never shown to the player. */
  agent: z.strictObject({
    /** A Gemini prebuilt voice, e.g. "Orus". */
    voice: z.string().min(1),
    /** Who the caller is and how they talk. */
    character: AgentText,
    /** The call's stages in order. `redFlagIds` are the red flags the caller uses there. */
    stages: z
      .array(
        z.strictObject({
          name: AgentText,
          say: AgentText,
          redFlagIds: z.array(kebabCase).optional(),
        }),
      )
      .min(1),
    /** How the caller answers each kind of player. */
    responses: z
      .array(
        z.strictObject({
          ifPlayer: AgentText,
          reply: AgentText,
          redFlagIds: z.array(kebabCase).optional(),
        }),
      )
      .optional(),
    /** Extra rules for this caller. */
    rules: z.array(AgentText).optional(),
  }),
  events: z.record(kebabCase, CallEventSchema).optional(),
  lifelines: z.array(LifelineSchema).optional(),
  /** How the call judge rates the player. English. */
  rubric: z.strictObject({
    goodMoves: z.array(AgentText).min(1),
    mistakes: z.array(AgentText).min(1),
    /** Calibration: how a player like this should be rated (the source guide's three users). */
    examples: z
      .array(z.strictObject({ player: AgentText, rating: z.number().min(0).max(10) }))
      .optional(),
  }),
  /**
   * Where the call leads, in priority order. An outcome whose `events` signals happened is chosen
   * outright; otherwise the judge picks one by `when`. The last outcome must have no `events`:
   * it is the default.
   */
  outcomes: z
    .array(
      z.strictObject({
        id: kebabCase,
        when: AgentText,
        events: z.array(z.string().regex(CALL_SIGNAL_RE)).min(1).optional(),
        nextNodeId: kebabCase,
      }),
    )
    .min(1),
  /** The same call with reply options, for players without a mic or when voice is off. */
  scriptedNodeId: kebabCase,
  /** Where declining the call leads. Without it there is no Decline button. */
  declineNodeId: kebabCase.optional(),
  /** The call ends by itself after this long. Default 6. */
  maxMinutes: z.number().int().min(1).max(12).optional(),
});
export type LiveCallNode = z.output<typeof LiveCallNodeSchema>;
export type LiveCallNodeInput = z.input<typeof LiveCallNodeSchema>;

export const OUTCOME_RESULTS = [
  "safe",
  "loss",
  "partial-loss",
  "compromised",
  "missed-opportunity",
] as const;
export const OutcomeResultSchema = z.enum(OUTCOME_RESULTS);
export type OutcomeResult = z.infer<typeof OutcomeResultSchema>;

export const OutcomeNodeSchema = z.strictObject({
  kind: z.literal("outcome"),
  result: OutcomeResultSchema,
  title: LocalizedTextSchema,
  body: LocalizedTextSchema,
  /** Rupees. Negative = lost. */
  moneyDelta: z.number().int().optional(),
  /** The decision node the player can rewind to. */
  rewindToNodeId: kebabCase.optional(),
});
export type OutcomeNode = z.output<typeof OutcomeNodeSchema>;

export const ScenarioNodeSchema = z.discriminatedUnion("kind", [
  ThreadNodeSchema,
  EmailNodeSchema,
  ComposeNodeSchema,
  TriageNodeSchema,
  LiveCallNodeSchema,
  OutcomeNodeSchema,
]);
export type ScenarioNode = z.output<typeof ScenarioNodeSchema>;
/** Every node the player plays (everything but an outcome). */
export type PlayNode = Exclude<ScenarioNode, OutcomeNode>;

export const RedFlagSchema = z.strictObject({
  label: LocalizedTextSchema,
  tactic: TacticSchema,
  explanation: LocalizedTextSchema,
});
export type RedFlag = z.output<typeof RedFlagSchema>;
export type RedFlagInput = z.input<typeof RedFlagSchema>;

const ScenarioShape = z.strictObject({
  id: kebabCase,
  dojoId: DojoIdSchema,
  title: LocalizedTextSchema,
  /** One line for the dojo page. */
  summary: LocalizedTextSchema,
  /** true = a real message the player should trust. */
  legit: z.boolean(),
  /** true = no primer, no hints. */
  coldRun: z.boolean().optional(),
  primer: z
    .strictObject({
      title: LocalizedTextSchema,
      body: LocalizedTextSchema,
      /** "Your situation": who the player is and what just happened, in a sentence or two. */
      setup: LocalizedTextSchema.optional(),
      /** "Ask yourself": questions to keep in mind. Easy scenarios only; they never point at a red flag. */
      watchFor: z.array(LocalizedTextSchema).min(1).max(4).optional(),
    })
    .optional(),
  startNodeId: kebabCase,
  nodes: z.record(kebabCase, ScenarioNodeSchema),
  /** Panels the player can open: profiles, company pages, web pages, PDFs. */
  evidence: z.record(kebabCase, EvidencePanelSchema).optional(),
  redFlags: z.record(kebabCase, RedFlagSchema),
  debrief: z.strictObject({
    rule: LocalizedTextSchema,
    /** A short paragraph under the rule, explaining the pattern. */
    summary: LocalizedTextSchema.optional(),
    realWorldAction: LocalizedTextSchema,
  }),
});

/** A parsed scenario before the graph checks. Same shape as `Scenario`. */
export type ScenarioData = z.output<typeof ScenarioShape>;

/** Cross-field rules from CONTEXT.md §5 that a plain object schema can't express. */
function checkScenarioGraph(s: ScenarioData, ctx: z.RefinementCtx): void {
  const issue = (path: PropertyKey[], message: string) =>
    ctx.addIssue({ code: "custom", path, message });

  const nodeIds = new Set(Object.keys(s.nodes));
  const panelIds = new Set(Object.keys(s.evidence ?? {}));

  if (!nodeIds.has(s.startNodeId)) {
    issue(["startNodeId"], `startNodeId "${s.startNodeId}" is not a node`);
  }

  for (const [nodeId, node] of Object.entries(s.nodes)) {
    const at = ["nodes", nodeId];
    if (node.kind === "outcome") {
      if (node.rewindToNodeId !== undefined) {
        const target = s.nodes[node.rewindToNodeId];
        if (target === undefined) {
          issue([...at, "rewindToNodeId"], `rewindToNodeId "${node.rewindToNodeId}" is not a node`);
        } else if (target.kind === "outcome") {
          issue(
            [...at, "rewindToNodeId"],
            `rewindToNodeId "${node.rewindToNodeId}" must point to a thread, email, compose, triage or live-call node`,
          );
        }
      }
      continue;
    }

    for (const next of nextNodeIds(node)) {
      if (!nodeIds.has(next)) issue(at, `nextNodeId "${next}" is not a node`);
    }

    if (node.kind === "live-call") checkLiveCall(node, at, s, panelIds, issue);

    if (node.kind === "thread") {
      const hangUps = node.choices.filter((c) => c.hangUp === true).length;
      if (hangUps > 0 && node.app !== "call") {
        issue([...at, "choices"], `hangUp choices are for call screens (app "call") only`);
      }
      if (hangUps > 1) issue([...at, "choices"], `a node can have at most one hangUp choice`);
    }

    if (node.kind === "thread" || node.kind === "email") {
      for (const panelId of node.evidence ?? []) {
        if (!panelIds.has(panelId))
          issue([...at, "evidence"], `evidence "${panelId}" is not a panel`);
      }
    }

    if (node.kind === "thread" && node.layout === "split" && node.evidence === undefined) {
      issue([...at, "layout"], `layout "split" needs evidence panels to show`);
    }

    if (node.kind === "thread") {
      node.messages.forEach((message, i) => {
        const hasText = message.text !== undefined;
        const hasSegments = message.segments !== undefined;
        if (hasText === hasSegments) {
          issue(
            [...at, "messages", i],
            `message "${message.id}" needs exactly one of text or segments`,
          );
        }
        if (message.voiceNote !== undefined && message.from === "system") {
          issue(
            [...at, "messages", i, "voiceNote"],
            `message "${message.id}" is a system message and can't be a voice note`,
          );
        }
        if (hasSegments && message.redFlagId !== undefined) {
          issue(
            [...at, "messages", i, "redFlagId"],
            `message "${message.id}" has segments: put redFlagId on a segment instead`,
          );
        }
      });
    }

    const emails =
      node.kind === "email"
        ? [node.email]
        : node.kind === "triage"
          ? node.items.map((i) => i.email)
          : [];
    for (const email of emails) {
      for (const attachment of email.attachments ?? []) {
        if (attachment.documentId !== undefined && !panelIds.has(attachment.documentId)) {
          issue(
            at,
            `attachment "${attachment.id}" documentId "${attachment.documentId}" is not a panel`,
          );
        }
      }
    }

    if (node.kind === "triage") {
      const itemIds = new Set<string>();
      for (const item of node.items) {
        if (itemIds.has(item.id)) issue(at, `triage item id "${item.id}" is used more than once`);
        itemIds.add(item.id);
      }
    }

    const segmentLists =
      node.kind === "thread"
        ? node.messages.map((m) => m.segments ?? [])
        : emails.flatMap((e) => e.body);
    for (const segments of segmentLists) {
      for (const segment of segments) {
        if (segment.redFlagId !== undefined && segment.id === undefined) {
          issue(at, `a segment with redFlagId "${segment.redFlagId}" needs an id`);
        }
      }
    }
  }

  for (const [panelId, panel] of Object.entries(s.evidence ?? {})) {
    if (panel.variant === "official-record" && panel.kind !== "company") {
      issue(["evidence", panelId, "variant"], `variant "official-record" needs kind "company"`);
    }
    if (panel.kind === "profile") continue;
    panel.sections.forEach((section, i) =>
      section.fields.forEach((field, j) => {
        if (field.slot !== undefined) {
          issue(
            ["evidence", panelId, "sections", i, "fields", j, "slot"],
            `field "${field.id}" has slot "${field.slot}", but slots are for profile panels only`,
          );
        }
      }),
    );
  }

  const seenIds = new Set<string>();
  const usedRedFlags = new Set<string>();
  for (const item of collectFlaggables(s)) {
    if (seenIds.has(item.id)) {
      issue([], `flaggable id "${item.id}" is used more than once in this scenario`);
    }
    seenIds.add(item.id);
    if (item.redFlagId !== undefined) {
      usedRedFlags.add(item.redFlagId);
      if (!(item.redFlagId in s.redFlags)) {
        issue([], `redFlagId "${item.redFlagId}" on "${item.id}" is not defined in redFlags`);
      }
    }
  }

  for (const redFlagId of Object.keys(s.redFlags)) {
    if (!usedRedFlags.has(redFlagId)) {
      issue(["redFlags", redFlagId], `red flag "${redFlagId}" is not used by any message or field`);
    }
  }

  if (nodeIds.has(s.startNodeId) && !canReachOutcome(s)) {
    issue(["startNodeId"], "no outcome node can be reached from startNodeId");
  }
}

/** A live call's references, signals and outcome order. */
function checkLiveCall(
  node: LiveCallNode,
  at: PropertyKey[],
  s: ScenarioData,
  panelIds: ReadonlySet<string>,
  issue: (path: PropertyKey[], message: string) => void,
): void {
  const events = node.events ?? {};
  const signals = new Set<string>();
  for (const [eventId, event] of Object.entries(events)) {
    switch (event.kind) {
      case "sms":
        if (event.otp === true) {
          signals.add(`${eventId}.read`);
          const texts = [event.text.en, event.text.hinglish].filter((t) => t !== undefined);
          if (texts.some((t) => !t.includes("{otp}"))) {
            issue([...at, "events", eventId, "text"], `an otp message must contain "{otp}"`);
          }
        }
        break;
      case "payment":
        signals.add(`${eventId}.paid`);
        signals.add(`${eventId}.declined`);
        break;
      case "document":
        signals.add(`${eventId}.opened`);
        if (!panelIds.has(event.panelId)) {
          issue([...at, "events", eventId, "panelId"], `panelId "${event.panelId}" is not a panel`);
        } else if (s.evidence?.[event.panelId]?.kind !== "document") {
          issue(
            [...at, "events", eventId, "panelId"],
            `panel "${event.panelId}" must be a document`,
          );
        }
        break;
    }
  }
  const lifelineIds = new Set<string>();
  for (const lifeline of node.lifelines ?? []) {
    if (lifelineIds.has(lifeline.id) || lifeline.id in events) {
      issue([...at, "lifelines"], `lifeline id "${lifeline.id}" is used more than once`);
    }
    lifelineIds.add(lifeline.id);
    signals.add(`${lifeline.id}.sent`);
  }

  const lines = [
    ...node.agent.stages.map((line, i) => ({ line, path: ["stages", i] })),
    ...(node.agent.responses ?? []).map((line, i) => ({ line, path: ["responses", i] })),
  ];
  for (const { line, path } of lines) {
    for (const redFlagId of line.redFlagIds ?? []) {
      if (!(redFlagId in s.redFlags)) {
        issue(
          [...at, "agent", ...path, "redFlagIds"],
          `redFlagId "${redFlagId}" is not defined in redFlags`,
        );
      }
    }
  }

  const outcomeIds = new Set<string>();
  node.outcomes.forEach((outcome, i) => {
    if (outcomeIds.has(outcome.id)) {
      issue([...at, "outcomes", i, "id"], `outcome id "${outcome.id}" is used more than once`);
    }
    outcomeIds.add(outcome.id);
    for (const signal of outcome.events ?? []) {
      if (!signals.has(signal)) {
        issue([...at, "outcomes", i, "events"], `signal "${signal}" can't happen on this call`);
      }
    }
  });
  if (node.outcomes.at(-1)?.events !== undefined) {
    issue([...at, "outcomes"], "the last outcome is the default and must have no events");
  }
}

function canReachOutcome(s: ScenarioData): boolean {
  const visited = new Set<string>();
  const queue = [s.startNodeId];
  while (queue.length > 0) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    const node = s.nodes[id];
    if (node === undefined) continue;
    if (node.kind === "outcome") return true;
    queue.push(...nextNodeIds(node));
  }
  return false;
}

export const ScenarioSchema = ScenarioShape.superRefine(checkScenarioGraph);
/** A parsed scenario: every text field is `{ en, hinglish? }`. */
export type Scenario = z.output<typeof ScenarioSchema>;
/** What a scenario file passes to `defineScenario()`: text fields may be plain strings. */
export type ScenarioInput = z.input<typeof ScenarioSchema>;

export const DojoSchema = z
  .strictObject({
    id: DojoIdSchema,
    /** Position on the home path, starting at 1. */
    order: z.number().int().positive(),
    name: LocalizedTextSchema,
    tagline: LocalizedTextSchema,
    scenarios: z.array(ScenarioSchema),
    /** The short list of lessons shown on the dojo page. */
    takeaways: z.array(LocalizedTextSchema).min(1).optional(),
  })
  .superRefine((dojo, ctx) => {
    const ids = new Set<string>();
    dojo.scenarios.forEach((scenario, i) => {
      if (scenario.dojoId !== dojo.id) {
        ctx.addIssue({
          code: "custom",
          path: ["scenarios", i, "dojoId"],
          message: `scenario "${scenario.id}" has dojoId "${scenario.dojoId}" but lives in dojo "${dojo.id}"`,
        });
      }
      if (ids.has(scenario.id)) {
        ctx.addIssue({
          code: "custom",
          path: ["scenarios", i, "id"],
          message: `scenario id "${scenario.id}" is used more than once in this dojo`,
        });
      }
      ids.add(scenario.id);
    });
  });
export type Dojo = z.output<typeof DojoSchema>;
export type DojoInput = z.input<typeof DojoSchema>;
