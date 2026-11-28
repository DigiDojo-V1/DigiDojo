import { Entrance } from "@/components/home/Entrance";
import { HomeCarousel } from "@/components/home/HomeCarousel";
import { landingFontVars } from "@/components/landing/fonts";

export default function HomePage() {
  return (
    <div className={landingFontVars}>
      <HomeCarousel />
      <Entrance />
    </div>
  );
}
