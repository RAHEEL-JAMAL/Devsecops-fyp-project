/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['"Space Grotesk"', 'sans-serif'],
      },
      colors: {
        base: '#080c14',
        surface: '#0d1321',
        card: '#111827',
        border: '#1e2d45',
        accent: '#3b82f6',
        success: '#22c55e',
        danger: '#ef4444',
        warning: '#f59e0b',
        muted: '#4b5563',
        text: '#e2e8f0',
        subtle: '#94a3b8',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px #3b82f6, 0 0 10px #3b82f640' },
          '50%': { boxShadow: '0 0 15px #3b82f6, 0 0 30px #3b82f680' },
        },
      },
    },
  },
  plugins: [],
};
