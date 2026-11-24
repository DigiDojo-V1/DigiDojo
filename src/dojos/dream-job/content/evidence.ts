import type { EvidencePanelInput } from "@/engine/schema";
import { NEXORA, PLAYER, ROLE } from "./universe";

/**
 * Panels the player can open: recruiter profiles, Nexora's company page and record,
 * its careers page (the "verify independently" action) and the offer-letter PDFs.
 * Field ids are unique across the dojo, so any scenario can combine these.
 */
export const PANELS = {
  "karan-profile": {
    kind: "profile",
    title: "Karan Sethi",
    subtitle: "HR Associate | Nexora Technologies",
    sections: [
      {
        fields: [
          { id: "karan-name", slot: "name", label: "Name", value: "Karan Sethi" },
          {
            id: "karan-headline",
            slot: "headline",
            label: "Headline",
            value: "HR Associate | Nexora Technologies",
          },
          { id: "karan-company", label: "Company shown", value: NEXORA.name },
        ],
      },
    ],
  },

  "aditi-profile": {
    kind: "profile",
    title: "Aditi Sharma",
    subtitle: "Senior Talent Acquisition Executive | Nexora Technologies",
    sections: [
      {
        fields: [
          { id: "aditi-name", slot: "name", label: "Name", value: "Aditi Sharma" },
          {
            id: "aditi-headline",
            slot: "headline",
            label: "Headline",
            value: "Senior Talent Acquisition Executive | Nexora Technologies",
          },
          {
            id: "aditi-connections",
            slot: "connections",
            label: "Connections",
            value: "640 connections · 3 mutual connections",
          },
          { id: "aditi-experience", label: "Experience", value: "Several years of HR experience" },
        ],
      },
    ],
  },

  "nisha-profile": {
    kind: "profile",
    title: "Nisha Rao",
    subtitle: `Senior Talent Acquisition Partner | ${NEXORA.legalName}`,
    sections: [
      {
        fields: [
          { id: "nisha-name", slot: "name", label: "Name", value: "Nisha Rao" },
          {
            id: "nisha-headline",
            slot: "headline",
            label: "Headline",
            value: `Senior Talent Acquisition Partner | ${NEXORA.legalName}`,
          },
          { id: "nisha-location", slot: "location", label: "Location", value: NEXORA.location },
          {
            id: "nisha-connections",
            slot: "connections",
            label: "Connections",
            value: "1,184 connections · 4 mutual connections",
          },
        ],
      },
      {
        heading: "About",
        fields: [
          {
            id: "nisha-about",
            value:
              "Talent acquisition professional with 10 years of experience building research and analytics teams. “I joined Nexora in July 2019 and have helped build its talent function from the beginning.”",
            redFlagId: "li-timeline-conflict",
          },
        ],
      },
      {
        heading: "Experience",
        fields: [
          {
            id: "nisha-exp-nexora",
            value: `${NEXORA.legalName} — Senior Talent Acquisition Partner — 1 July 2019 to Present`,
            redFlagId: "li-timeline-conflict",
          },
          {
            id: "nisha-exp-apex",
            value: "Apex People Advisory — HR Consultant — June 2016 to June 2019",
          },
        ],
      },
      {
        heading: "Education",
        fields: [{ id: "nisha-education", value: "BBA, Eastview Institute — 2012 to 2015" }],
      },
    ],
  },

  "nexora-company": {
    kind: "company",
    title: NEXORA.legalName,
    subtitle: "Company page",
    sections: [
      {
        fields: [
          { id: "company-name", label: "Company page", value: NEXORA.legalName },
          { id: "company-location", label: "Location", value: NEXORA.location },
          { id: "company-industry", label: "Industry", value: "Software / business analytics" },
          { id: "company-website", label: "Official website", value: NEXORA.domain },
        ],
      },
    ],
  },

  "nexora-record": {
    kind: "company",
    variant: "official-record",
    title: `${NEXORA.legalName}: company record`,
    sections: [
      {
        fields: [
          {
            id: "record-incorporated",
            label: "Company record",
            value: `Incorporated on ${NEXORA.incorporated}`,
            redFlagId: "li-timeline-conflict",
          },
        ],
      },
    ],
  },

  "nexora-careers": {
    kind: "web-page",
    title: NEXORA.careersHost,
    subtitle: "Nexora careers (found independently)",
    sections: [
      {
        heading: "Open roles",
        fields: [
          {
            id: "careers-role",
            label: `${ROLE.title} — ${ROLE.reference}`,
            value: `${ROLE.terms}; reporting manager ${ROLE.manager}`,
          },
        ],
      },
    ],
  },

  "easy-offer-pdf": {
    kind: "document",
    title: "Ananya_Rao_Offer_Letter.pdf",
    subtitle: "Simulated PDF, 1 page",
    sections: [
      {
        heading: "Page 1",
        fields: [
          {
            id: "easy-pdf-greeting",
            label: "Greeting",
            value: "Dear Candidate",
            redFlagId: "mail-generic-greeting",
          },
          {
            id: "easy-pdf-role",
            label: "Role / salary",
            value: `${ROLE.title}; ₹40,000/month`,
            redFlagId: "mail-high-salary",
          },
          {
            id: "easy-pdf-manager",
            label: "Manager / office",
            value: "No reporting manager or office address",
            redFlagId: "mail-missing-details",
          },
          {
            id: "easy-pdf-signatory",
            label: "Signatory",
            value: "“HR Manager” (no named person)",
            redFlagId: "mail-missing-details",
          },
          {
            id: "easy-pdf-payment",
            label: "Payment clause",
            value:
              "₹2,999 registration and verification fee payable before onboarding to the coordinator’s UPI ID.",
            redFlagId: "mail-fee",
          },
        ],
      },
    ],
  },

  "medium-offer-pdf": {
    kind: "document",
    title: "Ananya_Rao_Offer_Letter.pdf",
    subtitle: "Simulated PDF, 2 pages",
    sections: [
      {
        heading: "Page 1 — Offer",
        fields: [
          { id: "medium-pdf-role", label: "Role", value: ROLE.title },
          { id: "medium-pdf-terms", label: "Terms", value: ROLE.terms },
        ],
      },
      {
        heading: "Page 2 — Terms and conditions",
        fields: [
          {
            id: "medium-pdf-clause-8-4",
            label: "Clause 8.4",
            value:
              "Before the joining date, the candidate must submit a refundable laptop security deposit of ₹2,499 to the equipment allocation partner. The amount will be returned after the device is handed back in working condition.",
            redFlagId: "pdf-deposit",
            finePrint: true,
          },
        ],
      },
    ],
  },

  "legit-offer-pdf": {
    kind: "document",
    title: "Employment_Offer_Ananya_Rao.pdf",
    subtitle: "Simulated PDF",
    sections: [
      {
        fields: [
          { id: "legit-pdf-candidate", label: "Candidate", value: PLAYER.name },
          { id: "legit-pdf-role", label: "Role", value: ROLE.title },
          { id: "legit-pdf-reference", label: "Reference", value: ROLE.reference },
          { id: "legit-pdf-location", label: "Location", value: "Bengaluru, Karnataka (hybrid)" },
          { id: "legit-pdf-duration", label: "Duration", value: "3 months" },
          { id: "legit-pdf-stipend", label: "Stipend", value: "₹18,000 per month" },
          { id: "legit-pdf-start", label: "Proposed start date", value: "1 December 2026" },
          {
            id: "legit-pdf-manager",
            label: "Reporting manager",
            value: `${ROLE.manager}, Research Manager`,
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
