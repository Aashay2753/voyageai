"use client";
import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Sparkles, Send, Plane, MapPin, Clock, Download, ChevronRight, Sun, IndianRupee } from "lucide-react";
import { tripsAPI } from "@/lib/api";
import { useAppStore } from "@/store/appStore";

const budgetTiers = ["Budget", "Standard", "Luxury"];

const typeIcons: Record<string, string> = {
  hotel: "🏨",
  food: "🍴",
  activity: "🎟️",
  transport: "🚗",
};

const typeColors: Record<string, string> = {
  hotel: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
  food: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  activity: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  transport: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
};

export default function PlannerSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [activeDay, setActiveDay] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [budgetTier, setBudgetTier] = useState<string>("Standard");
  const [itinerary, setItinerary] = useState<any>(null);
  const [error, setError] = useState("");

  // Listen to store query from Hero/Destinations
  const plannerQuery = useAppStore((s) => s.plannerQuery);
  const setPlannerQuery = useAppStore((s) => s.setPlannerQuery);
  const setCurrentTrip = useAppStore((s) => s.setCurrentTrip);

  useEffect(() => {
    if (plannerQuery) {
      setPrompt(plannerQuery);
      setPlannerQuery(""); // clear after consuming
    }
  }, [plannerQuery, setPlannerQuery]);

  const handleGenerate = async () => {
    const q = prompt || "3 days trip to Goa under ₹15,000";
    if (!prompt) setPrompt(q);

    setGenerating(true);
    setGenerated(false);
    setError("");
    setActiveDay(0);

    try {
      const res = await tripsAPI.generate({
        prompt: q,
        budget_tier: budgetTier.toLowerCase(),
      });
      const data = res.data?.itinerary || res.data;
      setItinerary(data);
      setCurrentTrip({
        id: res.data?.trip_id || "temp-id",
        destination: data.destination || "Goa, India",
        title: data.title || `Trip to ${data.destination}`,
        duration_days: data.duration_days || 3,
        itinerary: data,
        created_at: new Date().toISOString()
      });
      if (res.data?.gemini_error) {
        const errStr = res.data.gemini_error;
        if (errStr.includes("RESOURCE_EXHAUSTED") || errStr.includes("quota")) {
          setError("Gemini API Quota Exceeded (429). Operating in offline fallback mode.");
        } else if (errStr.includes("API_KEY_INVALID") || errStr.includes("not found")) {
          setError("Invalid Gemini API Key. Operating in offline fallback mode.");
        } else {
          setError(`Gemini Error: ${errStr.length > 80 ? errStr.slice(0, 80) + "..." : errStr}`);
        }
      } else {
        setError("");
      }
      setGenerated(true);
    } catch (err: any) {
      console.error("Generation error:", err);
      setError("Could not generate itinerary. Using demo data.");
      // Fallback to demo data
      setItinerary(demoItinerary);
      setCurrentTrip({
        id: "temp-id",
        destination: demoItinerary.destination,
        title: demoItinerary.title,
        duration_days: demoItinerary.duration_days,
        itinerary: demoItinerary,
        created_at: new Date().toISOString()
      });
      setGenerated(true);
    } finally {
      setGenerating(false);
    }
  };

  const days = itinerary?.days || [];
  const currentDay = days[activeDay];

  const handleExportPDF = () => {
    if (!itinerary) return;
    const text = JSON.stringify(itinerary, null, 2);
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `voyageai-${itinerary.destination || "trip"}-itinerary.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section id="planner" className="py-24 bg-primary relative overflow-hidden transition-colors duration-300">
      <div className="absolute inset-0 grid-pattern opacity-10" />
      <div className="orb w-96 h-96 bg-accent/5 bottom-0 right-0" />

      <div className="max-w-7xl mx-auto px-6 relative z-10" ref={ref}>
        {/* Header */}
        <div className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-6 border border-border-theme"
          >
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-accent text-xs font-semibold uppercase tracking-widest">AI Itinerary Builder</span>
          </motion.div>

          <motion.h2
            className="heading-lg text-text-main"
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, ease: [0.77, 0, 0.175, 1] }}
          >
            From idea to itinerary
            <br />
            <span className="text-gradient">in seconds</span>
          </motion.h2>

          <motion.p
            className="text-text-muted mt-4 max-w-xl mx-auto"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3 }}
          >
            Just describe your trip. Our AI handles hotels, restaurants, activities, timing, and budget.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left: Input panel */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            <div className="glass rounded-2xl p-6 h-full border border-border-theme shadow-sm">
              <h3 className="text-text-main font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                Describe Your Trip
              </h3>

              <textarea
                value={prompt || ""}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Try: '3 days trip to Goa under ₹15,000 for 2 people. I love beaches and seafood. Staying in a mid-range hotel.'"
                className="w-full bg-secondary border border-border-theme rounded-xl p-4 text-text-main text-sm outline-none focus:border-accent/50 resize-none h-32 transition-colors placeholder-text-muted/40"
              />

              {/* Quick prompts */}
              <div className="mt-3 space-y-2">
                <p className="text-text-muted text-xs opacity-75">Quick examples:</p>
                {[
                  "3 days in Goa under ₹15,000",
                  "Honeymoon in Bali, 5 days",
                  "Budget Manali trip for 2 friends",
                  "Family trip to Dubai, 5 days luxury",
                ].map((ex) => (
                  <button
                    key={ex}
                    onClick={() => setPrompt(ex)}
                    className="flex items-center gap-2 text-xs text-text-muted hover:text-accent transition-colors w-full text-left group"
                  >
                    <ChevronRight className="w-3 h-3 text-accent/50 group-hover:text-accent" />
                    {ex}
                  </button>
                ))}
              </div>

              {/* Budget tier toggle */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                {budgetTiers.map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setBudgetTier(tier)}
                    className={`text-xs py-2 rounded-lg border transition-all ${
                      tier === budgetTier
                        ? "border-accent bg-accent/10 text-accent font-semibold"
                        : "border-border-theme text-text-muted hover:border-accent/30"
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>

              <button
                onClick={handleGenerate}
                disabled={generating}
                className="mt-5 w-full bg-accent hover:bg-accent-dark text-white font-semibold py-3.5 rounded-xl transition-all neon-glow flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {generating ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    Generating...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Generate Itinerary
                  </>
                )}
              </button>

              {/* Budget breakdown */}
              {generated && itinerary?.budget_breakdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-secondary rounded-xl border border-border-theme"
                >
                  <p className="text-text-main text-xs font-semibold mb-3">💰 Budget Breakdown</p>
                  {Object.entries(itinerary.budget_breakdown).map(([label, cost]: [string, any]) => {
                    const total = itinerary.total_budget_inr || Object.values(itinerary.budget_breakdown).reduce((a: number, b: any) => a + Number(b), 0);
                    const pct = total ? Math.round((Number(cost) / Number(total)) * 100) : 25;
                    return (
                      <div key={label} className="mb-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-text-muted capitalize">{label}</span>
                          <span className="text-text-main font-medium">₹{Number(cost).toLocaleString()}</span>
                        </div>
                        <div className="h-1.5 bg-primary rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-accent rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  <div className="mt-3 pt-3 border-t border-border-theme flex justify-between">
                    <span className="text-text-muted text-xs">Total</span>
                    <span className="text-accent font-bold text-sm">
                      ₹{Number(itinerary.total_budget_inr || 0).toLocaleString()}
                    </span>
                  </div>
                </motion.div>
              )}

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl text-xs flex items-start gap-2"
                  >
                    <span className="flex-shrink-0 mt-0.5">⚠️</span>
                    <div className="flex-1">
                      <p className="font-semibold mb-0.5">Offline Mode Active</p>
                      <p className="opacity-90">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Right: Itinerary output */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            <div className="glass rounded-2xl p-6 h-full min-h-[480px] border border-border-theme shadow-sm">
              <AnimatePresence mode="wait">
                {!generated && !generating && (
                  <motion.div
                    key="empty"
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center text-center py-16"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-4">
                      <Plane className="w-8 h-8 text-accent" />
                    </div>
                    <p className="text-text-main font-semibold mb-2">Your itinerary will appear here</p>
                    <p className="text-text-muted text-sm max-w-xs">
                      Describe your trip on the left and hit Generate. AI will craft a complete day-by-day plan.
                    </p>
                  </motion.div>
                )}

                {generating && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center gap-6"
                  >
                    <div className="relative">
                      <motion.div
                        className="w-16 h-16 rounded-full border-2 border-accent"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      <Plane className="w-6 h-6 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <div className="space-y-2 w-full max-w-xs">
                      {["Analyzing destination data...", "Optimizing hotel choices...", "Building day-wise schedule...", "Calculating budget..."].map(
                        (msg, i) => (
                          <motion.div
                            key={msg}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.5 }}
                            className="flex items-center gap-2 text-sm text-text-muted"
                          >
                            <motion.div
                              className="w-1.5 h-1.5 rounded-full bg-accent"
                              animate={{ scale: [1, 1.5, 1] }}
                              transition={{ duration: 0.5, delay: i * 0.5 + 0.3 }}
                            />
                            {msg}
                          </motion.div>
                        )
                      )}
                    </div>
                  </motion.div>
                )}

                {generated && itinerary && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {/* Trip header */}
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <MapPin className="w-4 h-4 text-accent" />
                          <span className="text-accent text-sm font-semibold">{itinerary.destination}</span>
                        </div>
                        <h3 className="text-text-main font-bold text-xl">{itinerary.title || `Your ${itinerary.destination} Itinerary`}</h3>
                        <div className="flex items-center gap-4 mt-2 text-text-muted text-xs">
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{itinerary.duration_days} days</span>
                          <span className="flex items-center gap-1"><IndianRupee className="w-3.5 h-3.5" />₹{Number(itinerary.total_budget_inr || 0).toLocaleString()} total</span>
                          {itinerary.weather && <span className="flex items-center gap-1"><Sun className="w-3.5 h-3.5 text-yellow-500" />{itinerary.weather}</span>}
                        </div>
                      </div>
                      <button
                        onClick={handleExportPDF}
                        className="glass border border-border-theme text-accent text-xs px-3 py-1.5 rounded-lg hover:bg-accent/10 transition-colors flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        Export
                      </button>
                    </div>

                    {/* Day tabs */}
                    <div className="flex gap-2 mb-6 flex-wrap relative">
                      {days.map((d: any, i: number) => (
                        <button
                          key={i}
                          onClick={() => setActiveDay(i)}
                          className="relative text-xs px-4 py-2.5 rounded-lg font-semibold transition-colors duration-200 border border-border-theme/40 overflow-hidden"
                          style={{
                            color: activeDay === i ? "#ffffff" : "var(--text-muted)",
                            background: activeDay === i ? "transparent" : "rgba(255,255,255,0.02)"
                          }}
                        >
                          {activeDay === i && (
                            <motion.div
                              layoutId="activeDayTab"
                              className="absolute inset-0 bg-accent -z-10"
                              transition={{ type: "spring", stiffness: 380, damping: 30 }}
                            />
                          )}
                          <span className="relative z-10">Day {d.day || i + 1}</span>
                        </button>
                      ))}
                    </div>

                    {/* Active day */}
                    {currentDay && (
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeDay}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -15 }}
                          transition={{ duration: 0.35, ease: [0.77, 0, 0.175, 1] }}
                        >
                          <p className="text-text-main text-sm font-semibold mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                            {currentDay.title}
                          </p>
                          <div className="space-y-3.5 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
                            {(currentDay.activities || []).map((act: any, i: number) => {
                              const actType = act.type || "activity";
                              const costNum = act.cost_inr != null ? Number(act.cost_inr) : null;
                              const displayCost = costNum != null ? (costNum === 0 ? "Free" : `₹${costNum.toLocaleString()}`) : (act.cost || "");
                              return (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  whileHover={{ y: -3, scale: 1.005, borderColor: "rgba(239, 68, 68, 0.3)" }}
                                  transition={{ 
                                    type: "spring",
                                    stiffness: 260,
                                    damping: 22,
                                    delay: i * 0.05 
                                  }}
                                  className="flex items-start gap-3.5 p-3.5 bg-secondary rounded-xl transition-all border border-border-theme/40 shadow-sm cursor-default"
                                >
                                  {/* Left: Time and vertical line */}
                                  <div className="flex flex-col items-center gap-1.5 min-w-[65px] pt-0.5">
                                    <span className="text-text-muted text-[10px] font-bold tracking-wider uppercase opacity-90">{act.time}</span>
                                    <div className="w-[1px] h-5 bg-border-theme/50" />
                                  </div>

                                  {/* Center Left: Icon */}
                                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-border-theme/20 ${typeColors[actType] || typeColors.activity}`}>
                                    <span className="text-sm">{typeIcons[actType] || typeIcons.activity}</span>
                                  </div>

                                  {/* Center: Activity details */}
                                  <div className="flex-1 min-w-0 pt-0.5">
                                    <p className="text-text-main text-xs font-bold leading-snug">{act.title || act.activity}</p>
                                    {act.description && (
                                      <p className="text-text-muted text-[11px] mt-1 leading-relaxed opacity-85">
                                        {act.description}
                                      </p>
                                    )}
                                    {act.tips && (
                                      <div className="mt-1.5 inline-flex items-center gap-1 bg-accent/5 dark:bg-accent/10 border border-accent/10 rounded-lg px-2 py-1 text-[10px] text-accent font-medium max-w-full">
                                        <span>💡</span>
                                        <span className="truncate">{act.tips}</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Right: Cost */}
                                  <span className="text-text-main text-xs font-extrabold flex-shrink-0 pt-0.5 min-w-[55px] text-right">
                                    {displayCost}
                                  </span>
                                </motion.div>
                              );
                            })}
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Fallback demo data (same structure as backend mock)
const demoItinerary = {
  destination: "Goa, India",
  title: "3-Day Goa Beach & Culture Trip",
  duration_days: 3,
  total_budget_inr: 15000,
  budget_breakdown: { accommodation: 7500, food: 2400, transport: 1600, activities: 3500 },
  best_time: "October to March",
  weather: "28°C, sunny",
  days: [
    {
      day: 1, title: "Arrival & North Goa Beaches",
      activities: [
        { time: "10:00 AM", title: "Arrive at Goa Airport", description: "Check into hotel in Calangute area", type: "hotel", cost_inr: 2500, tips: "Book Ola/Uber from airport — cheaper than prepaid taxis" },
        { time: "01:00 PM", title: "Lunch at Fisherman's Wharf", description: "Iconic Goan seafood restaurant with river views", type: "food", cost_inr: 600, tips: "Try the crab xacuti and sol kadhi" },
        { time: "03:00 PM", title: "Calangute Beach & Water Sports", description: "Parasailing, jet ski, and banana boat rides", type: "activity", cost_inr: 400, tips: "Negotiate prices — standard parasailing is ₹400" },
        { time: "07:00 PM", title: "Anjuna Flea Market", description: "Wednesday flea market with local crafts", type: "activity", cost_inr: 300 },
        { time: "09:00 PM", title: "Dinner at Britto's", description: "Iconic beach shack, perfect Goan thali", type: "food", cost_inr: 800 },
      ],
    },
    {
      day: 2, title: "Heritage & Nature Day",
      activities: [
        { time: "09:00 AM", title: "Basilica of Bom Jesus", description: "UNESCO World Heritage site", type: "activity", cost_inr: 200, tips: "Go early to avoid crowds" },
        { time: "12:00 PM", title: "Local Goan Thali", description: "Authentic thali with 12 items", type: "food", cost_inr: 300 },
        { time: "02:30 PM", title: "Dudhsagar Falls Jeep Safari", description: "India's 5th highest waterfall", type: "activity", cost_inr: 1800, tips: "Best during Nov-Feb" },
        { time: "07:30 PM", title: "Casino Cruise", description: "Evening on the Delta Corp Casino", type: "activity", cost_inr: 2000 },
      ],
    },
    {
      day: 3, title: "South Goa & Departure",
      activities: [
        { time: "08:00 AM", title: "Sunrise at Palolem Beach", description: "One of India's most beautiful beaches", type: "activity", cost_inr: 0 },
        { time: "11:00 AM", title: "Colva Beach Relaxation", description: "Long, clean beach with few tourists", type: "activity", cost_inr: 0 },
        { time: "01:30 PM", title: "Lunch at Martin's Corner", description: "Best Goan-Portuguese fusion", type: "food", cost_inr: 700, tips: "Their sausage pizza is legendary" },
        { time: "03:30 PM", title: "Shopping at Mapusa Market", description: "Spices, cashews, feni, and art", type: "activity", cost_inr: 500 },
        { time: "05:30 PM", title: "Head to Airport", description: "Cab back to Goa Airport", type: "transport", cost_inr: 600 },
      ],
    },
  ],
};
