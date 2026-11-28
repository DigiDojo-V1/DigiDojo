/**
 * Where every number on the landing page comes from. Titles are citations, so they stay in
 * the language of the source document.
 */
export interface Source {
  id: string;
  /** Short tag shown next to a figure. */
  short: string;
  /** Full citation for the sources list. */
  title: string;
  url: string;
}

export const SOURCES = {
  mha2026: {
    id: "mha2026",
    short: "MHA via PIB, Feb 2026",
    title:
      "Ministry of Home Affairs, reply in the Rajya Sabha: “Cybercrime Reporting and Investigation” (financial fraud complaints and amounts reported on NCRP, 2021–2025). PIB, 11 Feb 2026.",
    url: "https://www.pib.gov.in/PressReleasePage.aspx?PRID=2226441",
  },
  nsoCms2025: {
    id: "nsoCms2025",
    short: "NSO CMS: Telecom 2025",
    title:
      "National Statistics Office, Comprehensive Modular Survey: Telecom 2025 (ability to report cyber fraud, by age group), as reported by Hindustan Times, 30 May 2025.",
    url: "https://www.hindustantimes.com/india-news/just-18-internet-users-know-how-to-report-ecrimes-101748543922499.html",
  },
  aser2023: {
    id: "aser2023",
    short: "ASER 2023",
    title:
      "ASER 2023 “Beyond Basics”, Evidence Brief: Digital Readiness of India’s Youth (rural youth aged 14–18). ASER Centre, 2024.",
    url: "https://asercentre.org/wp-content/uploads/2022/12/EB_Digital-Readiness-of-Indias-Youth_11.03.2024.pdf",
  },
  i4c: {
    id: "i4c",
    short: "I4C, MHA",
    title:
      "Indian Cybercrime Coordination Centre (I4C), MHA: National Cybercrime Reporting Portal and the 1930 helpline.",
    url: "https://i4c.mha.gov.in/ncrp.aspx",
  },
} as const satisfies Record<string, Source>;

export type SourceId = keyof typeof SOURCES;

/** The headline figures, straight from the sources above. */
export const FIGURES = {
  /** ₹ crore reported lost to cyber financial fraud in 2025 (MHA). */
  lostCrore2025: 22495,
  /** Financial fraud complaints on NCRP in 2025 (MHA). */
  complaints2025: 2402579,
  /** % of 15–24 year-olds able to report cyber fraud (NSO CMS: Telecom 2025). */
  canReportPct: 26.3,
  /** Year-wise complaints and ₹ crore reported lost (MHA). */
  years: [
    { year: 2021, complaints: 262846, crore: 551 },
    { year: 2022, complaints: 694446, crore: 2290 },
    { year: 2023, complaints: 1310357, crore: 7465 },
    { year: 2024, complaints: 1918835, crore: 22848 },
    { year: 2025, complaints: 2402579, crore: 22495 },
  ],
} as const;
