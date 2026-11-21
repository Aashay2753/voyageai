"use client";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Cloud, Sun, Wind, Droplets, Thermometer, Eye } from "lucide-react";
import { useAppStore } from "@/store/appStore";

const weatherData = [
  { month: "Oct", temp: 30, rain: 12, icon: "☀️", label: "Ideal" },
  { month: "Nov", temp: 28, rain: 5, icon: "🌤️", label: "Perfect" },
  { month: "Dec", temp: 26, rain: 2, icon: "☀️", label: "Peak" },
  { month: "Jan", temp: 25, rain: 3, icon: "☀️", label: "Best" },
  { month: "Feb", temp: 27, rain: 4, icon: "🌤️", label: "Great" },
  { month: "Mar", temp: 29, rain: 8, icon: "⛅", label: "Good" },
  { month: "Apr", temp: 32, rain: 15, icon: "🌦️", label: "Warm" },
  { month: "May", temp: 33, rain: 40, icon: "🌧️", label: "Humid" },
  { month: "Jun", temp: 29, rain: 200, icon: "⛈️", label: "Rainy" },
  { month: "Jul", temp: 27, rain: 350, icon: "⛈️", label: "Monsoon" },
  { month: "Aug", temp: 27, rain: 300, icon: "⛈️", label: "Monsoon" },
  { month: "Sep", temp: 28, rain: 180, icon: "🌧️", label: "Wet" },
];

const currentWeather = {
  temp: 28,
  feels_like: 30,
  humidity: 72,
  wind: 14,
  visibility: 10,
  condition: "Partly Cloudy",
  uv: 7,
};

const forecast = [
  { day: "Today", icon: "⛅", high: 30, low: 24 },
  { day: "Tue", icon: "☀️", high: 31, low: 25 },
  { day: "Wed", icon: "☀️", high: 32, low: 25 },
  { day: "Thu", icon: "🌤️", high: 29, low: 23 },
  { day: "Fri", icon: "⛅", high: 28, low: 23 },
  { day: "Sat", icon: "🌦️", high: 27, low: 22 },
  { day: "Sun", icon: "☀️", high: 31, low: 24 },
];

const maxRain = Math.max(...weatherData.map((d) => d.rain));

export default function WeatherSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const theme = useAppStore((s) => s.theme);

  return (
    <section className="py-24 bg-primary relative overflow-hidden transition-colors duration-300">
      <div className="absolute inset-0 grid-pattern opacity-10" />
      <div className="orb w-80 h-80 bg-blue-500/4 top-1/2 right-0 -translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-6 relative z-10" ref={ref}>
        {/* Header */}
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-8 h-[1px] bg-accent" />
            <span className="text-accent text-xs font-semibold uppercase tracking-widest">
              Weather Intelligence
            </span>
          </motion.div>

          <motion.h2
            className="heading-lg text-text-main max-w-xl"
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, ease: [0.77, 0, 0.175, 1] }}
          >
            Travel when the
            <br />
            <span className="text-gradient">weather is perfect</span>
          </motion.h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Current weather card */}
          <motion.div
            className="glass rounded-2xl p-6 border border-border-theme shadow-sm"
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-text-muted text-xs uppercase tracking-widest mb-1">Goa, India</p>
                <p className="text-text-muted text-xs opacity-75">Right now</p>
              </div>
              <div className="text-3xl">⛅</div>
            </div>

            <div className="mb-6">
              <div className="text-6xl font-black text-text-main leading-none mb-1">
                {currentWeather.temp}°
              </div>
              <p className="text-text-main text-sm font-medium">{currentWeather.condition}</p>
              <p className="text-text-muted text-xs">Feels like {currentWeather.feels_like}°C</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: <Droplets className="w-3.5 h-3.5" />, label: "Humidity", value: `${currentWeather.humidity}%` },
                { icon: <Wind className="w-3.5 h-3.5" />, label: "Wind", value: `${currentWeather.wind} km/h` },
                { icon: <Eye className="w-3.5 h-3.5" />, label: "Visibility", value: `${currentWeather.visibility} km` },
                { icon: <Sun className="w-3.5 h-3.5" />, label: "UV Index", value: `${currentWeather.uv} (High)` },
              ].map((item) => (
                <div key={item.label} className="bg-secondary rounded-xl p-3 border border-border-theme/30">
                  <div className="flex items-center gap-1.5 text-text-muted mb-1 opacity-80">
                    {item.icon}
                    <span className="text-xs">{item.label}</span>
                  </div>
                  <p className="text-text-main text-sm font-semibold">{item.value}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* 7-day forecast */}
          <motion.div
            className="glass rounded-2xl p-6 border border-border-theme shadow-sm"
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-text-main font-semibold text-sm mb-5 flex items-center gap-2">
              <Cloud className="w-4 h-4 text-accent" />
              7-Day Forecast
            </h3>
            <div className="space-y-3">
              {forecast.map((day, i) => (
                <motion.div
                  key={day.day}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.4 + i * 0.06 }}
                >
                  <span className="text-text-muted text-xs w-10">{day.day}</span>
                  <span className="text-lg w-6">{day.icon}</span>
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-text-muted text-xs w-8 opacity-80">{day.low}°</span>
                    <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden border border-border-theme/40">
                      <div
                        className="h-full rounded-full"
                        style={{
                          background: "linear-gradient(90deg, #60A5FA, #F59E0B)",
                          width: `${((day.high - day.low) / 12) * 100}%`,
                          marginLeft: `${((day.low - 20) / 15) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-text-main text-xs w-8 text-right font-medium">{day.high}°</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* AI recommendation */}
            <div className="mt-5 p-3 bg-accent/10 border border-accent/20 rounded-xl">
              <p className="text-accent text-xs font-semibold mb-1">🤖 AI Weather Tip</p>
              <p className="text-text-muted text-xs leading-relaxed opacity-95">
                Perfect beach week ahead! Pack light cotton clothes and high-SPF sunscreen. Water temp: 27°C — ideal for swimming.
              </p>
            </div>
          </motion.div>

          {/* Best time chart */}
          <motion.div
            className="glass rounded-2xl p-6 border border-border-theme shadow-sm"
            initial={{ opacity: 0, y: 40 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-text-main font-semibold text-sm mb-5 flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-accent" />
              Best Time to Visit
            </h3>

            <div className="space-y-2">
              {weatherData.map((m, i) => {
                const isPeak = ["Nov", "Dec", "Jan", "Feb"].includes(m.month);
                const isAvoid = ["Jun", "Jul", "Aug", "Sep"].includes(m.month);
                return (
                  <motion.div
                    key={m.month}
                    className="flex items-center gap-2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.5 + i * 0.04 }}
                  >
                    <span className="text-text-muted text-xs w-8">{m.month}</span>
                    <span className="text-xs w-5">{m.icon}</span>
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden border border-border-theme/40">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: isAvoid
                            ? "#ef4444"
                            : isPeak
                            ? "#0d9488"
                            : "#f59e0b",
                          width: `${100 - Math.min((m.rain / maxRain) * 80, 80)}%`,
                        }}
                        initial={{ width: 0 }}
                        animate={inView ? { width: `${100 - Math.min((m.rain / maxRain) * 80, 80)}%` } : {}}
                        transition={{ delay: 0.6 + i * 0.04, duration: 0.6 }}
                      />
                    </div>
                    <span
                      className="text-xs w-14 text-right font-semibold"
                      style={{ color: isAvoid ? "#ef4444" : isPeak ? (theme === "dark" ? "#14b8a6" : "#0d9488") : "#d97706" }}
                    >
                      {m.label}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-4 flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-accent" /><span className="text-text-muted">Peak Season</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-500" /><span className="text-text-muted">Good</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /><span className="text-text-muted">Avoid</span></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
