"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Sun, Moon } from "lucide-react";
import { useAppStore } from "@/store/appStore";

const navLinks = [
  { label: "Destinations", href: "#destinations" },
  { label: "Plan Trip", href: "#planner" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, setTheme } = useAppStore();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "py-3" : "py-6"
      }`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 2.9, duration: 0.7, ease: [0.77, 0, 0.175, 1] }}
    >
      <div
        className={`mx-auto max-w-7xl px-6 flex items-center justify-between transition-all duration-500 ${
          scrolled ? "glass rounded-2xl py-3 px-6 mx-4" : ""
        }`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg animated-border p-[2px]">
            <div className="w-full h-full bg-primary rounded-md flex items-center justify-center">
              <span className="text-accent font-black text-xs">V</span>
            </div>
          </div>
          <span className="text-text-main font-black text-lg tracking-tight">
            Voyage<span className="text-accent">AI</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-text-muted hover:text-text-main text-sm font-medium transition-colors relative group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-accent group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="hidden md:flex items-center gap-4">
          {/* Theme Toggle Button */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-9 h-9 rounded-full flex items-center justify-center text-text-muted hover:text-text-main hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <button onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })} className="text-text-muted hover:text-text-main text-sm font-medium transition-colors px-3 py-2">
            Sign In
          </button>
          <button onClick={() => document.getElementById("planner")?.scrollIntoView({ behavior: "smooth" })} className="bg-accent hover:bg-accent-dark text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all neon-glow hover:scale-105">
            Start Free
          </button>
        </div>

        {/* Mobile menu toggle */}
        <div className="md:hidden flex items-center gap-4">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-9 h-9 rounded-full flex items-center justify-center text-text-muted hover:text-text-main"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <button
            className="text-text-main relative w-8 h-6 flex flex-col justify-between"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <motion.span
              className="block h-[1.5px] bg-current rounded-full w-full"
              animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 10 : 0 }}
            />
            <motion.span
              className="block h-[1.5px] bg-current rounded-full w-full"
              animate={{ opacity: menuOpen ? 0 : 1 }}
            />
            <motion.span
              className="block h-[1.5px] bg-current rounded-full w-full"
              animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -10 : 0 }}
            />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <motion.div
        className="md:hidden mx-4 mt-2 glass rounded-2xl overflow-hidden"
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: menuOpen ? "auto" : 0, opacity: menuOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="p-6 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-text-main font-medium text-lg"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="pt-4 border-t border-border-theme flex flex-col gap-3">
            <button onClick={() => { setMenuOpen(false); document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" }); }} className="text-text-muted hover:text-text-main text-sm font-medium py-2 text-left">Sign In</button>
            <button onClick={() => { setMenuOpen(false); document.getElementById("planner")?.scrollIntoView({ behavior: "smooth" }); }} className="bg-accent text-white text-sm font-semibold px-5 py-3 rounded-full neon-glow text-center">
              Start Free
            </button>
          </div>
        </div>
      </motion.div>
    </motion.nav>
  );
}
