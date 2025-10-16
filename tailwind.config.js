/** @type {import('tailwindcss').Config} */

export default {
  content: ["./index.html", "./src/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#f4f4f7",
        secondary: "#222529",
        tertiary: "#222529",
        gray: {
          10: "#EEEEEE",
          20: "#A2A2A2",
          30: "#7B7B7B",
          50: "#585858",
          90: "#141414",
        },
        hv_orange: "#fe8423",
        trs_black: "rgba(0,0,0,0.5)",
      },
      screens: {
        md850: "850px",
        xs: "400px",
        "3xl": "1680px",
        "4xl": "2200px",
        md: "965px",
        sm: "400px",
      },
      backgroundImage: {
        banner: "url(/src/assets/banner.png)",
      },
      animation: {
        bounce: "bounceIn 0.8s ease-out forwards",
        fadeInUp: "fadeInUp 1s ease forwards",
        fadeIn: "fadeIn 1s ease forwards",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        bounceIn: {
          "0%": { transform: "translateY(50px)", opacity: "0" },
          "60%": { transform: "translateY(-10px)", opacity: "1" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  variants: {
    extend: {
      animation: ["responsive", "motion-safe", "motion-reduce"],
    },
  },
  safelist: ["animate-[bounceIn_0.8s_ease-out]"],
};