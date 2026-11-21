"use client";
import { useEffect, useRef } from "react";

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<any>(null);

  useEffect(() => {
    // Dynamically import Lenis to avoid SSR issues
    const initLenis = async () => {
      const Lenis = (await import("@studio-freight/lenis")).default;
      const gsap = (await import("gsap")).default;
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");

      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis({
        duration: 1.4,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 0.8,
        touchMultiplier: 1.5,
      });

      lenisRef.current = lenis;

      // Connect Lenis to GSAP ScrollTrigger
      lenis.on("scroll", ScrollTrigger.update);

      gsap.ticker.add((time: number) => {
        lenis.raf(time * 1000);
      });

      gsap.ticker.lagSmoothing(0);

      // GSAP scroll-triggered text reveals
      // These target elements with data-gsap="reveal" attribute
      const revealEls = document.querySelectorAll("[data-gsap='reveal']");
      revealEls.forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      });

      // Parallax images — target [data-parallax]
      const parallaxEls = document.querySelectorAll("[data-parallax]");
      parallaxEls.forEach((el) => {
        const speed = (el as HTMLElement).dataset.parallax || "0.15";
        gsap.to(el, {
          yPercent: parseFloat(speed) * 100,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });
    };

    initLenis();

    return () => {
      if (lenisRef.current) {
        lenisRef.current.destroy();
      }
    };
  }, []);

  return <>{children}</>;
}
