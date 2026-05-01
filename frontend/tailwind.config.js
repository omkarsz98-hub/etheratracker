/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'DM Sans'", "sans-serif"],
        display: ["'Syne'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        ink: {
          50: "#f4f4f6",
          100: "#e8e8ed",
          200: "#c9c9d4",
          300: "#a2a2b5",
          400: "#737389",
          500: "#4f4f66",
          600: "#3a3a50",
          700: "#2c2c3e",
          800: "#1e1e2d",
          900: "#12121c",
          950: "#0a0a11",
        },
        accent: {
          50: "#eef5ff",
          100: "#d9e9ff",
          200: "#bcd6ff",
          300: "#8dbfff",
          400: "#5a9eff",
          500: "#3b7eff",
          600: "#1a5cf5",
          700: "#1347e1",
          800: "#163ab6",
          900: "#17358f",
        },
        emerald: {
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
        },
        rose: {
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
        },
        amber: {
          400: "#fbbf24",
          500: "#f59e0b",
        }
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.04)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.12), 0 16px 40px rgba(0,0,0,0.08)",
        glow: "0 0 0 3px rgba(59, 126, 255, 0.15)",
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
        "3xl": "24px",
      }
    }
  },
  plugins: []
}
