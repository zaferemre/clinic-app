/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      // === APP BRAND COLOR PALETTE ===
      colors: {
        // Core brand
        "brand-main": "#e2725b",

        // Tint: very light (backgrounds, hover, disabled)
        "brand-main-50": "#fdf5f2",
        "brand-main-100": "#fae3da",
        "brand-main-200": "#f3c0b1",

        // Soft accent (cards, highlights, input focus)
        "brand-main-300": "#eea28d",
        "brand-main-400": "#ea866e",

        // Main accent (buttons, primary)
        "brand-main-500": "#e2725b",

        // Deep shades (active, pressed, borders, text)
        "brand-main-600": "#ce684f",
        "brand-main-700": "#b65947",

        // Status colors (all in same hue)
        success: "#72e2ad", // (optional, a bit of green for contrast, or use a tint of main)
        warn: "#ffb977", // (optional, or use brand-main-300)
        error: "#e2725b", // just the main
        accent: "#e2725b",
        "accent-bg": "#fff",
        // Neutral grays for backgrounds/cards/inputs
        "gray-50": "#FAFAFA",
        "gray-100": "#F3F4F6",
        "gray-200": "#E5E7EB",
        "gray-300": "#D1D5DB",
        "gray-400": "#9CA3AF",
        "gray-500": "#6B7280",
        "gray-600": "#4B5563",
        "gray-700": "#374151",
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
