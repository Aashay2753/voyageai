"use client";
import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useAppStore } from "@/store/appStore";

const destinations = [
  {
    name: "Goa",
    country: "India",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&q=80",
    tag: "Beach & Nightlife",
    price: "₹8,000",
    duration: "3 days",
    emoji: "🏖️",
    accent: "#0d9488",
  },
  {
    name: "Bali",
    country: "Indonesia",
    image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80",
    tag: "Culture & Nature",
    price: "₹35,000",
    duration: "5 days",
    emoji: "🌺",
    accent: "#F59E0B",
  },
  {
    name: "Manali",
    country: "India",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    tag: "Mountain Escape",
    price: "₹12,000",
    duration: "4 days",
    emoji: "🏔️",
    accent: "#60A5FA",
  },
  {
    name: "Dubai",
    country: "UAE",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80",
    tag: "Luxury & Skyline",
    price: "₹65,000",
    duration: "5 days",
    emoji: "🌆",
    accent: "#F97316",
  },
  {
    name: "Paris",
    country: "France",
    image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&q=80",
    tag: "Romance & Art",
    price: "₹1,20,000",
    duration: "6 days",
    emoji: "🗼",
    accent: "#EC4899",
  },
  {
    name: "Thailand",
    country: "Southeast Asia",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
    tag: "Adventure & Food",
    price: "₹28,000",
    duration: "7 days",
    emoji: "🐘",
    accent: "#8B5CF6",
  },
];

function DestCard({ dest, index }: { dest: typeof destinations[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const setPlannerQuery = useAppStore((s) => s.setPlannerQuery);

  const handleClick = () => {
    setPlannerQuery(`${dest.duration} trip to ${dest.name} under ${dest.price}`);
    document.getElementById("planner")?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 80 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.77, 0, 0.175, 1] }}
      className="dest-card group cursor-pointer card-hover"
      onClick={handleClick}
      data-hover
    >
      <div className="aspect-[3/4] relative overflow-hidden rounded-2xl">
        <img
          src={dest.image}
          alt={dest.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-10" />

        {/* Tag */}
        <div className="absolute top-4 left-4 z-20">
          <span className="glass text-white text-xs px-3 py-1.5 rounded-full font-medium">
            {dest.emoji} {dest.tag}
          </span>
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-white/70 text-xs uppercase tracking-wider mb-1">{dest.country}</p>
              <h3 className="text-white text-2xl font-black">{dest.name}</h3>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-white/80 text-sm">from {dest.price}</span>
                <span className="text-white/40 text-xs">·</span>
                <span className="text-white/80 text-sm">{dest.duration}</span>
              </div>
            </div>
            <motion.div
              className="w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
              style={{ background: dest.accent }}
              whileHover={{ scale: 1.1 }}
            >
              <ArrowUpRight className="w-5 h-5 text-white" />
            </motion.div>
          </div>
        </div>

        {/* Hover glow */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 z-10"
          style={{ background: `radial-gradient(circle at bottom, ${dest.accent}, transparent 60%)` }}
        />
      </div>
    </motion.div>
  );
}

export default function DestinationsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-150px" });
  const [customDest, setCustomDest] = useState("");
  const setPlannerQuery = useAppStore((s) => s.setPlannerQuery);

  const handlePlanNow = () => {
    if (!customDest.trim()) return;
    setPlannerQuery(`Trip to ${customDest}`);
    document.getElementById("planner")?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <section id="destinations" className="py-24 bg-primary relative overflow-hidden transition-colors duration-300">
      {/* Background */}
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="orb w-96 h-96 bg-accent/5 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section header */}
        <div ref={ref} className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-8 h-[1px] bg-accent" />
            <span className="text-accent text-xs font-semibold uppercase tracking-widest">
              Explore the World
            </span>
          </motion.div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <motion.h2
              className="heading-lg text-text-main max-w-lg"
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.77, 0, 0.175, 1] }}
            >
              Discover Your
              <br />
              <span className="text-gradient">Dream</span> Destination
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="max-w-sm"
            >
              <p className="text-text-muted text-sm leading-relaxed mb-4">
                150+ destinations. AI curated. Budget optimized. Click any destination and
                get a complete itinerary in under a second.
              </p>
              <button onClick={() => document.getElementById("planner")?.scrollIntoView({ behavior: "smooth" })} className="text-accent text-sm font-semibold flex items-center gap-2 group">
                View all destinations
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </motion.div>
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {destinations.map((dest, i) => (
            <DestCard key={dest.name} dest={dest} index={i} />
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="glass rounded-2xl p-8 inline-block border border-border-theme shadow-sm">
            <p className="text-text-main text-sm mb-4">Can&apos;t find your dream destination?</p>
            <div className="flex items-center gap-3 justify-center">
              <input
                type="text"
                value={customDest}
                onChange={(e) => setCustomDest(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePlanNow()}
                placeholder="Type any destination..."
                className="bg-secondary border border-border-theme rounded-xl px-4 py-2.5 text-text-main placeholder-text-muted/50 text-sm outline-none focus:border-accent/50 w-48 transition-colors"
              />
              <button onClick={handlePlanNow} className="bg-accent hover:bg-accent-dark text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all neon-glow">
                Plan Now
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
