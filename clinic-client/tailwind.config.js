/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      // === APP BRAND COLOR PALETTE ===
      colors: {
        // Main brand color (primary action, highlights)
        "brand-main": "#e2725b", // main orange-red
        "brand-bg": "#ffffff", // main background

        // Palette spectrum (change these for a new look)
        "brand-green": "#71e25b", // vibrant green
        "brand-lime": "#a9e25b", // yellow-green
        "brand-yellow": "#e1e25b", // yellow
        "brand-orange": "#e2aa5b", // orange
        "brand-red": "#e2725b", // orange-red (same as main)
        "brand-pink": "#e25b7c", // pinkish
        "brand-fuchsia": "#e25bb4", // fuchsia
        "brand-purple": "#d75be2", // purple
        "brand-violet": "#9f5be2", // violet

        // For semantic usage, reference these in your app:
        accent: "#e2725b", // main accent (for buttons etc)
        "accent-bg": "#fff", // card, modal, and general backgrounds

        // Optional: old palette fallback for quick replace
        // Remove if not needed
        "brand-gray": {
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
        },

        // Utility/semantic status colors
        warn: "#e2aa5b", // orange in palette for warnings
        error: "#e2725b", // same as accent, customize as needed
        success: "#71e25b", // green for success messages
      },

      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },

      boxShadow: {
        tp: "0 -2px 6px rgba(0, 0, 0, 0.1)",
      },

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

/*
  🟠 HOW TO SWAP COLOR PALETTE 🟠
  - Just change the hex codes under the colors section above.
  - Reference colors in your app as "bg-brand-main", "text-brand-green", etc.
  - No code changes required—just the palette!
*/
