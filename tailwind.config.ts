import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Background maroon stages
        maroon: {
          50: '#fdecec',
          100: '#fbcaca',
          200: '#f49595',
          300: '#e25f5f',
          400: '#c43434',
          500: '#9b1b1b',
          600: '#7e1010',
          700: '#690a0a',
          800: '#4d0707',
          900: '#330303',
        },
        // Aksen Gold
        gold: {
          50: '#fff8db',
          100: '#ffeaa6',
          200: '#ffd770',
          300: '#f7c23a',
          400: '#e0a91d',
          500: '#b8870a',
          600: '#8a6308',
          700: '#5e4305',
        },
        // Aksen Hijau
        green: {
          300: '#7be39a',
          400: '#3dd17a',
          500: '#1aa860',
          600: '#0e7a47',
          700: '#08512f',
        },
        // Aksen Biru
        blue: {
          300: '#86c5ff',
          400: '#3d9eff',
          500: '#1a76e0',
          600: '#0e54a8',
          700: '#093670',
        },
        // Aksen Ungu
        purple: {
          300: '#c8a5ff',
          400: '#a374ff',
          500: '#7a47e0',
          600: '#5a2eb3',
          700: '#3a1b75',
        },
        background: '#210707',
        foreground: '#ffffff',
        'dark-gray': '#0a0a0a',
        'mid-gray': '#1a1a1a',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
export default config;
