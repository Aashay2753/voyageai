"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import { chatAPI } from "@/lib/api";

const QUICK = ["Best time to visit Goa?", "Cheapest hotels in Bali?", "Visa for Dubai?", "Top activities in Manali?"];

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const RESPONSES: Record<string, string> = {
  default: "I can help you plan trips, find hotels, check visa requirements, suggest activities, and optimize your travel budget. What destination are you dreaming of?",
  goa: "🌊 **Best time for Goa:** October to March is peak season with perfect weather (22-28°C). November-February is ideal. Avoid June-September (monsoon). Beach parties and water sports are best Dec-Jan. Would you like me to plan your Goa trip?",
  bali: "🏯 **Bali hotels range** from budget guesthouses (₹800/night) to luxury villas (₹15,000+/night). Seminyak is best for nightlife, Ubud for culture, Canggu for surfers. Budget pick: The Layar. Luxury: Four Seasons Jimbaran.",
  visa: "🛂 **Dubai visa for Indians:** Apply for UAE Tourist Visa (30 days) online via GDRFA website or through Emirates/Air Arabia. Cost: ~AED 350 (~₹8,000). Processing: 3-4 working days. You'll need 6-month valid passport + confirmed hotel booking.",
  manali: "🏔️ **Top Manali activities:** Rohtang Pass snow experience, Solang Valley skiing, Hadimba Temple, paragliding at Solang Nala, Beas Kund trek, hot springs at Manikaran. Best for adventure: May-June and Sep-Oct.",
};

function getResponse(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes("goa") || lower.includes("beach")) return RESPONSES.goa;
  if (lower.includes("bali") || lower.includes("hotel")) return RESPONSES.bali;
  if (lower.includes("visa") || lower.includes("dubai")) return RESPONSES.visa;
  if (lower.includes("manali") || lower.includes("mountain")) return RESPONSES.manali;
  return RESPONSES.default;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "👋 Hi! I'm your VoyageAI travel assistant. Ask me anything about destinations, hotels, visas, or let me plan your complete trip!" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [geminiError, setGeminiError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = async (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setTyping(true);

    try {
      const res = await chatAPI.send(text);
      if (res.data?.gemini_error) {
        const errStr = res.data.gemini_error;
        if (errStr.includes("RESOURCE_EXHAUSTED") || errStr.includes("quota")) {
          setGeminiError("Gemini API Quota Exceeded (429). Operating in offline fallback mode.");
        } else if (errStr.includes("API_KEY_INVALID") || errStr.includes("not found")) {
          setGeminiError("Invalid Gemini API Key. Operating in offline fallback mode.");
        } else {
          setGeminiError(`Gemini Error: ${errStr.length > 80 ? errStr.slice(0, 80) + "..." : errStr}`);
        }
      } else {
        setGeminiError(null);
      }
      const reply = res.data?.reply || res.data?.response || res.data?.message || getResponse(text);
      setTyping(false);
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      setGeminiError("Backend connection failed. Running in local fallback mode.");
      // Fallback to local mock if API fails
      await new Promise((r) => setTimeout(r, 800));
      setTyping(false);
      setMessages((m) => [...m, { role: "assistant", content: getResponse(text) }]);
    }
  };

  return (
    <>
      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.77, 0, 0.175, 1] }}
            className="fixed bottom-24 right-6 w-[360px] max-h-[520px] bg-primary glass border border-border-theme rounded-2xl overflow-hidden z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border-theme bg-secondary">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <div className="text-text-main text-sm font-semibold">VoyageAI Assistant</div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-text-muted text-xs opacity-75">Online</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-text-muted hover:text-text-main transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Gemini Error Alert */}
            <AnimatePresence>
              {geminiError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-[10px] text-amber-600 dark:text-amber-400 flex items-start justify-between gap-2 flex-shrink-0"
                >
                  <span className="flex-1 font-medium">⚠️ {geminiError}</span>
                  <button onClick={() => setGeminiError(null)} className="text-amber-500 hover:text-amber-700 mt-0.5 flex-shrink-0">
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] text-xs leading-relaxed px-3 py-2 rounded-xl chat-bubble ${
                      msg.role === "user"
                        ? "bg-accent text-white rounded-br-sm shadow-sm"
                        : "bg-secondary text-text-main border border-border-theme/40 rounded-bl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {typing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-secondary border border-border-theme/40 px-4 py-2.5 rounded-xl rounded-bl-sm flex items-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-accent"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              <div ref={endRef} />
            </div>

            {/* Quick replies */}
            <div className="px-4 pb-2 flex gap-1.5 flex-wrap">
              {QUICK.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="bg-secondary text-xs text-text-muted hover:text-accent px-2.5 py-1 rounded-full transition-colors border border-border-theme hover:border-accent/30"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border-theme">
              <div className="flex items-center gap-2 bg-secondary border border-border-theme rounded-xl px-3 py-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send(input)}
                  placeholder="Ask anything about travel..."
                  className="flex-1 bg-transparent text-text-main text-xs outline-none placeholder-text-muted/40"
                />
                <button
                  onClick={() => send(input)}
                  disabled={!input.trim() || typing}
                  className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center disabled:opacity-50 transition-opacity"
                >
                  <Send className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-accent shadow-lg flex items-center justify-center z-50 neon-glow"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 4, type: "spring", stiffness: 300 }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-5 h-5 text-white" />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="w-5 h-5 text-white" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse ring */}
        {!open && (
          <motion.div
            className="absolute inset-0 rounded-full border border-accent"
            animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.button>
    </>
  );
}
