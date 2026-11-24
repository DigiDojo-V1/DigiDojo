import type { Locale } from "@/i18n/locale";
import { resolveText } from "@/i18n/text";
import type { MailView, PanelView, TextSegment } from "@/shells/types";
import type { Email, EvidencePanel, Segment } from "./schema";

/** Turns scenario data into what the shells draw, in the player's language. */

function toSegments(segments: readonly Segment[], locale: Locale): TextSegment[] {
  return segments.map((s) => ({
    id: s.id,
    text: resolveText(s.text, locale),
    flaggable: s.id !== undefined,
  }));
}

export function toMailView(email: Email, locale: Locale): MailView {
  return {
    displayName: resolveText(email.displayName, locale),
    from: { id: email.from.id, address: email.from.address },
    showFromAddress: email.showFromAddress === true,
    replyTo:
      email.replyTo === undefined
        ? undefined
        : { id: email.replyTo.id, address: email.replyTo.address },
    to: { id: email.to.id, address: email.to.address },
    date: resolveText(email.date, locale),
    subject: resolveText(email.subject, locale),
    preview: resolveText(email.preview, locale),
    body: email.body.map((paragraph) => toSegments(paragraph, locale)),
    attachments: (email.attachments ?? []).map((a) => ({
      id: a.id,
      shownName: a.shownName,
      fullName: a.fullName,
      actualType: resolveText(a.actualType, locale),
      sizeLabel: a.sizeLabel,
      documentId: a.documentId,
    })),
    links: (email.links ?? []).map((link) => ({
      id: link.id,
      text: resolveText(link.text, locale),
      actualUrl: link.actualUrl,
    })),
  };
}

export function toPanelView(id: string, panel: EvidencePanel, locale: Locale): PanelView {
  return {
    id,
    kind: panel.kind,
    variant: panel.variant,
    title: resolveText(panel.title, locale),
    subtitle: panel.subtitle === undefined ? undefined : resolveText(panel.subtitle, locale),
    sections: panel.sections.map((section) => ({
      heading: section.heading === undefined ? undefined : resolveText(section.heading, locale),
      fields: section.fields.map((field) => ({
        id: field.id,
        label: field.label === undefined ? undefined : resolveText(field.label, locale),
        value: resolveText(field.value, locale),
        finePrint: field.finePrint === true,
        slot: field.slot,
      })),
    })),
  };
}
