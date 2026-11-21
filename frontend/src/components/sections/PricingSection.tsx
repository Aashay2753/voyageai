"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Check, Zap } from "lucide-react";

const plans = [
  {
    name: "Explorer",
    price: "Free",
    period: "",
    desc: "Perfect for occasional travelers.",
    features: ["3 AI itineraries/month", "Basic destination info", "Budget calculator", "PDF export (basic)", "Community support"],
    cta: "Start Free",
    highlight: false,
    color: "#64748B",
  },
  {
    name: "Voyager",
    price: "₹499",
    period: "/month",
    desc: "For serious travel enthusiasts.",
    features: ["Unlimited AI itineraries", "Interactive Google Maps routes", "Hotel & restaurant recommendations", "Weather integration", "Collaborative planning (3 people)", "Priority support", "Visa guidance"],
    cta: "Start 7-day Trial",
    highlight: true,
    color: "#14B8A6",
  },
  {
    name: "Nomad",
    price: "₹999",
    period: "/month",
    desc: "For frequent flyers and travel pros.",
    features: ["Everything in Voyager", "AI Voice Assistant", "Unlimited collaboration", "Flight suggestions", "Expense tracker", "Travel alerts", "White-label PDF", "API access"],
    cta: "Go Nomad",
    highlight: false,
    color: "#8B5CF6",
  },
];

export default function PricingSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="pricing" className="py-24 bg-primary relative overflow-hidden transition-colors duration-300">
      <div className="absolute inset-0 grid-pattern opacity-15" />
      <div className="orb w-96 h-96 bg-accent/5 top-1/2 left-1/4 -translate-y-1/2" />

      <div className="max-w-6xl mx-auto px-6 relative z-10" ref={ref}>
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <div className="w-8 h-[1px] bg-accent" />
            <span className="text-accent text-xs font-semibold uppercase tracking-widest">Pricing</span>
            <div className="w-8 h-[1px] bg-accent" />
          </motion.div>

          <motion.h2
            className="heading-lg text-text-main"
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, ease: [0.77, 0, 0.175, 1] }}
          >
            Simple, transparent
            <br />
            <span className="text-gradient">pricing</span>
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.12, duration: 0.6 }}
              className={`relative rounded-2xl p-8 border shadow-sm ${plan.highlight ? "border-accent/40 bg-accent/5" : "glass border-border-theme"}`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-accent text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="mb-6">
                <div className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-1 opacity-80">{plan.name}</div>
                <div className="flex items-end gap-1 mb-2">
                  <span className="text-4xl font-black text-text-main">{plan.price}</span>
                  <span className="text-text-muted text-sm mb-1">{plan.period}</span>
                </div>
                <p className="text-text-muted text-xs opacity-90">{plan.desc}</p>
              </div>

              <button
                onClick={() => document.getElementById("planner")?.scrollIntoView({ behavior: "smooth" })}
                className={`w-full py-3 rounded-xl text-sm font-semibold mb-6 transition-all ${
                  plan.highlight
                    ? "bg-accent hover:bg-accent-dark text-white neon-glow"
                    : "glass border border-border-theme text-text-main hover:bg-secondary"
                }`}
              >
                {plan.cta}
              </button>

              <ul className="space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-xs text-text-muted opacity-90">
                    <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: plan.color }} />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
