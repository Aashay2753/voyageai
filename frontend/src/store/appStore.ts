import { create } from "zustand";

interface Trip {
  id: string;
  destination: string;
  title: string;
  duration_days: number;
  itinerary: any;
  created_at: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  is_premium: boolean;
}

interface AppStore {
  // Auth
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;

  // Trips
  currentTrip: Trip | null;
  savedTrips: Trip[];
  setCurrentTrip: (trip: Trip | null) => void;
  addSavedTrip: (trip: Trip) => void;

  // UI
  plannerOpen: boolean;
  setPlannerOpen: (open: boolean) => void;
  activeDestination: string | null;
  setActiveDestination: (dest: string | null) => void;
  plannerQuery: string;
  setPlannerQuery: (query: string) => void;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
}

export const useAppStore = create<AppStore>((set) => ({
  user: null,
  token: null,
  setUser: (user) => set({ user }),
  setToken: (token) => {
    if (token) localStorage.setItem("voyageai_token", token);
    else localStorage.removeItem("voyageai_token");
    set({ token });
  },
  logout: () => {
    localStorage.removeItem("voyageai_token");
    set({ user: null, token: null });
  },

  currentTrip: null,
  savedTrips: [],
  setCurrentTrip: (trip) => set({ currentTrip: trip }),
  addSavedTrip: (trip) => set((state) => ({ savedTrips: [...state.savedTrips, trip] })),

  plannerOpen: false,
  setPlannerOpen: (open) => set({ plannerOpen: open }),
  activeDestination: null,
  setActiveDestination: (dest) => set({ activeDestination: dest }),
  plannerQuery: "",
  setPlannerQuery: (query) => set({ plannerQuery: query }),
  theme: "light",
  setTheme: (theme) => set({ theme }),
}));
