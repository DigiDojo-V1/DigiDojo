/**
 * The shared fictional world of the Easy Money dojo. Every person, account, company, address,
 * UPI ID, domain and URL here is simulation data. `.example` domains never resolve.
 */

/** The player in every Easy Money scenario. */
export const PLAYER = {
  name: "Rohan Mehta",
  email: "rohan.mehta@example.com",
} as const;

/** The genuine startup in the legit twin. */
export const KOSHA = {
  name: "Kosha",
  domain: "kosha.example",
  researchHost: "kosha.example/research",
  researchUrl: "https://kosha.example/research",
} as const;
