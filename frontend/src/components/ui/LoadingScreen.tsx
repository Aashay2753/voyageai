"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoadingScreen() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + Math.random() * 12;
      });
    }, 120);
    const timer = setTimeout(() => setLoading(false), 2800);
    return () => { clearInterval(interval); clearTimeout(timer); };
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="loader-screen"
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.8, ease: [0.77, 0, 0.175, 1] }}
        >
          {/* Ambient orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "1s" }} />

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-center mb-12 relative z-10 animate-fade-in"
          >
            {/* Animated plane SVG */}
            <svg width="80" height="80" viewBox="0 0 80 80" className="mx-auto mb-6">
              <circle cx="40" cy="40" r="38" stroke="#0d9488" strokeWidth="1.5" fill="none" strokeDasharray="240" className="loader-path" />
              <motion.g
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                style={{ transformOrigin: "40px 40px" }}
              >
                <circle cx="40" cy="6" r="3" fill="#0d9488" />
              </motion.g>
              <text x="40" y="45" textAnchor="middle" fill="currentColor" fontSize="14" fontWeight="800" letterSpacing="-0.5" className="text-text-main">V</text>
            </svg>

            <motion.h1
              className="text-4xl font-black text-text-main tracking-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Voyage<span className="text-gradient">AI</span>
            </motion.h1>
            <motion.p
              className="text-text-muted text-xs mt-2 tracking-widest uppercase opacity-75"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              Plan Perfect Trips in Seconds
            </motion.p>
          </motion.div>

          {/* Progress bar */}
          <motion.div
            className="w-64 relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <div className="h-[2px] bg-secondary rounded-full overflow-hidden border border-border-theme/40">
              <motion.div
                className="h-full bg-accent rounded-full"
                style={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="flex justify-between mt-3 text-xs text-text-muted opacity-80">
              <span>Loading experience</span>
              <span className="font-semibold">{Math.min(Math.round(progress), 100)}%</span>
            </div>
          </motion.div>

          {/* Travel path dots */}
          <motion.div
            className="absolute bottom-12 left-0 right-0 flex justify-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            {["Goa", "Bali", "Dubai", "Paris"].map((city, i) => (
              <motion.span
                key={city}
                className="text-xs text-text-muted uppercase tracking-widest font-medium"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
              >
                {city}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
