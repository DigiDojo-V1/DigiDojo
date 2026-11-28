/**
 * The shared fictional world of the Dream Job dojo (blueprint §2). Every person, company,
 * address, UPI ID, domain and URL here is simulation data. `.example` domains never resolve.
 */
export const NEXORA = {
  name: "Nexora Technologies",
  legalName: "Nexora Technologies Pvt. Ltd.",
  location: "Bengaluru, Karnataka, India",
  incorporated: "17 May 2021",
  /** The only official Nexora domain in the game. */
  domain: "nexora.example",
  careersHost: "careers.nexora.example",
} as const;

export const ROLE = {
  title: "Business Research Intern",
  reference: "NX-BRI-026",
  terms: "3 months; ₹18,000/month; Bengaluru hybrid",
  manager: "Priya Nair",
} as const;

/** The player. */
export const PLAYER = {
  name: "Ananya Rao",
  email: "ananya.rao@example.com",
} as const;

export const REAL_WORLD_ACTION = {
  en: "If money has already been paid, call 1930 and report the incident at cybercrime.gov.in.",
  hinglish: "Agar paise de chuke ho, toh 1930 pe call karo aur cybercrime.gov.in pe report karo.",
};
