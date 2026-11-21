"use client";
import { Plane, Twitter, Instagram, Linkedin, Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-primary border-t border-border-theme py-16 relative overflow-hidden transition-colors duration-300">
      <div className="orb w-64 h-64 bg-accent/4 bottom-0 left-1/3" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-5 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
                <Plane className="w-4 h-4 text-accent" />
              </div>
              <span className="text-text-main font-black text-xl tracking-tight">Voyage<span className="text-accent">AI</span></span>
            </div>
            <p className="text-text-muted text-sm leading-relaxed max-w-xs mb-6 opacity-90">
              AI-powered travel planning. Build perfect itineraries in seconds, optimized for your budget, style, and dreams.
            </p>
            <div className="flex items-center gap-3">
              {[Twitter, Instagram, Linkedin, Github].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 glass rounded-lg flex items-center justify-center text-text-muted hover:text-accent hover:border-accent/30 transition-all border border-border-theme shadow-sm">
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            { title: "Product", links: ["Features", "Pricing", "API Access", "Changelog", "Roadmap"] },
            { title: "Destinations", links: ["Goa", "Bali", "Dubai", "Manali", "View All"] },
            { title: "Company", links: ["About", "Blog", "Careers", "Press", "Contact"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-text-main font-semibold text-sm mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-text-muted hover:text-accent text-xs transition-colors opacity-90">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border-theme pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-text-muted text-xs opacity-75">© 2024 VoyageAI. All rights reserved.</p>
          <div className="flex items-center gap-6">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
              <a key={item} href="#" className="text-text-muted hover:text-text-main text-xs transition-colors opacity-75">{item}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
