import { Barlow_Condensed, Bebas_Neue, Instrument_Serif } from "next/font/google";

/** Fonts used only on the landing page, exposed as CSS variables on its root. */
const display = Bebas_Neue({ weight: "400", subsets: ["latin"], variable: "--font-land-display" });
const numerals = Barlow_Condensed({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  variable: "--font-land-numerals",
});
const serif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-land-serif",
});

export const landingFontVars = `${display.variable} ${numerals.variable} ${serif.variable}`;
