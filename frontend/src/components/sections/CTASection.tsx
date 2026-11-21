"use client";
import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Send, Plane, ArrowRight, Sparkles } from "lucide-react";
import { useAppStore } from "@/store/appStore";

export default function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const setPlannerQuery = useAppStore((s) => s.setPlannerQuery);

  const handleJoin = () => {
    if (!email) return;
    setJoined(true);
  };

  const scrollToPlanner = (query?: string) => {
    if (query) setPlannerQuery(query);
    document.getElementById("planner")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-24 bg-primary relative overflow-hidden transition-colors duration-300" ref={ref}>
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute w-[800px] h-[800px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(20,184,166,0.08) 0%, transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 grid-pattern opacity-15" />
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8 border border-border-theme shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-accent text-xs font-semibold uppercase tracking-widest">
            Join 2M+ Travelers
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h2
          className="heading-xl text-text-main mb-6"
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.1, duration: 0.8, ease: [0.77, 0, 0.175, 1] }}
        >
          Your next adventure
          <br />
          starts{" "}
          <span className="text-gradient">right now</span>
        </motion.h2>

        <motion.p
          className="text-text-muted text-lg max-w-xl mx-auto mb-10 leading-relaxed opacity-95"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.25 }}
        >
          Join thousands of travelers who plan smarter, spend less, and experience more.
          Start free — no credit card needed.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.35 }}
        >
          <motion.button
            onClick={() => scrollToPlanner()}
            className="bg-accent hover:bg-accent-dark text-white font-bold px-8 py-4 rounded-2xl flex items-center gap-2 neon-glow text-sm transition-all"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            <Plane className="w-4 h-4" />
            Start Planning Free
            <ArrowRight className="w-4 h-4" />
          </motion.button>
          <motion.button
            onClick={() => scrollToPlanner("3 days in Goa under ₹15,000 for 2 people")}
            className="glass border border-border-theme text-text-main font-semibold px-8 py-4 rounded-2xl text-sm hover:bg-secondary transition-all"
            whileHover={{ scale: 1.04 }}
          >
            View Demo Trip
          </motion.button>
        </motion.div>

        {/* Email signup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.45 }}
        >
          <p className="text-text-muted text-sm mb-4 opacity-80">
            Or get exclusive travel deals & AI tips in your inbox:
          </p>

          {joined ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-2 text-accent font-semibold"
            >
              <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
                ✓
              </div>
              You&apos;re on the list! Check your inbox.
            </motion.div>
          ) : (
            <div className="inline-flex items-center gap-2 glass border border-border-theme rounded-2xl p-1.5 max-w-sm mx-auto shadow-sm">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                placeholder="your@email.com"
                className="bg-transparent text-text-main text-sm px-4 py-2 outline-none placeholder-text-muted/40 flex-1"
              />
              <button
                onClick={handleJoin}
                className="bg-accent hover:bg-accent-dark text-white text-sm font-semibold px-5 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                Subscribe
              </button>
            </div>
          )}

          <p className="text-text-muted text-xs mt-3 opacity-60">
            Weekly travel inspo. Zero spam. Unsubscribe anytime.
          </p>
        </motion.div>

        {/* Social proof logos */}
        <motion.div
          className="mt-16 pt-12 border-t border-border-theme"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
        >
          <p className="text-text-muted text-xs uppercase tracking-widest mb-6 opacity-60">Trusted by travelers from</p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {["🇮🇳 India", "🇦🇪 UAE", "🇸🇬 Singapore", "🇬🇧 UK", "🇺🇸 USA", "🇦🇺 Australia"].map((country) => (
              <span key={country} className="text-text-muted text-sm font-semibold hover:text-accent transition-colors">
                {country}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
