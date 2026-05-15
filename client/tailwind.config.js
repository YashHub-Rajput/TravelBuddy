// File: client/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        coral:   { DEFAULT: "#FF6B6B", light: "#FFE8E8", dark: "#E85555" },
        teal:    { DEFAULT: "#1A936F", light: "#D4F1E7", dark: "#0F6B50" },
        gold:    { DEFAULT: "#FFBE0B", light: "#FFF5CC", dark: "#E0A800" },
        ink:     { DEFAULT: "#0D1B2A", mid: "#1E2D3D", soft: "#2E4057" },
        cream:   { DEFAULT: "#FDFAF5", warm: "#F5EDD8" },
        mist:    { DEFAULT: "#E8EEF4", dark: "#C8D5E3" },
      },
      fontFamily: {
        display: ["'Clash Display'", "'Bricolage Grotesque'", "sans-serif"],
        body:    ["'DM Sans'", "sans-serif"],
        mono:    ["'JetBrains Mono'", "monospace"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        "glow-coral":  "0 0 30px rgba(255, 107, 107, 0.25)",
        "glow-teal":   "0 0 30px rgba(26, 147, 111, 0.25)",
        "card":        "0 2px 20px rgba(13, 27, 42, 0.08)",
        "card-hover":  "0 8px 40px rgba(13, 27, 42, 0.15)",
        "float":       "0 20px 60px rgba(13, 27, 42, 0.20)",
      },
      backgroundImage: {
        "hero-mesh": "radial-gradient(at 20% 50%, #FF6B6B22 0%, transparent 50%), radial-gradient(at 80% 20%, #1A936F22 0%, transparent 50%), radial-gradient(at 50% 80%, #FFBE0B18 0%, transparent 50%)",
        "card-shine": "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)",
      },
      animation: {
        "float":       "float 6s ease-in-out infinite",
        "pulse-slow":  "pulse 4s cubic-bezier(0.4,0,0.6,1) infinite",
        "slide-up":    "slideUp 0.4s ease-out",
        "fade-in":     "fadeIn 0.3s ease-out",
        "shimmer":     "shimmer 2s infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-10px)" },
        },
        slideUp: {
          "0%":   { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)",    opacity: "1" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
      },
    },
  },
  plugins: [],
};
