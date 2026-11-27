/**
 * The Authority dojo's made-up world. Source: docs/scenarios/authority/voice-call-scam-awareness-guide.pdf.
 * Names from the guide are swapped for fictional ones (no real banks, agencies, officers or
 * well-known people): "Unity National Bank" → Nimbus National Bank, "Narcotics Control Bureau" →
 * National Narcotics Intelligence Wing, "RBI guidelines" → central bank guidelines.
 */

export const BANK = "Nimbus National Bank";
/** The bank's SMS sender id. */
export const BANK_SENDER = "AX-NIMBNK";

/** Priya Nair: the player in the bank scenarios. All made up. */
export const PRIYA = {
  name: "Priya Nair",
  details: [
    { label: "Date of birth", value: "14 Mar 2006" },
    { label: "Account no.", value: "5021 0034 4821" },
    { label: "PAN", value: "BXKPN4821Q" },
    { label: "Aadhaar (last 4)", value: "7319" },
    { label: "Debit card", value: "ends 4821" },
  ],
};

/** Aarav Menon: the player in the "digital arrest" scenario. All made up. */
export const AARAV = {
  name: "Aarav Menon",
  details: [
    { label: "Date of birth", value: "02 Aug 2004" },
    { label: "Car", value: "KA-05-MN-4417" },
    { label: "Aadhaar (last 4)", value: "2290" },
    { label: "Bank account", value: "ends 7781" },
  ],
};

export const REAL_WORLD_ACTION =
  "Got a call like this? Hang up and call the number on the back of your card or the bank's official website. Lost money or shared an OTP? Call 1930 right away and report at cybercrime.gov.in: the first hour matters most. Report fraud calls and texts on the government's Sanchar Saathi portal, then block the number.";
