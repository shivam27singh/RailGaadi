/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#090A0F',
        surface: {
          DEFAULT: '#11131A',
          hover: '#181B24',
          active: '#202431',
          subtle: '#151720'
        },
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.08)',
          hover: 'rgba(255, 255, 255, 0.16)',
          active: 'rgba(255, 255, 255, 0.24)'
        },
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA'
        },
        rail: {
          track: '#334155',
          completed: '#3B82F6',
          upcoming: '#1E293B',
          glow: '#60A5FA',
          train: '#F59E0B'
        }
      },
      fontFamily: {
        sans: [
          'SF Pro Display',
          '-apple-system',
          'BlinkMacSystemFont',
          'Inter',
          'system-ui',
          'sans-serif'
        ],
        mono: [
          'JetBrains Mono',
          'SF Mono',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace'
        ]
      },
      boxShadow: {
        'glow-sm': '0 0 12px -2px rgba(59, 130, 246, 0.3)',
        'glow-md': '0 0 24px -4px rgba(59, 130, 246, 0.4)',
        'glow-amber': '0 0 20px -2px rgba(245, 158, 11, 0.4)',
        'glow-emerald': '0 0 20px -2px rgba(16, 185, 129, 0.4)',
        'panel': '0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08)'
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'train-ping': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    }
  },
  plugins: []
};
