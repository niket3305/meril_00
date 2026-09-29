import type { Config } from "tailwindcss";

export default {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ["PlusJakartaSans", "System"],
      },
    },
  },
  plugins: [],
} satisfies Config;
