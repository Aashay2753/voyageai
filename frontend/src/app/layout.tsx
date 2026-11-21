import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "mapbox-gl/dist/mapbox-gl.css";
import SmoothScrollProvider from "@/components/ui/SmoothScrollProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VoyageAI — Plan Perfect Trips in Seconds",
  description:
    "AI-powered travel planning. Create complete travel itineraries in seconds with personalized recommendations, budget optimization, and real-time insights.",
  keywords: "AI travel planner, trip itinerary, travel planning, VoyageAI",
  openGraph: {
    title: "VoyageAI — Plan Perfect Trips in Seconds",
    description: "AI-powered travel planning made effortless.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
