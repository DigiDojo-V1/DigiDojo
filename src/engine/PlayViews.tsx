"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import {
  Building2,
  Check,
  FileText,
  Globe,
  Landmark,
  Paperclip,
  Search,
  SendHorizontal,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale, useT, useText } from "@/i18n/hooks";
import { cn } from "@/lib/utils";
import { ComposeBody } from "@/shells/ComposeShell";
import { EvidenceSheet } from "@/shells/EvidenceSheet";
import { PanelBody } from "@/shells/evidence/PanelViews";
import { InboxList, shortAddress, TriageLabelBar, type InboxRow } from "@/shells/InboxShell";
import { MailBody, MailShell } from "@/shells/MailShell";
import { emailOpenIds, panelFieldIds } from "./evidence";
import type { Choice, ComposeNode, EmailNode, EvidencePanel, Scenario, TriageNode } from "./schema";
import { useRunStore } from "./store";
import { toMailView, toPanelView } from "./views";

/* ------------------------------------------------------------------ */
/* Shared pieces                                                       */
/* ------------------------------------------------------------------ */

/** The reply choices under a screen. `composer` = suggested replies over a message box; `mail` = a mail app's reply bar. */
export function ChoiceFooter({
  choices,
  variant = "default",
}: {
  choices: readonly Choice[];
  variant?: "default" | "composer" | "mail";
}) {
  const choose = useRunStore((s) => s.choose);
  const t = useT();
  const text = useText();

  if (variant === "composer") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky bottom-0 z-30 border-t border-slate-200 bg-white px-3 pt-2.5 pb-3"
      >
        <p className="mb-2 text-xs font-semibold text-slate-500">{t("composer.suggested")}</p>
        <div className="space-y-2">
          {choices.map((choice, i) => (
            <button
              key={`${i}-${choice.nextNodeId}`}
              type="button"
              onClick={() => choose(choice)}
              className="flex min-h-11 w-full items-center rounded-2xl border border-indigo-700 px-4 py-2 text-left text-[15px] leading-snug font-semibold text-indigo-800 transition-colors hover:bg-indigo-50 active:bg-indigo-100"
            >
              {text(choice.label)}
            </button>
          ))}
        </div>
        <div
          aria-hidden
          className="mt-3 flex h-11 items-center gap-2 rounded-lg bg-slate-100 px-3 text-sm text-slate-400"
        >
          <span className="flex-1">{t("composer.placeholder")}</span>
          <Paperclip className="size-4" />
          <SendHorizontal className="size-4" />
        </div>
      </motion.div>
    );
  }

  if (variant === "mail") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky bottom-0 z-30 space-y-2 border-t border-slate-200 bg-white/95 p-3 backdrop-blur"
      >
        <p className="text-xs font-medium text-slate-500">{t("thread.prompt")}</p>
        {choices.map((choice, i) => (
          <button
            key={`${i}-${choice.nextNodeId}`}
            type="button"
            onClick={() => choose(choice)}
            // Every choice looks the same: styling must never hint at the right answer.
            className="flex min-h-11 w-full items-center rounded-full border border-slate-300 px-4 py-2 text-left text-[15px] leading-snug text-slate-800 transition-colors hover:border-blue-600 hover:bg-blue-50 active:bg-blue-100"
          >
            {text(choice.label)}
          </button>
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky bottom-0 z-30 space-y-2 border-t bg-white/95 p-3 backdrop-blur"
    >
      <p className="text-xs font-medium text-muted-foreground">{t("thread.prompt")}</p>
      {choices.map((choice, i) => (
        <Button
          key={`${i}-${choice.nextNodeId}`}
          variant="outline"
          className="h-auto w-full justify-start py-2.5 text-left text-[15px] whitespace-normal"
          onClick={() => choose(choice)}
        >
          {text(choice.label)}
        </Button>
      ))}
    </motion.div>
  );
}

/**
 * Opening evidence panels. Opening one reveals every field in it, so the debrief can tell
 * "saw it but didn't flag" from "never checked".
 */
export function useEvidence(scenario: Scenario) {
  const [openId, setOpenId] = useState<string | undefined>(undefined);
  const reveal = useRunStore((s) => s.reveal);
  const flagged = useRunStore((s) => s.flagged);
  const toggleFlag = useRunStore((s) => s.toggleFlag);
  const locale = useLocale();

  const open = (panelId: string) => {
    const panel = scenario.evidence?.[panelId];
    if (panel === undefined) return;
    reveal(panelFieldIds(panel));
    setOpenId(panelId);
  };

  const panel = openId === undefined ? undefined : scenario.evidence?.[openId];
  const sheet =
    openId !== undefined && panel !== undefined ? (
      <EvidenceSheet
        panel={toPanelView(openId, panel, locale)}
        flaggedIds={flagged}
        onToggleFlag={toggleFlag}
        onClose={() => setOpenId(undefined)}
      />
    ) : null;

  return { open, sheet };
}

function panelIcon(panel: EvidencePanel): LucideIcon {
  if (panel.variant === "official-record") return Landmark;
  switch (panel.kind) {
    case "profile":
      return UserRound;
    case "company":
      return Building2;
    case "web-page":
      return Globe;
    case "document":
      return FileText;
  }
}

function panelShortcutKey(panel: EvidencePanel) {
  return panel.variant === "official-record"
    ? ("evidence.open.record" as const)
    : (`evidence.open.${panel.kind}` as const);
}

/**
 * "Check before you decide" buttons: view profile, company page, careers page.
 * `network` = shortcut chips under a professional-network chat; `mail` = a slim verify row.
 */
export function EvidenceToolbar({
  scenario,
  panelIds,
  onOpen,
  variant = "default",
}: {
  scenario: Scenario;
  panelIds: readonly string[] | undefined;
  onOpen: (panelId: string) => void;
  variant?: "default" | "network" | "mail";
}) {
  const t = useT();
  const text = useText();
  const seen = useRunStore((s) => s.seen);
  if (panelIds === undefined || panelIds.length === 0) return null;
  const panels = panelIds.flatMap((id) => {
    const panel = scenario.evidence?.[id];
    return panel === undefined ? [] : [{ id, panel }];
  });

  if (variant === "default") {
    return (
      <div className="flex flex-wrap items-center gap-1.5 border-b bg-white px-3 py-2">
        <span className="text-xs text-neutral-500">{t("thread.evidenceHint")}</span>
        {panels.map(({ id, panel }) => (
          <button
            key={id}
            type="button"
            onClick={() => onOpen(id)}
            className="flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium"
          >
            <Search className="size-3" /> {text(panel.title)}
          </button>
        ))}
      </div>
    );
  }

  const network = variant === "network";
  return (
    <div
      className={cn(
        "border-b px-3 py-1.5",
        network ? "border-slate-200 bg-white" : "border-slate-200 bg-slate-50",
      )}
    >
      <p className="text-[11px] font-medium text-slate-500">
        {network ? t("thread.evidenceHint") : t("mail.verify")}
      </p>
      <div className="-mx-3 flex [scrollbar-width:none] gap-2 overflow-x-auto px-3 pt-1 pb-0.5">
        {panels.map(({ id, panel }) => {
          const Icon = panelIcon(panel);
          const checked = panelFieldIds(panel).every((f) => seen.includes(f));
          return (
            <button
              key={id}
              type="button"
              onClick={() => onOpen(id)}
              title={text(panel.title)}
              className={cn(
                "flex h-11 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-semibold transition-colors",
                network
                  ? "border-indigo-700 text-indigo-800 hover:bg-indigo-50"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100",
              )}
            >
              <Icon className="size-4" aria-hidden />
              {t(panelShortcutKey(panel))}
              {checked && (
                <Check className="size-3.5 text-emerald-600" aria-label={t("evidence.checked")} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * The evidence pane of a split chat: the node's panels stacked in one scroll, so the player can
 * compare them. A panel counts as opened (its fields revealed) once it scrolls into view.
 */
export function EvidenceStack({
  scenario,
  panelIds,
}: {
  scenario: Scenario;
  panelIds: readonly string[];
}) {
  const t = useT();
  const locale = useLocale();
  const flagged = useRunStore((s) => s.flagged);
  const toggleFlag = useRunStore((s) => s.toggleFlag);
  return (
    <div className="bg-slate-100 pb-6">
      <p className="px-4 pt-3 pb-1 text-xs text-slate-500">{t("split.hint")}</p>
      <p className="px-4 pb-2 text-xs text-slate-500">{t("evidence.hint")}</p>
      {panelIds.map((id) => {
        const panel = scenario.evidence?.[id];
        if (panel === undefined) return null;
        const Icon = panelIcon(panel);
        return (
          <RevealOnView key={id} panel={panel}>
            <h2 className="flex items-center gap-1.5 px-4 pt-4 pb-2 text-xs font-semibold tracking-wide text-slate-500 uppercase">
              <Icon className="size-3.5" aria-hidden /> {t(panelShortcutKey(panel))}
            </h2>
            <PanelBody
              panel={toPanelView(id, panel, locale)}
              flaggedIds={flagged}
              onToggleFlag={toggleFlag}
            />
          </RevealOnView>
        );
      })}
    </div>
  );
}

/** Reveals a panel's fields once enough of it is on screen. */
function RevealOnView({ panel, children }: { panel: EvidencePanel; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const reveal = useRunStore((s) => s.reveal);
  useEffect(() => {
    const el = ref.current;
    if (el === null) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const viewport = entry.rootBounds?.height ?? window.innerHeight;
          const enough =
            entry.intersectionRatio >= 0.4 || entry.intersectionRect.height >= viewport * 0.4;
          if (entry.isIntersecting && enough) {
            reveal(panelFieldIds(panel));
            observer.disconnect();
          }
        }
      },
      { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.6, 0.8, 1] },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [panel, reveal]);
  return <section ref={ref}>{children}</section>;
}

/** How many items inside these panels the player has flagged. */
export function flaggedInPanels(
  scenario: Scenario,
  panelIds: readonly string[],
  flagged: readonly string[],
): number {
  const ids = new Set(
    panelIds.flatMap((id) => {
      const panel = scenario.evidence?.[id];
      return panel === undefined ? [] : panelFieldIds(panel);
    }),
  );
  return flagged.filter((id) => ids.has(id)).length;
}

/* ------------------------------------------------------------------ */
/* Email                                                               */
/* ------------------------------------------------------------------ */

export function EmailView({
  scenario,
  node,
  backHref,
}: {
  scenario: Scenario;
  node: EmailNode;
  backHref: string;
}) {
  const seen = useRunStore((s) => s.seen);
  const flagged = useRunStore((s) => s.flagged);
  const reveal = useRunStore((s) => s.reveal);
  const toggleFlag = useRunStore((s) => s.toggleFlag);
  const locale = useLocale();
  const t = useT();
  const evidence = useEvidence(scenario);

  useEffect(() => reveal(emailOpenIds(node.email)), [node.email, reveal]);
  const mail = useMemo(() => toMailView(node.email, locale), [node.email, locale]);

  return (
    <>
      <MailShell
        title={t("mail.inbox")}
        backHref={backHref}
        hint={scenario.coldRun === true ? undefined : t("mail.hint")}
        toolbar={
          <EvidenceToolbar
            scenario={scenario}
            panelIds={node.evidence}
            onOpen={evidence.open}
            variant="mail"
          />
        }
        footer={<ChoiceFooter choices={node.choices} variant="mail" />}
      >
        <MailBody
          mail={mail}
          seenIds={seen}
          flaggedIds={flagged}
          onToggleFlag={toggleFlag}
          onReveal={reveal}
          onOpenPanel={evidence.open}
        />
      </MailShell>
      {evidence.sheet}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Compose (reply preview)                                             */
/* ------------------------------------------------------------------ */

export function ComposeView({ node, backHref }: { node: ComposeNode; backHref: string }) {
  const flagged = useRunStore((s) => s.flagged);
  const reveal = useRunStore((s) => s.reveal);
  const toggleFlag = useRunStore((s) => s.toggleFlag);
  const t = useT();
  const text = useText();

  useEffect(() => reveal([node.to.id]), [node.to.id, reveal]);

  return (
    <MailShell
      title={t("mail.reply")}
      backHref={backHref}
      variant="compose"
      footer={<ChoiceFooter choices={node.choices} variant="mail" />}
    >
      <ComposeBody
        to={{ id: node.to.id, address: node.to.address }}
        subject={text(node.subject)}
        body={text(node.body)}
        flaggedIds={flagged}
        onToggleFlag={toggleFlag}
      />
    </MailShell>
  );
}

/* ------------------------------------------------------------------ */
/* Inbox triage                                                        */
/* ------------------------------------------------------------------ */

export function TriageView({
  scenario,
  node,
  backHref,
}: {
  scenario: Scenario;
  node: TriageNode;
  backHref: string;
}) {
  const seen = useRunStore((s) => s.seen);
  const flagged = useRunStore((s) => s.flagged);
  const classifications = useRunStore((s) => s.classifications);
  const reveal = useRunStore((s) => s.reveal);
  const toggleFlag = useRunStore((s) => s.toggleFlag);
  const classify = useRunStore((s) => s.classify);
  const submitTriage = useRunStore((s) => s.submitTriage);
  const locale = useLocale();
  const t = useT();
  const evidence = useEvidence(scenario);
  const [openItemId, setOpenItemId] = useState<string | undefined>(undefined);

  const openItem = node.items.find((item) => item.id === openItemId);
  const labelled = node.items.filter((item) => classifications[item.id] !== undefined).length;
  const allLabelled = labelled === node.items.length;

  const open = (itemId: string) => {
    const item = node.items.find((i) => i.id === itemId);
    if (item === undefined) return;
    reveal(emailOpenIds(item.email));
    setOpenItemId(itemId);
    // Open the email at its top, not at the list's scroll position.
    window.scrollTo({ top: 0 });
  };

  const rows: InboxRow[] = node.items.map((item) => {
    const mail = toMailView(item.email, locale);
    return {
      id: item.id,
      displayName: mail.displayName,
      shortAddress: shortAddress(mail.from.address),
      subject: mail.subject,
      preview: mail.preview,
      date: mail.date,
      label: classifications[item.id],
      opened: seen.includes(item.email.from.id),
    };
  });

  if (openItem !== undefined) {
    return (
      <>
        <MailShell
          title={t("mail.inbox")}
          backHref={backHref}
          footer={
            <TriageLabelBar
              value={classifications[openItem.id]}
              onChoose={(label) => classify(openItem.id, label)}
              onBack={() => setOpenItemId(undefined)}
            />
          }
        >
          <MailBody
            mail={toMailView(openItem.email, locale)}
            seenIds={seen}
            flaggedIds={flagged}
            onToggleFlag={toggleFlag}
            onReveal={reveal}
            onOpenPanel={evidence.open}
          />
        </MailShell>
        {evidence.sheet}
      </>
    );
  }

  return (
    <MailShell
      title={t("mail.primary")}
      backHref={backHref}
      variant="inbox"
      hint={t("triage.hint")}
      footer={
        <div className="sticky bottom-0 z-30 space-y-2 border-t bg-white/95 p-3 backdrop-blur">
          <p className="text-xs text-muted-foreground">
            {t("triage.progress")(labelled, node.items.length)}
          </p>
          <Button
            size="lg"
            className="h-11 w-full"
            disabled={!allLabelled}
            onClick={() => submitTriage(node.nextNodeId)}
          >
            {t("triage.submit")}
          </Button>
        </div>
      }
    >
      <InboxList rows={rows} onOpen={open} />
    </MailShell>
  );
}
