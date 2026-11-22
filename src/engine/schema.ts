import { z } from "zod";

/**
 * Scenario and dojo schemas. The TypeScript types are inferred from these, so the
 * schema is the single source of truth. See docs/CONTEXT.md §5.
 */

const kebabCase = z
  .string()
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "must be kebab-case (lowercase letters, digits and dashes)");

export const APP_THEMES = ["whatsapp", "telegram", "instagram", "sms", "upi", "call"] as const;
export const AppThemeSchema = z.enum(APP_THEMES);
export type AppTheme = z.infer<typeof AppThemeSchema>;

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
] as const;
export const TacticSchema = z.enum(TACTICS);
export type Tactic = z.infer<typeof TacticSchema>;

export const DOJO_IDS = ["easy-money", "dream-job", "trust-me-bro", "authority"] as const;
export const DojoIdSchema = z.enum(DOJO_IDS);
export type DojoId = z.infer<typeof DojoIdSchema>;

export const MessageSchema = z.strictObject({
  /** Unique within the scenario. */
  id: kebabCase,
  /** `system` = credit alerts, "X joined the group", etc. */
  from: z.enum(["them", "me", "system"]),
  /** Display name inside group chats. */
  sender: z.string().min(1).optional(),
  text: z.string().min(1),
  /** Wait before this message appears. Default 800. */
  delayMs: z.number().int().nonnegative().optional(),
  /** Set only if this message carries a red flag. */
  redFlagId: kebabCase.optional(),
});
export type Message = z.infer<typeof MessageSchema>;

export const ChoiceSchema = z.strictObject({
  label: z.string().min(1),
  nextNodeId: kebabCase,
});
export type Choice = z.infer<typeof ChoiceSchema>;

export const ContactSchema = z.strictObject({
  name: z.string().min(1),
  subtitle: z.string().min(1).optional(),
  /** Image path under /public. Without it the shell shows the first letter of the name. */
  avatar: z.string().min(1).optional(),
});
export type Contact = z.infer<typeof ContactSchema>;

export const ThreadNodeSchema = z.strictObject({
  kind: z.literal("thread"),
  app: AppThemeSchema,
  contact: ContactSchema,
  messages: z.array(MessageSchema).min(1),
  choices: z.array(ChoiceSchema).min(1),
});
export type ThreadNode = z.infer<typeof ThreadNodeSchema>;

export const OUTCOME_RESULTS = ["safe", "loss", "partial-loss", "missed-opportunity"] as const;
export const OutcomeResultSchema = z.enum(OUTCOME_RESULTS);
export type OutcomeResult = z.infer<typeof OutcomeResultSchema>;

export const OutcomeNodeSchema = z.strictObject({
  kind: z.literal("outcome"),
  result: OutcomeResultSchema,
  title: z.string().min(1),
  body: z.string().min(1),
  /** Rupees. Negative = lost. */
  moneyDelta: z.number().int().optional(),
  /** The decision node the player can rewind to. */
  rewindToNodeId: kebabCase.optional(),
});
export type OutcomeNode = z.infer<typeof OutcomeNodeSchema>;

export const ScenarioNodeSchema = z.discriminatedUnion("kind", [
  ThreadNodeSchema,
  OutcomeNodeSchema,
]);
export type ScenarioNode = z.infer<typeof ScenarioNodeSchema>;

export const RedFlagSchema = z.strictObject({
  label: z.string().min(1),
  tactic: TacticSchema,
  explanation: z.string().min(1),
});
export type RedFlag = z.infer<typeof RedFlagSchema>;

const ScenarioShape = z.strictObject({
  id: kebabCase,
  dojoId: DojoIdSchema,
  title: z.string().min(1),
  /** One line for the dojo page. */
  summary: z.string().min(1),
  /** true = a real message the player should trust. */
  legit: z.boolean(),
  /** true = no primer, no hints. */
  coldRun: z.boolean().optional(),
  primer: z.strictObject({ title: z.string().min(1), body: z.string().min(1) }).optional(),
  startNodeId: kebabCase,
  nodes: z.record(kebabCase, ScenarioNodeSchema),
  redFlags: z.record(kebabCase, RedFlagSchema),
  debrief: z.strictObject({ rule: z.string().min(1), realWorldAction: z.string().min(1) }),
});

type ScenarioShapeT = z.infer<typeof ScenarioShape>;

/** Cross-field rules from CONTEXT.md §5 that a plain object schema can't express. */
function checkScenarioGraph(s: ScenarioShapeT, ctx: z.RefinementCtx): void {
  const issue = (path: PropertyKey[], message: string) =>
    ctx.addIssue({ code: "custom", path, message });

  const nodeIds = new Set(Object.keys(s.nodes));

  if (!nodeIds.has(s.startNodeId)) {
    issue(["startNodeId"], `startNodeId "${s.startNodeId}" is not a node`);
  }

  const seenMessageIds = new Set<string>();
  const usedRedFlags = new Set<string>();

  for (const [nodeId, node] of Object.entries(s.nodes)) {
    if (node.kind === "thread") {
      node.choices.forEach((choice, i) => {
        if (!nodeIds.has(choice.nextNodeId)) {
          issue(
            ["nodes", nodeId, "choices", i, "nextNodeId"],
            `nextNodeId "${choice.nextNodeId}" is not a node`,
          );
        }
      });
      node.messages.forEach((message, i) => {
        if (seenMessageIds.has(message.id)) {
          issue(
            ["nodes", nodeId, "messages", i, "id"],
            `message id "${message.id}" is used more than once in this scenario`,
          );
        }
        seenMessageIds.add(message.id);
        if (message.redFlagId !== undefined) {
          usedRedFlags.add(message.redFlagId);
          if (!(message.redFlagId in s.redFlags)) {
            issue(
              ["nodes", nodeId, "messages", i, "redFlagId"],
              `redFlagId "${message.redFlagId}" is not defined in redFlags`,
            );
          }
        }
      });
    } else if (node.rewindToNodeId !== undefined) {
      const target = s.nodes[node.rewindToNodeId];
      if (target === undefined) {
        issue(
          ["nodes", nodeId, "rewindToNodeId"],
          `rewindToNodeId "${node.rewindToNodeId}" is not a node`,
        );
      } else if (target.kind !== "thread") {
        issue(
          ["nodes", nodeId, "rewindToNodeId"],
          `rewindToNodeId "${node.rewindToNodeId}" must point to a thread node`,
        );
      }
    }
  }

  for (const redFlagId of Object.keys(s.redFlags)) {
    if (!usedRedFlags.has(redFlagId)) {
      issue(["redFlags", redFlagId], `red flag "${redFlagId}" is not used by any message`);
    }
  }

  if (nodeIds.has(s.startNodeId) && !canReachOutcome(s)) {
    issue(["startNodeId"], "no outcome node can be reached from startNodeId");
  }
}

function canReachOutcome(s: ScenarioShapeT): boolean {
  const visited = new Set<string>();
  const queue = [s.startNodeId];
  while (queue.length > 0) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    const node = s.nodes[id];
    if (node === undefined) continue;
    if (node.kind === "outcome") return true;
    for (const choice of node.choices) queue.push(choice.nextNodeId);
  }
  return false;
}

export const ScenarioSchema = ScenarioShape.superRefine(checkScenarioGraph);
export type Scenario = z.infer<typeof ScenarioSchema>;

export const DojoSchema = z
  .strictObject({
    id: DojoIdSchema,
    /** Position on the home path, starting at 1. */
    order: z.number().int().positive(),
    name: z.string().min(1),
    tagline: z.string().min(1),
    scenarios: z.array(ScenarioSchema),
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
export type Dojo = z.infer<typeof DojoSchema>;
