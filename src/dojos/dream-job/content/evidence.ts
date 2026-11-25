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
    footer: "Nexora HR Team",
    sections: [
      {
        fields: [
          {
            id: "easy-pdf-letterhead",
            look: "letterhead",
            value: "NEXORA TECHNOLOGIES\nHuman Resources Department",
          },
          { id: "easy-pdf-date", look: "meta", value: "Date: 19/11/2026" },
          { id: "easy-pdf-title", look: "title", value: "OFFER LETTER" },
          {
            id: "easy-pdf-greeting",
            value: "Dear Candidate,",
            redFlagId: "mail-generic-greeting",
          },
          {
            id: "easy-pdf-congrats",
            value: `Congratulations!! We are very happy to inform you that you have been selected for the post of ${ROLE.title} in our esteemed organisation ${NEXORA.name}.`,
          },
          {
            id: "easy-pdf-role",
            value: `Your salary for the ${ROLE.title} role will be ₹40,000/- per month (Rupees Forty Thousand Only). Work is simple online data research which can be done from home in 2–3 hours daily.`,
            redFlagId: "mail-high-salary",
          },
          {
            id: "easy-pdf-manager",
            value:
              "Details of your reporting manager, office location and joining date will be shared after the onboarding process is complete.",
            redFlagId: "mail-missing-details",
          },
          {
            id: "easy-pdf-payment",
            value:
              "NOTE: To confirm your seat, the candidate must pay ₹2,999 as Registration & Verification Fee before onboarding to the HR coordinator’s UPI ID given in the email. Seat will be given to next candidate if fee is not received.",
            redFlagId: "mail-fee",
          },
          {
            id: "easy-pdf-welcome",
            value: "We welcome you to our family and wish you a bright career ahead.",
          },
          {
            id: "easy-pdf-signatory",
            look: "signature",
            value: "Regards,\nHR Manager\nNexora Technologies",
            redFlagId: "mail-missing-details",
          },
        ],
      },
    ],
  },

  "medium-offer-pdf": {
    kind: "document",
    title: "Ananya_Rao_Offer_Letter.pdf",
    subtitle: "Simulated PDF, 2 pages",
    footer: `${NEXORA.legalName} · Private & Confidential`,
    sections: [
      {
        fields: [
          {
            id: "medium-pdf-letterhead",
            look: "letterhead",
            value: `${NEXORA.legalName}\n4th Floor, Meridian Square, Outer Ring Road\n${NEXORA.location}`,
          },
          {
            id: "medium-pdf-ref",
            look: "meta",
            value: `Ref: NX/HR/OL/2026/1147\nDate: 21 November 2026`,
          },
          {
            id: "medium-pdf-addressee",
            look: "meta",
            value: `To,\n${PLAYER.name}\nBengaluru, Karnataka`,
          },
          { id: "medium-pdf-title", look: "title", value: "Subject: Offer of Internship" },
          { id: "medium-pdf-greeting", value: "Dear Ananya," },
          {
            id: "medium-pdf-intro",
            value: `With reference to your recent recruitment discussion, we are pleased to offer you an internship with ${NEXORA.legalName} on the terms set out below.`,
          },
          { id: "medium-pdf-role", look: "term", label: "Position", value: ROLE.title },
          { id: "medium-pdf-terms", look: "term", label: "Terms", value: ROLE.terms },
          {
            id: "medium-pdf-start",
            look: "term",
            label: "Proposed joining date",
            value: "1 December 2026",
          },
          {
            id: "medium-pdf-accept",
            value:
              "This offer is subject to the Terms and Conditions on the following page. Please sign and return a copy of this letter to the onboarding desk as a token of your acceptance.",
          },
        ],
      },
      {
        heading: "8. Terms and Conditions",
        fields: [
          {
            id: "medium-pdf-clause-8-1",
            look: "clause",
            label: "8.1",
            value:
              "The internship is a training engagement and does not constitute an offer of permanent employment.",
            finePrint: true,
          },
          {
            id: "medium-pdf-clause-8-2",
            look: "clause",
            label: "8.2",
            value:
              "The intern shall maintain strict confidentiality of all business information during and after the internship period.",
            finePrint: true,
          },
          {
            id: "medium-pdf-clause-8-3",
            look: "clause",
            label: "8.3",
            value:
              "Working hours shall be 9:30 am to 6:00 pm, Monday to Friday. Hybrid attendance is at the discretion of the reporting team.",
            finePrint: true,
          },
          {
            id: "medium-pdf-clause-8-4",
            look: "clause",
            label: "8.4",
            value:
              "Before the joining date, the candidate must submit a refundable laptop security deposit of ₹2,499 to the equipment allocation partner. The amount will be returned after the device is handed back in working condition.",
            redFlagId: "pdf-deposit",
            finePrint: true,
          },
          {
            id: "medium-pdf-clause-8-5",
            look: "clause",
            label: "8.5",
            value:
              "Either party may end the internship with seven (7) days’ written notice. The stipend is payable on the last working day of each month.",
            finePrint: true,
          },
          {
            id: "medium-pdf-signatory",
            look: "signed",
            value: `For ${NEXORA.legalName}\nAditi Sharma\nSenior Talent Acquisition Executive`,
          },
        ],
      },
    ],
  },

  "legit-offer-pdf": {
    kind: "document",
    title: "Employment_Offer_Ananya_Rao.pdf",
    subtitle: "Simulated PDF, 1 page",
    footer: `${NEXORA.legalName} · ${NEXORA.domain}`,
    sections: [
      {
        fields: [
          {
            id: "legit-pdf-letterhead",
            look: "letterhead",
            value: `${NEXORA.legalName}\n4th Floor, Meridian Square, Outer Ring Road, ${NEXORA.location}\n${NEXORA.domain} · careers@${NEXORA.domain}`,
          },
          {
            id: "legit-pdf-ref",
            look: "meta",
            value: `Ref: ${ROLE.reference}\nDate: 23 November 2026`,
          },
          {
            id: "legit-pdf-candidate",
            look: "meta",
            label: "To",
            value: PLAYER.name,
          },
          { id: "legit-pdf-title", look: "title", value: "Letter of Offer: Internship" },
          { id: "legit-pdf-greeting", value: "Dear Ananya," },
          {
            id: "legit-pdf-intro",
            value: `Following your interview with Priya Nair on 21 November 2026 and your HR discussion on 22 November 2026, we are pleased to offer you an internship with ${NEXORA.legalName} on the following terms:`,
          },
          { id: "legit-pdf-role", look: "term", label: "Role", value: ROLE.title },
          { id: "legit-pdf-reference", look: "term", label: "Reference", value: ROLE.reference },
          {
            id: "legit-pdf-location",
            look: "term",
            label: "Location",
            value: "Bengaluru, Karnataka (hybrid)",
          },
          { id: "legit-pdf-duration", look: "term", label: "Duration", value: "3 months" },
          { id: "legit-pdf-stipend", look: "term", label: "Stipend", value: "₹18,000 per month" },
          {
            id: "legit-pdf-start",
            look: "term",
            label: "Proposed start date",
            value: "1 December 2026",
          },
          {
            id: "legit-pdf-manager",
            look: "term",
            label: "Reporting manager",
            value: `${ROLE.manager}, Research Manager`,
          },
          {
            id: "legit-pdf-no-fee",
            value: `${NEXORA.name} does not charge candidates any fee or deposit at any stage of hiring. Identity and payroll documents will be requested only after you accept this offer on our careers portal.`,
          },
          {
            id: "legit-pdf-accept",
            value: `Please accept this offer at ${NEXORA.careersHost}/offers/${ROLE.reference} by 30 November 2026. We look forward to working with you.`,
          },
          {
            id: "legit-pdf-signatory",
            look: "signed",
            value: `Yours sincerely,\n${ROLE.manager}\nResearch Manager, ${NEXORA.legalName}`,
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
