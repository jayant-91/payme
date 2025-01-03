/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
 
    // Or if using `src` directory:
    "../../packages/**/*.{js,ts,jsx,tsx,mdx}",
    "!../../packages/**/node_modules/**"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
