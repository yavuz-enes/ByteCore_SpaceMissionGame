/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Refined Aerospace Palette:
        'space-sky': '#38BDF8',
        'space-cyan': '#0EA5E9',
        'space-cobalt': '#2563EB',
        'space-slate': '#94A3B8',
        'space-slate-dark': '#64748B',

        // Deep void background layers
        'void-canvas': '#0B0F17',
        'abyss': '#0E1422',
        'singularity': '#080C14',
        'carbon': '#111827',

        // Semantic Harmonic Accent System
        'status-nominal': '#10B981',
        'status-warning': '#F59E0B',
        'status-critical': '#F43F5E',

        // Typography & UI mappings
        'lunar-white': '#FFFFFF',
        'platinum': '#F1F5F9',
        'mist': '#CBD5E1',
        'steel': '#94A3B8',
        'gunmetal': 'rgba(255, 255, 255, 0.08)',
        'aurora-mint': '#10B981',
        'plasma-blue': '#38BDF8',
        'ultraviolet': '#818CF8',
        'electric-cyan': '#38BDF8',
        'amber': '#F59E0B',
        'signal-blue': '#38BDF8',
      },
      backgroundImage: {
        'nebula-gradient': 'linear-gradient(83.21deg, rgba(56, 189, 248, 0.15), rgba(99, 102, 241, 0.15))',
        'plasma-gradient': 'linear-gradient(66.77deg, rgba(244, 63, 94, 0.15), rgba(168, 85, 247, 0.15))',
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"Space Mono"', '"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        'card': '16px',
        'pill': '9999px',
        'box': '8px',
        'image': '12px'
      }
    },
  },
  plugins: [],
}
