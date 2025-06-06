/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Primary text/heading color
        "brand-black": "#111827",

        // Grayscale (used for backgrounds, borders, text)
        "brand-gray": {
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
        },

        // Brand‐green palette (used for buttons, highlights, active states)
        "brand-green": {
          100: "#ECFDF5",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
        },

        // Pale‐toned reds (use sparingly for error badges, icons, etc.)
        "brand-red": {
          100: "#FEF2F2", // very pale pinkish‐red
          300: "#FCA5A5", // soft rose
          500: "#EF4444", // richer red for stronger accents
        },

        // Pale‐toned oranges (use for warnings or mild highlights)
        "brand-orange": {
          100: "#FFF7ED", // very pale orange
          300: "#FDBA74", // light peach
          500: "#F97316", // deeper orange accent
        },

        // Pale‐toned blues (for info boxes, links, subtle backgrounds)
        "brand-blue": {
          100: "#EFF6FF", // very pale sky‐blue
          300: "#93C5FD", // light cornflower
          500: "#3B82F6", // standard blue accent
        },

        // Pale‐toned pinks (for subtle highlights or badges)
        "brand-pink": {
          100: "#FCE7F3", // very pale pink
          300: "#F9A8D4", // light bubblegum
          500: "#EC4899", // medium pink accent
        },

        // Single‐stop utility colors
        warn: "#F59E0B", // bright amber for warnings
        error: "#EF4444", // strong red for errors
        success: "#10B981", // green for success messages
      },

      // Use “Inter” as the default sans‐serif
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },

      // Custom top‐shadow for bottom‐sheet menu
      boxShadow: {
        tp: "0 -2px 6px rgba(0, 0, 0, 0.1)",
      },

      // Slide‐up and fade‐in animations (used by the pill‐nav bottom sheet)
      keyframes: {
        slideUp: {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        slideUp: "slideUp 300ms ease-out",
        fadeIn: "fadeIn 300ms ease-out",
      },
    },
  },
  plugins: [],
};
