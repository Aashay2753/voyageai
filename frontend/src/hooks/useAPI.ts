import { useState, useCallback } from "react";
import { tripsAPI, chatAPI } from "@/lib/api";

// ─── useGenerateTrip ─────────────────────────────────────────────────────────

export function useGenerateTrip() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [itinerary, setItinerary] = useState<any>(null);

  const generate = useCallback(async (prompt: string, budgetTier = "standard") => {
    setLoading(true);
    setError(null);
    try {
      const res = await tripsAPI.generate({ prompt, budget_tier: budgetTier });
      setItinerary(res.data.itinerary);
      return res.data;
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Failed to generate itinerary. Please try again.";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { generate, loading, error, itinerary };
}

// ─── useChat ─────────────────────────────────────────────────────────────────

export function useChat() {
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);

  const sendMessage = useCallback(async (message: string): Promise<string> => {
    setLoading(true);
    try {
      const res = await chatAPI.send(message, sessionId);
      if (!sessionId) setSessionId(res.data.session_id);
      return res.data.reply;
    } catch {
      return "Sorry, I'm having trouble connecting right now. Please try again!";
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  return { sendMessage, loading, sessionId };
}
