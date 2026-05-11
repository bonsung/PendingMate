/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pretendard', 'Noto Sans KR', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        pm: {
          bg: '#f5f6f8',
          surface: '#ffffff',
          card: '#ffffff',
          border: '#e5e7eb',
          accent: '#2563eb',
          gold: '#d97706',
          green: '#059669',
          red: '#dc2626',
          muted: '#9ca3af',
          text: '#111827',
          subtext: '#6b7280',
        }
      }
    },
  },
  plugins: [],
}
