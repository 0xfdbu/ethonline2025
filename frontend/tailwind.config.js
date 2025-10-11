/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 1.5s ease-in-out infinite alternate',
      },
      colors: {
        'nexus-blue': '#1e40af',  // Primary blockchain blue
        'crypto-emerald': '#10b981',  // Action green
        'neon-cyan': '#00f5ff',  // Glow accent
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(0, 245, 255, 0.3)',  // Neon glow for nodes
      },
      fontFamily: {
        'mono': ['"Space Mono"', 'monospace'],  // Futuristic font for labels
      },
    },
  },
  plugins: [],
}