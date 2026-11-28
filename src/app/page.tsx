import type { Metadata } from "next";
import { Landing } from "@/components/landing/Landing";

export const metadata: Metadata = {
  title: "DigiDojo: Scam Season",
  description:
    "Indians lost ₹22,495 crore to cyber fraud in 2025. DigiDojo lets 15–25 year-olds practise against real scams inside fake versions of the apps they happen in.",
};

export default function LandingPage() {
  return <Landing />;
}
