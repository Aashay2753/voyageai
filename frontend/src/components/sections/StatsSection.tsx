"use client";
import { useRef, useState, useEffect } from "react";
import { useInView, motion } from "framer-motion";

function Counter({ to, suffix = "", prefix = "" }: { to: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const start = Date.now();
    const update = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * to));
      if (progress < 1) requestAnimationFrame(update);
      else setCount(to);
    };
    requestAnimationFrame(update);
  }, [inView, to]);

  return (
    <span ref={ref} className="stat-number">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

const stats = [
  { value: 2000000, suffix: "+", prefix: "", label: "Trips Planned", sub: "and counting" },
  { value: 150, suffix: "+", prefix: "", label: "Destinations", sub: "worldwide" },
  { value: 98, suffix: "%", prefix: "", label: "Happy Travelers", sub: "satisfaction rate" },
  { value: 0, suffix: ".3s", prefix: "", label: "Avg Generation", sub: "blazing fast AI" },
];

const testimonials = [
  {
    name: "Priya Sharma",
    location: "Mumbai",
    text: "Planned my entire Bali honeymoon in 45 seconds. The itinerary was absolutely perfect.",
    rating: 5,
    avatar: "PS",
    trip: "Bali Honeymoon",
  },
  {
    name: "Rahul Mehta",
    location: "Bangalore",
    text: "Used VoyageAI for our Manali trip with 6 friends. Budget tracking was incredibly accurate.",
    rating: 5,
    avatar: "RM",
    trip: "Manali Group Trip",
  },
  {
    name: "Ananya Iyer",
    location: "Chennai",
    text: "The AI suggested things I never would have found on my own. Dubai was magical!",
    rating: 5,
    avatar: "AI",
    trip: "Dubai Family Trip",
  },
];

export default function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-24 bg-primary relative overflow-hidden transition-colors duration-300">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-blue-500/5 animate-gradient" style={{ backgroundSize: "200% 200%" }} />
      <div className="orb w-[500px] h-[500px] bg-accent/5 top-0 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-6 relative z-10" ref={ref}>
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.7, ease: [0.77, 0, 0.175, 1] }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-black text-text-main mb-1 leading-none">
                {stat.value === 0 ? (
                  <span>0<span className="text-gradient">.3s</span></span>
                ) : (
                  <span className="text-gradient">
                    <Counter to={stat.value} suffix={stat.suffix} />
                  </span>
                )}
              </div>
              <div className="text-text-main font-semibold text-sm mb-1">{stat.label}</div>
              <div className="text-text-muted text-xs opacity-80">{stat.sub}</div>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <div>
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-[1px] bg-accent" />
              <span className="text-accent text-xs font-semibold uppercase tracking-widest">Real Travelers</span>
              <div className="w-8 h-[1px] bg-accent" />
            </div>
            <h2 className="heading-md text-text-main">What they're saying</h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 40 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
                className="glass rounded-2xl p-6 card-hover border border-border-theme shadow-sm"
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <span key={j} className="text-yellow-400 text-sm">★</span>
                  ))}
                </div>
                <p className="text-text-muted text-sm leading-relaxed mb-5 opacity-90">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center text-accent text-xs font-bold">
                      {t.avatar}
                    </div>
                    <div>
                      <div className="text-text-main text-xs font-semibold">{t.name}</div>
                      <div className="text-text-muted text-xs opacity-75">{t.location}</div>
                    </div>
                  </div>
                  <div className="glass rounded-lg px-2.5 py-1 border border-border-theme">
                    <span className="text-accent text-xs font-semibold">{t.trip}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
