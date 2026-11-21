"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Plane, MapPin, Sparkles, ChevronDown } from "lucide-react";
import { useAppStore } from "@/store/appStore";

const heroWords = ["Perfect", "Effortless", "Memorable", "Intelligent"];
const destinations = ["Goa", "Bali", "Dubai", "Manali", "Paris", "Tokyo", "Thailand"];

function GlobeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let angle = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    const dots: { lat: number; lng: number; size: number }[] = [];
    for (let i = 0; i < 200; i++) {
      dots.push({
        lat: (Math.random() - 0.5) * Math.PI,
        lng: Math.random() * Math.PI * 2,
        size: Math.random() * 1.5 + 0.5,
      });
    }

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2, cy = h / 2;
      const R = Math.min(w, h) * 0.4;

      // Glow
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
      grd.addColorStop(0, "rgba(20, 184, 166, 0.05)");
      grd.addColorStop(1, "transparent");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.3, 0, Math.PI * 2);
      ctx.fill();

      // Globe outline
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(20, 184, 166, 0.15)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Latitude lines
      for (let i = 1; i < 6; i++) {
        const latY = cy + R * Math.cos((i / 6) * Math.PI - Math.PI / 6);
        const latR = R * Math.sin((i / 6) * Math.PI);
        if (latR > 0) {
          ctx.beginPath();
          ctx.ellipse(cx, latY, latR, latR * 0.2, 0, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(20, 184, 166, 0.08)";
          ctx.stroke();
        }
      }

      // Longitude lines
      for (let i = 0; i < 6; i++) {
        const lngAngle = (i / 6) * Math.PI;
        ctx.beginPath();
        ctx.ellipse(cx, cy, R * Math.abs(Math.cos(lngAngle + angle)), R, lngAngle + angle, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(20, 184, 166, 0.06)";
        ctx.stroke();
      }

      // Dots
      dots.forEach((dot) => {
        const lng = dot.lng + angle;
        const cosLat = Math.cos(dot.lat);
        const x3d = cosLat * Math.cos(lng);
        const y3d = Math.sin(dot.lat);
        const z3d = cosLat * Math.sin(lng);
        if (z3d > 0) {
          const x = cx + R * x3d;
          const y = cy - R * y3d;
          ctx.beginPath();
          ctx.arc(x, y, dot.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(20, 184, 166, ${0.3 + z3d * 0.5})`;
          ctx.fill();
        }
      });

      // Animated plane orbit
      const planeAngle = angle * 2;
      const px = cx + R * 0.9 * Math.cos(planeAngle);
      const py = cy + R * 0.3 * Math.sin(planeAngle * 0.7);
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(planeAngle + 0.5);
      ctx.fillStyle = "#14B8A6";
      ctx.beginPath();
      ctx.moveTo(0, -4);
      ctx.lineTo(3, 2);
      ctx.lineTo(0, 0);
      ctx.lineTo(-3, 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Trail
      ctx.beginPath();
      ctx.arc(cx, cy, R * 0.9, planeAngle - 0.8, planeAngle);
      ctx.strokeStyle = "rgba(20, 184, 166, 0.3)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      angle += 0.003;
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: "block" }}
    />
  );
}

export default function HeroSection() {
  const [wordIdx, setWordIdx] = useState(0);
  const [destIdx, setDestIdx] = useState(0);
  const [query, setQuery] = useState("");
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 600], [1, 0]);
  const heroY = useTransform(scrollY, [0, 600], [0, 100]);
  const globeScale = useTransform(scrollY, [0, 400], [1, 0.8]);
  const setPlannerQuery = useAppStore((s) => s.setPlannerQuery);

  useEffect(() => {
    const t1 = setInterval(() => setWordIdx((i) => (i + 1) % heroWords.length), 2500);
    const t2 = setInterval(() => setDestIdx((i) => (i + 1) % destinations.length), 1800);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);

  const scrollToPlanner = (q: string) => {
    setPlannerQuery(q);
    document.getElementById("planner")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSearch = () => {
    if (!query) return;
    scrollToPlanner(query);
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-primary noise transition-colors duration-300">
      {/* Background gradient */}
      <div className="absolute inset-0">
        <div className="orb w-[600px] h-[600px] bg-accent/6 top-1/4 -right-32" />
        <div className="orb w-[400px] h-[400px] bg-blue-500/4 -top-20 left-1/4" />
        <div className="orb w-[300px] h-[300px] bg-purple-500/4 bottom-1/4 left-1/3" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 grid-pattern opacity-40" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-12 grid lg:grid-cols-2 gap-12 items-center w-full">
        {/* Left: Content */}
        <motion.div style={{ opacity: heroOpacity, y: heroY }}>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3.1, duration: 0.6 }}
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8"
          >
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-text-muted text-xs font-medium tracking-wider uppercase">
              AI-Powered Travel Intelligence
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.2 }}
          >
            <h1 className="heading-xl text-text-main mb-2">
              Your Personal
            </h1>
            <h1 className="heading-xl text-text-main mb-2">
              <AnimatePresence mode="wait">
                <motion.span
                  key={wordIdx}
                  className="text-gradient inline-block"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40 }}
                  transition={{ duration: 0.5, ease: [0.77, 0, 0.175, 1] }}
                >
                  {heroWords[wordIdx]}
                </motion.span>
              </AnimatePresence>
            </h1>
            <h1 className="heading-xl text-text-main">
              AI Travel Planner
            </h1>
          </motion.div>

          <motion.p
            className="text-text-muted text-lg mt-6 mb-8 leading-relaxed max-w-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3.4, duration: 0.6 }}
          >
            Create complete travel itineraries in seconds. Hotels, restaurants, activities,
            budget — all optimized by AI for your perfect trip.
          </motion.p>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3.5, duration: 0.6 }}
            className="relative mb-6"
          >
            <div className="glass rounded-2xl p-1.5 flex items-center gap-3 shadow-sm border border-border-theme">
              <div className="flex items-center gap-2 flex-1 px-4">
                <MapPin className="w-5 h-5 text-accent flex-shrink-0" />
                <div className="flex-1">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder={`Try "3 days in ${destinations[destIdx]}"`}
                    className="w-full bg-transparent text-text-main placeholder-text-muted/60 outline-none text-sm font-medium"
                  />
                </div>
              </div>
              <button
                onClick={handleSearch}
                className="bg-accent hover:bg-accent-dark text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-all neon-glow text-sm"
              >
                <Plane className="w-4 h-4" />
                <span className="hidden sm:block">Plan Trip</span>
              </button>
            </div>
          </motion.div>

          {/* Quick examples */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.7 }}
            className="flex flex-wrap gap-2 mb-8"
          >
            {["3 days in Goa", "Honeymoon in Bali", "Budget Manali trip", "Family Dubai"].map((ex) => (
              <button
                key={ex}
                onClick={() => { setQuery(ex); scrollToPlanner(ex); }}
                className="glass text-text-muted hover:text-accent hover:border-accent/30 text-xs px-3 py-1.5 rounded-full transition-all border border-border-theme"
              >
                {ex}
              </button>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3.8 }}
            className="flex gap-8"
          >
            {[
              { n: "2M+", l: "Trips Planned" },
              { n: "150+", l: "Destinations" },
              { n: "4.9★", l: "User Rating" },
            ].map((stat) => (
              <div key={stat.l}>
                <div className="text-2xl font-black text-text-main">{stat.n}</div>
                <div className="text-text-muted text-xs">{stat.l}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right: Globe */}
        <motion.div
          className="relative hidden lg:block"
          style={{ scale: globeScale }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 3.3, duration: 1, ease: [0.77, 0, 0.175, 1] }}
        >
          <div className="w-full aspect-square max-w-[520px] mx-auto relative">
            <GlobeCanvas />

            {/* Floating cards */}
            <motion.div
              className="absolute top-8 -left-8 glass rounded-xl p-3 flex items-center gap-3 float-a shadow-md border border-border-theme"
            >
              <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">🏖️</div>
              <div>
                <div className="text-text-main text-xs font-semibold">Goa Beach</div>
                <div className="text-text-muted text-xs">₹12,000 · 3 days</div>
              </div>
            </motion.div>

            <motion.div
              className="absolute bottom-16 -right-6 glass rounded-xl p-3 flex items-center gap-3 float-b shadow-md border border-border-theme"
            >
              <div className="w-8 h-8 bg-orange-400/20 rounded-lg flex items-center justify-center">🏯</div>
              <div>
                <div className="text-text-main text-xs font-semibold">Bali Temple</div>
                <div className="text-text-muted text-xs">₹45,000 · 5 days</div>
              </div>
            </motion.div>

            <motion.div
              className="absolute top-1/2 -right-12 glass rounded-xl p-3 float-a shadow-md border border-border-theme"
              style={{ animationDelay: "2s" }}
            >
              <div className="text-accent text-xs font-bold">AI Planning</div>
              <div className="text-text-main text-lg font-black">0.3s</div>
              <div className="text-text-muted text-xs font-medium">response time</div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 4.5 }}
      >
        <span className="text-text-muted text-xs tracking-widest uppercase opacity-70">Scroll to Explore</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown className="w-5 h-5 text-accent" />
        </motion.div>
      </motion.div>
    </section>
  );
}
