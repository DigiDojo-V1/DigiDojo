"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocale, useT, useText } from "@/i18n/hooks";
import { ComposeBody } from "@/shells/ComposeShell";
import { EvidenceSheet } from "@/shells/EvidenceSheet";
import { InboxList, shortAddress, TriageLabelBar, type InboxRow } from "@/shells/InboxShell";
import { MailBody, MailShell } from "@/shells/MailShell";
import { emailOpenIds, panelFieldIds } from "./evidence";
import type { Choice, ComposeNode, EmailNode, Scenario, TriageNode } from "./schema";
import { useRunStore } from "./store";
import { toMailView, toPanelView } from "./views";

/* ------------------------------------------------------------------ */
/* Shared pieces                                                       */
/* ------------------------------------------------------------------ */

/** The reply choices under a screen. */
export function ChoiceFooter({ choices }: { choices: readonly Choice[] }) {
  const choose = useRunStore((s) => s.choose);
  const t = useT();
  const text = useText();
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

/** "Check before you decide" buttons: view profile, company page, careers page. */
export function EvidenceToolbar({
  scenario,
  panelIds,
  onOpen,
}: {
  scenario: Scenario;
  panelIds: readonly string[] | undefined;
  onOpen: (panelId: string) => void;
}) {
  const t = useT();
  const text = useText();
  if (panelIds === undefined || panelIds.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b bg-white px-3 py-2">
      <span className="text-xs text-neutral-500">{t("thread.evidenceHint")}</span>
      {panelIds.map((id) => {
        const panel = scenario.evidence?.[id];
        if (panel === undefined) return null;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onOpen(id)}
            className="flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium"
          >
            <Search className="size-3" /> {text(panel.title)}
          </button>
        );
      })}
    </div>
  );
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
          <EvidenceToolbar scenario={scenario} panelIds={node.evidence} onOpen={evidence.open} />
        }
        footer={<ChoiceFooter choices={node.choices} />}
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
      footer={<ChoiceFooter choices={node.choices} />}
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
      title={t("mail.inbox")}
      backHref={backHref}
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
