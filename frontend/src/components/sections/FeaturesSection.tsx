"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Brain, Map, Wallet, Cloud, Users, Download, Globe, Zap, ChevronRight } from "lucide-react";

const features = [
  {
    icon: <Brain className="w-6 h-6" />,
    title: "AI Itinerary Engine",
    desc: "GPT-4 powered planning that understands your preferences, budget, and travel style to build the perfect trip.",
    color: "#14B8A6",
    bg: "from-teal-500/10 to-transparent",
  },
  {
    icon: <Map className="w-6 h-6" />,
    title: "Interactive Maps",
    desc: "Live Google Maps visualization with day-wise routes, attraction markers, and client-side geocoding.",
    color: "#60A5FA",
    bg: "from-blue-500/10 to-transparent",
  },
  {
    icon: <Wallet className="w-6 h-6" />,
    title: "Budget Optimizer",
    desc: "Real-time cost breakdown across Budget, Standard, and Luxury tiers — every rupee accounted for.",
    color: "#34D399",
    bg: "from-emerald-500/10 to-transparent",
  },
  {
    icon: <Cloud className="w-6 h-6" />,
    title: "Weather Intelligence",
    desc: "7-day forecasts integrated into your itinerary. Best time to visit recommendations built in.",
    color: "#A78BFA",
    bg: "from-violet-500/10 to-transparent",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Collaborative Planning",
    desc: "Invite friends and family. Plan together in real-time with shared itineraries and voting.",
    color: "#FB923C",
    bg: "from-orange-500/10 to-transparent",
  },
  {
    icon: <Download className="w-6 h-6" />,
    title: "Offline JSON Export",
    desc: "Download your complete itinerary as a beautifully formatted JSON structure. Works without internet.",
    color: "#F472B6",
    bg: "from-pink-500/10 to-transparent",
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: "Visa Guidance",
    desc: "Automatic visa requirements, processing times, and fee information for any destination.",
    color: "#FBBF24",
    bg: "from-yellow-500/10 to-transparent",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Instant Generation",
    desc: "Complete itineraries in under 3 seconds. Our RAG system knows every attraction worldwide.",
    color: "#14B8A6",
    bg: "from-teal-500/10 to-transparent",
  },
];

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: (index % 4) * 0.1, ease: [0.77, 0, 0.175, 1] }}
      className="group relative glass rounded-2xl p-6 card-hover overflow-hidden border border-border-theme shadow-sm"
      data-hover
    >
      {/* Gradient bg on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${feature.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

      <div className="relative z-10">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300"
          style={{ background: `${feature.color}15`, color: feature.color }}
        >
          {feature.icon}
        </div>
        <h3 className="text-text-main font-semibold mb-2 text-sm">{feature.title}</h3>
        <p className="text-text-muted text-xs leading-relaxed opacity-90">{feature.desc}</p>
      </div>

      {/* Corner accent */}
      <div
        className="absolute top-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-20 transition-opacity"
        style={{ background: `radial-gradient(circle at top right, ${feature.color}, transparent)` }}
      />
    </motion.div>
  );
}

function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const steps = [
    { n: "01", title: "Describe Your Dream Trip", desc: "Tell us where, when, budget, and vibe. Natural language — just like texting a friend." },
    { n: "02", title: "AI Builds Your Itinerary", desc: "Our RAG system pulls real-time data on hotels, attractions, and restaurants." },
    { n: "03", title: "Customize & Perfect", desc: "Drag, drop, swap, and adjust. The AI recalculates everything instantly." },
    { n: "04", title: "Book & Go", desc: "Book hotels and activities directly. Download your offline itinerary PDF and travel." },
  ];

  return (
    <div ref={ref} className="mt-24">
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-8 h-[1px] bg-accent" />
          <span className="text-accent text-xs font-semibold uppercase tracking-widest">How It Works</span>
          <div className="w-8 h-[1px] bg-accent" />
        </div>
        <h2 className="heading-lg text-text-main">Four steps to<br /><span className="text-gradient">your perfect trip</span></h2>
      </motion.div>

      <div className="grid md:grid-cols-4 gap-6 relative">
        {/* Connecting line */}
        <div className="absolute top-8 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent/30 to-transparent hidden md:block" />

        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 + i * 0.15, duration: 0.6, ease: [0.77, 0, 0.175, 1] }}
            className="text-center relative"
          >
            <div className="w-14 h-14 rounded-full border border-accent/30 bg-primary flex items-center justify-center mx-auto mb-4 relative z-10 shadow-sm">
              <span className="text-accent font-black text-sm">{step.n}</span>
            </div>
            <h4 className="text-text-main font-semibold text-sm mb-2">{step.title}</h4>
            <p className="text-text-muted text-xs leading-relaxed opacity-90">{step.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="features" className="py-24 bg-primary relative overflow-hidden transition-colors duration-300">
      <div className="absolute inset-0 grid-pattern opacity-15" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div ref={ref} className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <div className="w-8 h-[1px] bg-accent" />
            <span className="text-accent text-xs font-semibold uppercase tracking-widest">Everything You Need</span>
            <div className="w-8 h-[1px] bg-accent" />
          </motion.div>

          <motion.h2
            className="heading-lg text-text-main"
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, ease: [0.77, 0, 0.175, 1] }}
          >
            Travel planning, fully
            <br />
            <span className="text-gradient">reimagined with AI</span>
          </motion.h2>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <FeatureCard key={f.title} feature={f} index={i} />
          ))}
        </div>

        <HowItWorks />
      </div>
    </section>
  );
}
