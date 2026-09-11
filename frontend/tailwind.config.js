/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        slate: {
          // Layered shades of light theme (pearl, cloud, alabaster, satin)
          50: '#F8F9FA',   // Soft pearl canvas / sub-panel background
          100: '#F1F3F5',  // Soft cloud-grey inner well / pill background
          200: '#E5E7EB',  // Satin light border & subtle divider
          300: '#D1D5DB',  // Defined light border & icon neutral
          400: '#9CA3AF',  // Muted light text
          500: '#6B7280',  // Mid-tone neutral text
          600: '#4B5563',  // Bold secondary text
          // Layered shades of dark theme (smoked zinc, slate charcoal, titanium graphite, dark carbon, obsidian onyx)
          700: '#282A30',  // Smoked zinc: active pill, subtle hover & elevated border
          750: '#22242B',  // Intermediate charcoal: active tabs & pressed states
          800: '#1C1E24',  // Slate charcoal: nested wells, inputs, modal bodies, hover states
          850: '#16181E',  // Deep titanium: intermediate elevated surfaces
          900: '#121316',  // Dark carbon: primary cards, sidebar, table containers
          950: '#0A0B0E',  // Obsidian onyx: deepest canvas & base background
        },
        surface: {
          light: '#F8F9FA',
          card: '#FFFFFF',
          well: '#F1F3F5',
          border: '#E5E7EB',
          dark: '#0A0B0E',
          darkCard: '#121316',
          darkElevated: '#181A20',
          darkWell: '#1C1E24',
          darkBorder: '#23252C',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 1px 4px 0 rgba(0, 0, 0, 0.06), 0 4px 12px 0 rgba(0, 0, 0, 0.03)',
        'glow': '0 0 20px rgba(37, 99, 235, 0.25)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
      }
    },
  },
  plugins: [],
}
