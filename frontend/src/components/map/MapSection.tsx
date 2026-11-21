"use client";
import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { MapPin, Route, Navigation } from "lucide-react";
import Map, { Marker, Source, Layer, Popup } from "react-map-gl";
import { useAppStore } from "@/store/appStore";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
const colors = ["#0d9488", "#3b82f6", "#f59e0b", "#10b981", "#ec4899", "#8b5cf6", "#f97316"];

interface RoutePoint {
  name: string;
  time: string;
  color: string;
  lng: number;
  lat: number;
  desc: string;
}

const defaultGoaPoints: RoutePoint[] = [
  { name: "Calangute Beach", time: "Day 1 – 3 PM", color: "#0d9488", lng: 73.7556, lat: 15.5447, desc: "Famous beach with water sports & lively shacks" },
  { name: "Anjuna Market", time: "Day 1 – 7 PM", color: "#3b82f6", lng: 73.7404, lat: 15.5734, desc: "Iconic flea market with hippie vibes & local crafts" },
  { name: "Old Goa Church", time: "Day 2 – 9 AM", color: "#f59e0b", lng: 73.9116, lat: 15.5009, desc: "UNESCO site – Basilica of Bom Jesus" },
  { name: "Dudhsagar Falls", time: "Day 2 – 2 PM", color: "#10b981", lng: 74.3143, lat: 15.3144, desc: "India's 5th tallest waterfall – spectacular!" },
  { name: "Palolem Beach", time: "Day 3 – 9 AM", color: "#ec4899", lng: 74.0232, lat: 15.0100, desc: "Crescent-shaped beach – South Goa's gem" },
];

function MapPlaceholderCanvas({ points }: { points: RoutePoint[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = useAppStore((s) => s.theme);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Draw background based on theme
    ctx.fillStyle = theme === "dark" ? "#090d16" : "#f8fafc";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = theme === "dark" ? "rgba(20, 184, 166, 0.06)" : "rgba(13, 148, 136, 0.06)";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    ctx.beginPath();
    ctx.moveTo(canvas.width * 0.6, 0);
    ctx.bezierCurveTo(canvas.width * 0.65, canvas.height * 0.3, canvas.width * 0.7, canvas.height * 0.6, canvas.width * 0.55, canvas.height);
    ctx.strokeStyle = theme === "dark" ? "rgba(20, 184, 166, 0.15)" : "rgba(13, 148, 136, 0.15)";
    ctx.lineWidth = 2;
    ctx.stroke();

    const canvasPoints = points.map((p, i) => {
      const angle = (i / points.length) * Math.PI * 1.5 + 0.2;
      const radius = 80 + i * 20;
      return {
        x: canvas.width / 2 + Math.cos(angle) * radius * 1.2,
        y: canvas.height / 2 + Math.sin(angle) * radius * 0.8,
      };
    });

    if (canvasPoints.length > 0) {
      ctx.beginPath();
      ctx.moveTo(canvasPoints[0].x, canvasPoints[0].y);
      canvasPoints.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.strokeStyle = "#0d9488";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    canvasPoints.forEach((p, i) => {
      const ptColor = points[i]?.color || "#0d9488";
      ctx.beginPath();
      ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
      ctx.fillStyle = `${ptColor}20`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = ptColor;
      ctx.fill();
    });
  }, [points, theme]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
}

export default function MapSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>(defaultGoaPoints);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const currentTrip = useAppStore((s) => s.currentTrip);
  const theme = useAppStore((s) => s.theme);

  const [viewState, setViewState] = useState({
    latitude: 15.35,
    longitude: 73.95,
    zoom: 10,
  });

  const hasApiKey = MAPBOX_TOKEN && MAPBOX_TOKEN !== "pk.your-mapbox-token-here" && MAPBOX_TOKEN !== "";
  const destinationName = currentTrip?.destination || "Goa, India";

  // Geocode currentTrip's activities using Mapbox places API
  useEffect(() => {
    const geocodeTrip = async () => {
      if (!currentTrip || !currentTrip.itinerary) {
        setRoutePoints(defaultGoaPoints);
        return;
      }

      setLoading(true);
      const dest = currentTrip.destination;
      const days = currentTrip.itinerary.days || [];

      // Extract raw activity names
      const selectedRaw: { name: string; time: string; desc: string; location: string }[] = [];
      days.forEach((d: any) => {
        (d.activities || []).slice(0, 2).forEach((act: any) => {
          selectedRaw.push({
            name: act.title || act.activity,
            time: act.time,
            desc: act.description || "",
            location: act.title || act.activity,
          });
        });
      });

      // Keep maximum 6 stops to avoid rate limiting and look clean
      const trimmed = selectedRaw.slice(0, 6);

      if (!hasApiKey) {
        // Fallback dummy coords if no api token
        const dummyPoints = trimmed.map((act, i) => {
          const angle = (i / trimmed.length) * Math.PI * 2;
          return {
            name: act.name,
            time: act.time,
            color: colors[i % colors.length],
            lng: 73.95 + Math.cos(angle) * 0.15,
            lat: 15.35 + Math.sin(angle) * 0.15,
            desc: act.desc,
          };
        });
        setRoutePoints(dummyPoints);
        setLoading(false);
        return;
      }

      const geocodeAddress = async (query: string): Promise<{ lat: number; lng: number } | null> => {
        try {
          const res = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&limit=1`
          );
          const data = await res.json();
          if (data && data.features && data.features.length > 0) {
            const [lng, lat] = data.features[0].center;
            return { lat, lng };
          }
        } catch (err) {
          console.error("Geocoding failed for:", query, err);
        }
        return null;
      };

      const destCoords = await geocodeAddress(dest) || { lat: 15.35, lng: 73.95 };

      const resolvedPoints = await Promise.all(
        trimmed.map(async (act, i) => {
          const query = `${act.location}, ${dest}`;
          const coords = await geocodeAddress(query);

          if (coords) {
            return {
              name: act.name,
              time: act.time,
              color: colors[i % colors.length],
              lng: coords.lng,
              lat: coords.lat,
              desc: act.desc,
            };
          }

          // Dynamic offset
          const offsetLng = destCoords.lng + (Math.random() - 0.5) * 0.08;
          const offsetLat = destCoords.lat + (Math.random() - 0.5) * 0.08;
          return {
            name: act.name,
            time: act.time,
            color: colors[i % colors.length],
            lng: offsetLng,
            lat: offsetLat,
            desc: act.desc,
          };
        })
      );

      setRoutePoints(resolvedPoints);
      if (resolvedPoints.length > 0) {
        setViewState({
          latitude: resolvedPoints[0].lat,
          longitude: resolvedPoints[0].lng,
          zoom: 11,
        });
      }
      setLoading(false);
    };

    geocodeTrip();
  }, [currentTrip, hasApiKey]);

  // Adjust center on active stop click
  useEffect(() => {
    if (activeIdx !== null && routePoints[activeIdx]) {
      setViewState((prev) => ({
        ...prev,
        latitude: routePoints[activeIdx].lat,
        longitude: routePoints[activeIdx].lng,
        zoom: 12.5,
      }));
    }
  }, [activeIdx, routePoints]);

  const mapStyle = theme === "dark" ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/light-v11";

  // GeoJSON data for route path line
  const geojson: any = {
    type: "Feature",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates: routePoints.map((pt) => [pt.lng, pt.lat]),
    },
  };

  const layerStyle: any = {
    id: "route-line",
    type: "line",
    paint: {
      "line-color": "#0d9488",
      "line-width": 3,
      "line-dasharray": [2, 2],
    },
  };

  return (
    <section className="py-24 bg-primary relative overflow-hidden transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6" ref={ref}>
        {/* Header */}
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-8 h-[1px] bg-accent" />
            <span className="text-accent text-xs font-semibold uppercase tracking-widest">Interactive Map</span>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <motion.h2
              className="heading-lg text-text-main max-w-sm"
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1, ease: [0.77, 0, 0.175, 1] }}
            >
              See your journey
              <br />
              <span className="text-gradient">come to life</span>
            </motion.h2>

            <motion.p
              className="text-text-muted text-sm leading-relaxed max-w-sm mt-4 lg:mt-3"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.3 }}
            >
              Day-by-day routes visualized on an interactive map. Click destinations,
              explore stops, and watch your itinerary unfold in real time.
            </motion.p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map Container */}
          <motion.div
            className="lg:col-span-2 rounded-2xl overflow-hidden shadow-sm border border-border-theme"
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            <div className="relative bg-secondary rounded-2xl overflow-hidden" style={{ height: "480px" }}>
              {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary/90 z-20">
                  <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-text-muted text-xs">Geocoding trip locations...</p>
                </div>
              ) : null}

              {hasApiKey ? (
                <Map
                  {...viewState}
                  onMove={(evt) => setViewState(evt.viewState)}
                  mapboxAccessToken={MAPBOX_TOKEN}
                  mapStyle={mapStyle}
                  style={{ width: "100%", height: "100%" }}
                >
                  {/* Route Polyline */}
                  {routePoints.length > 1 && (
                    <Source id="route-source" type="geojson" data={geojson}>
                      <Layer {...layerStyle} />
                    </Source>
                  )}

                  {/* Stop Markers */}
                  {routePoints.map((pt, i) => (
                    <Marker
                      key={`${pt.name}-${i}`}
                      latitude={pt.lat}
                      longitude={pt.lng}
                      anchor="bottom"
                      onClick={(e) => {
                        e.originalEvent.stopPropagation();
                        setActiveIdx(i);
                      }}
                    >
                      <div
                        className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-black text-white shadow-md cursor-pointer transition-transform hover:scale-110"
                        style={{ backgroundColor: pt.color }}
                      >
                        {i + 1}
                      </div>
                    </Marker>
                  ))}

                  {/* Active Popup */}
                  {activeIdx !== null && routePoints[activeIdx] && (
                    <Popup
                      latitude={routePoints[activeIdx].lat}
                      longitude={routePoints[activeIdx].lng}
                      anchor="top"
                      onClose={() => setActiveIdx(null)}
                      closeButton={true}
                      closeOnClick={false}
                      className="z-30 font-sans"
                    >
                      <div className="p-1 max-w-[200px] text-slate-800">
                        <p className="font-bold text-xs m-0">{routePoints[activeIdx].name}</p>
                        <p className="text-[10px] text-slate-500 m-0 mt-0.5">{routePoints[activeIdx].time}</p>
                        <p className="text-[10px] text-slate-600 m-0 mt-1 leading-relaxed">{routePoints[activeIdx].desc}</p>
                      </div>
                    </Popup>
                  )}
                </Map>
              ) : (
                <MapPlaceholderCanvas points={routePoints} />
              )}

              {/* Location label */}
              <div className="absolute top-4 left-4 glass rounded-xl px-3 py-2 flex items-center gap-2 z-10 pointer-events-none border border-border-theme">
                <Navigation className="w-4 h-4 text-accent" />
                <span className="text-text-main text-xs font-semibold">{destinationName}</span>
              </div>
            </div>
          </motion.div>

          {/* Route list */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            <h3 className="text-text-main font-semibold text-sm mb-4 flex items-center gap-2">
              <Route className="w-4 h-4 text-accent" />
              Your Route
            </h3>
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
              {routePoints.map((pt, i) => (
                <motion.div
                  key={`${pt.name}-${i}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  onClick={() => setActiveIdx(i)}
                  className={`glass rounded-xl p-4 flex items-start gap-3 transition-all group cursor-pointer border border-border-theme shadow-sm ${
                    activeIdx === i ? "bg-accent/5 border border-accent/40" : "hover:bg-secondary"
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: `${pt.color}15`, color: pt.color }}>
                      {i + 1}
                    </div>
                    {i < routePoints.length - 1 && <div className="w-[1px] h-4 bg-border-theme" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-text-main text-xs font-semibold group-hover:text-accent transition-colors truncate">{pt.name}</div>
                    <div className="text-text-muted text-xs opacity-85">{pt.time}</div>
                  </div>
                  <MapPin className="w-3.5 h-3.5 text-text-muted opacity-60 ml-auto mt-0.5 group-hover:text-accent transition-colors flex-shrink-0" />
                </motion.div>
              ))}
            </div>

            <button
              onClick={() => setActiveIdx(null)}
              className="w-full glass border border-border-theme text-accent text-xs py-2.5 rounded-xl hover:bg-accent/5 transition-colors mt-2 font-semibold"
            >
              🗺️ View Full Route
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
