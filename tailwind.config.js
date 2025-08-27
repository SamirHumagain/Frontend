/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f2f5f8",
          100: "#dce4ec",
          200: "#bccbdc",
          300: "#94acc6",
          400: "#6b8eb0",
          500: "#3c5e7c", // Base color
          600: "#334f67",
          700: "#293f52",
          800: "#1f303e",
          900: "#15212a",
        },

        secondary: {
          50: "#fffef7",
          100: "#fffce8",
          200: "#fff9c2",
          300: "#fff388",
          400: "#ffe94a",
          500: "#FFD700", // Champagne Gold
          600: "#e6c200",
          700: "#cc9900",
          800: "#b38600",
          900: "#996600",
        },
        background: "#FAF9F6", // Ivory
        text: "#0A0A0A", // Onyx Black
        accent: {
          purple: "#4B0082",
          gold: "#FFD700",
          ivory: "#FAF9F6",
          onyx: "#0A0A0A",
        },
      },
      backgroundImage: {
        "luxury-gradient": "linear-gradient(135deg, #3c5e7c )",
        "gold-gradient": "linear-gradient(135deg, #FFD700)",
        "purple-gradient": "linear-gradient(135deg, #4B0082 )",
      },
    },
  },
  plugins: [],
};

//#4384bd
