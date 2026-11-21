"use client";
import LoadingScreen from "@/components/ui/LoadingScreen";
import CustomCursor from "@/components/ui/CustomCursor";
import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import DestinationsSection from "@/components/sections/DestinationsSection";
import PlannerSection from "@/components/sections/PlannerSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import MapSection from "@/components/map/MapSection";
import WeatherSection from "@/components/sections/WeatherSection";
import StatsSection from "@/components/sections/StatsSection";
import PricingSection from "@/components/sections/PricingSection";
import CTASection from "@/components/sections/CTASection";
import Footer from "@/components/layout/Footer";
import ChatWidget from "@/components/chat/ChatWidget";

import { useEffect } from "react";
import { useAppStore } from "@/store/appStore";

export default function Home() {
  const theme = useAppStore((s) => s.theme);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  return (
    <main className="relative">
      <LoadingScreen />
      <CustomCursor />
      <Navbar />
      <HeroSection />
      <DestinationsSection />
      <PlannerSection />
      <FeaturesSection />
      <MapSection />
      <WeatherSection />
      <StatsSection />
      <PricingSection />
      <CTASection />
      <Footer />
      <ChatWidget />
    </main>
  );
}
