/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(255, 50%, 98%)",
        foreground: "hsl(234, 50%, 12%)",
        muted: "hsl(260, 40%, 95%)",
        "muted-foreground": "hsl(240, 25%, 45%)",
        popover: "hsl(255, 50%, 98%)",
        "popover-foreground": "hsl(234, 50%, 12%)",
        card: "hsl(0, 0%, 100%)",
        "card-foreground": "hsl(234, 50%, 12%)",
        border: "hsl(260, 30%, 88%)",
        input: "hsl(260, 30%, 88%)",
        primary: "hsl(262, 100%, 65%)",
        "primary-foreground": "hsl(255, 50%, 98%)",
        secondary: "hsl(260, 40%, 95%)",
        "secondary-foreground": "hsl(234, 50%, 12%)",
        accent: "hsl(262, 80%, 92%)",
        "accent-foreground": "hsl(234, 50%, 12%)",
        destructive: "hsl(0, 84%, 60%)",
        "destructive-foreground": "hsl(210, 40%, 98%)",
        ring: "hsl(262, 100%, 65%)",

        // additional custom colors
        "emerald-100": "hsl(158, 80%, 95%)",
        "emerald-600": "hsl(158, 80%, 55%)",
        "emerald-800": "hsl(158, 80%, 35%)",

        "amber-100": "hsl(38, 95%, 95%)",
        "amber-600": "hsl(38, 95%, 55%)",
        "amber-800": "hsl(38, 95%, 35%)",

        "purple-100": "hsl(262, 100%, 95%)",
        "purple-600": "hsl(262, 100%, 65%)",
        "purple-800": "hsl(262, 100%, 45%)",

        "red-100": "hsl(0, 100%, 95%)",
        "red-800": "hsl(0, 100%, 45%)",

        "blue-100": "hsl(214, 100%, 95%)",
        "blue-800": "hsl(214, 100%, 45%)",

        "slate-50": "hsl(255, 50%, 98%)",
        "slate-200": "hsl(260, 30%, 88%)",
        "slate-300": "hsl(260, 25%, 75%)",
        "slate-600": "hsl(240, 25%, 45%)",
        "slate-700": "hsl(240, 35%, 25%)",
        "slate-900": "hsl(234, 50%, 12%)",
      },
      borderRadius: {
        lg: "0.75rem",
      },
    },
  },
  plugins: [],
};
