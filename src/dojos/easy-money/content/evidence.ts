import type { EvidencePanelInput } from "@/engine/schema";
import { KOSHA } from "./universe";

/**
 * Panels the player can open: the scammers' Instagram profiles, the Telegram group's info,
 * Kosha's research page (the "verify independently" action) and its consent form PDF.
 * Field ids are unique across the dojo, so any scenario can combine these.
 */
export const PANELS = {
  "riya-profile": {
    kind: "profile",
    title: "Riya | Digital Promotions",
    subtitle: "@riya.digitalpromos",
    sections: [
      {
        fields: [
          { id: "riya-name", slot: "name", label: "Name", value: "Riya | Digital Promotions" },
          {
            id: "riya-bio",
            slot: "headline",
            label: "Bio",
            value: "Work from home 💸 Part-time jobs for students | DM for tasks",
          },
          {
            id: "riya-counts",
            slot: "connections",
            label: "Posts",
            value: "4 posts · 12.6k followers · 9 following",
          },
        ],
      },
      {
        heading: "About this account",
        fields: [
          {
            id: "riya-joined",
            label: "Date joined",
            value: "November 2026 (3 weeks ago)",
            redFlagId: "brand-new-account",
          },
          { id: "riya-based", label: "Account based in", value: "India" },
          { id: "riya-website", label: "Website", value: "None listed" },
        ],
      },
      {
        heading: "Posts",
        fields: [
          {
            id: "riya-posts",
            value: "4 graphics, all saying “Earn ₹3,000/day from your phone 📱”",
          },
        ],
      },
    ],
  },

  "taskearn-group": {
    kind: "profile",
    title: "TaskEarn VIP",
    subtitle: "Group · 1,284 members",
    sections: [
      {
        fields: [
          { id: "group-name", slot: "name", label: "Name", value: "TaskEarn VIP" },
          {
            id: "group-description",
            slot: "headline",
            label: "Description",
            value: "Daily tasks 💰 Guaranteed withdrawal 💯 Contact mentor Anjali for VIP",
          },
          {
            id: "group-members",
            slot: "connections",
            label: "Members",
            value: "1,284 members · 3 admins",
          },
        ],
      },
      {
        heading: "Group info",
        fields: [
          { id: "group-created", label: "Created", value: "9 days ago" },
          {
            id: "group-permissions",
            label: "Permissions",
            value: "Only admins can send messages",
            redFlagId: "admins-only-group",
          },
          {
            id: "group-admins",
            label: "Admins",
            value: "Anjali (Mentor), Pooja S, TaskEarn Bot",
            redFlagId: "admins-only-group",
          },
        ],
      },
    ],
  },

  "vikram-profile": {
    kind: "profile",
    title: "Vikram | EasyEarn Hub",
    subtitle: "@easyearn.hub",
    sections: [
      {
        fields: [
          { id: "vikram-name", slot: "name", label: "Name", value: "Vikram | EasyEarn Hub" },
          {
            id: "vikram-bio",
            slot: "headline",
            label: "Bio",
            value: "💸 Payments gig for students | 10 min/day | DM “EARN”",
          },
          {
            id: "vikram-counts",
            slot: "connections",
            label: "Posts",
            value: "11 posts · 8,240 followers · 2 following",
          },
        ],
      },
      {
        heading: "About this account",
        fields: [
          { id: "vikram-joined", label: "Date joined", value: "August 2025" },
          { id: "vikram-based", label: "Account based in", value: "India" },
          {
            id: "vikram-usernames",
            label: "Former usernames",
            value: "3: quickloan.helpdesk, crypto.vk.official, easyearn.hub",
            redFlagId: "renamed-account",
          },
        ],
      },
    ],
  },

  "kosha-research-page": {
    kind: "company",
    title: `${KOSHA.name} · Research page at ${KOSHA.researchHost} (found independently)`,
    sections: [
      {
        fields: [
          {
            id: "kosha-study",
            label: "Current study",
            value:
              "Student bill-splitting · 30-minute video call · ₹500 thank-you to your UPI ID, paid after the session",
          },
          { id: "kosha-team-meera", label: "Research team", value: "Meera Iyer, User Researcher" },
          { id: "kosha-team-arjun", label: "Research team", value: "Arjun Bose, Design Lead" },
          {
            id: "kosha-promise",
            label: "Our promise",
            value:
              "We never charge participants, and we never ask for bank logins, card details or OTPs.",
          },
          { id: "kosha-contact", label: "Contact", value: `research@${KOSHA.domain}` },
        ],
      },
    ],
  },

  "consent-form": {
    kind: "document",
    title: "Kosha_Research_Consent.pdf",
    subtitle: "Simulated PDF, 1 page",
    footer: `${KOSHA.name} · ${KOSHA.domain}`,
    sections: [
      {
        fields: [
          { id: "consent-letterhead", look: "letterhead", value: "KOSHA\nUser Research" },
          { id: "consent-title", look: "title", value: "PARTICIPANT CONSENT FORM" },
          {
            id: "consent-study",
            look: "term",
            label: "Study",
            value: "How students split bills. A 30-minute video call with a Kosha researcher.",
          },
          {
            id: "consent-payment",
            look: "term",
            label: "Thank-you payment",
            value: "₹500 to your UPI ID within 3 working days after the session",
          },
          { id: "consent-cost", look: "term", label: "Cost to you", value: "None" },
          {
            id: "consent-recording",
            look: "term",
            label: "Recording",
            value: "Audio only, and only with your permission. Deleted after 90 days.",
          },
          {
            id: "consent-clause-1",
            look: "clause",
            label: "1.",
            value: "You can stop at any time and still receive the payment.",
          },
          {
            id: "consent-clause-2",
            look: "clause",
            label: "2.",
            value: "We use your answers only to improve the Kosha app. We never sell them.",
          },
          {
            id: "consent-clause-3",
            look: "clause",
            label: "3.",
            value: "We will never ask you for money, bank logins, card details or OTPs.",
          },
          {
            id: "consent-signatory",
            look: "signed",
            value: "Meera Iyer\nUser Researcher, Kosha",
          },
        ],
      },
    ],
  },
} satisfies Record<string, EvidencePanelInput>;

export type PanelId = keyof typeof PANELS;

/** The panels a scenario uses, by id. */
export function pickPanels(ids: readonly PanelId[]): Record<string, EvidencePanelInput> {
  return Object.fromEntries(ids.map((id) => [id, PANELS[id]]));
}
