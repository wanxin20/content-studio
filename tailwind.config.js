/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Geist"', '"Noto Sans SC"', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', '"JetBrains Mono"', 'ui-monospace', 'monospace'],
        zh: ['"Noto Sans SC"', '"Geist"', '"HarmonyOS Sans SC"', 'sans-serif'],
      },
      colors: {
        bg: {
          DEFAULT: '#070A12',
          panel: '#0E1320',
          elev: '#161C2E',
          hi: '#1E2640',
        },
        edge: {
          DEFAULT: '#1F2A40',
          bright: '#2D3A56',
          glow: '#3D4E78',
        },
        fg: {
          DEFAULT: '#E2E8F0',
          muted: '#94A3B8',
          faint: '#64748B',
          dim: '#475569',
        },
        cyan: {
          DEFAULT: '#00E5FF',
          dim: '#00B8CC',
          deep: '#0077A6',
        },
        magenta: {
          DEFAULT: '#FF2D55',
          dim: '#CC1840',
          deep: '#7A0F2A',
          soft: 'rgba(255,45,85,0.10)',
        },
        acid: {
          DEFAULT: '#A3FF12',
          dim: '#7FCC0E',
          deep: '#4D7A08',
          soft: 'rgba(163,255,18,0.10)',
        },
        amber: {
          DEFAULT: '#FFB800',
          dim: '#CC9300',
          deep: '#806000',
          glow: '#FFC940',
          soft: 'rgba(255,184,0,0.12)',
        },
        rose: { DEFAULT: '#FF4D6D', dim: '#CC3D57' },
        // alias for legacy code
        brand: { 50: '#0E1320', 500: '#00E5FF', 600: '#00B8CC', 700: '#0077A6' },
        paper: { DEFAULT: '#070A12', warm: '#0E1320', cream: '#161C2E' },
        ink: { DEFAULT: '#E2E8F0', soft: '#94A3B8', faint: '#64748B' },
        rule: '#1F2A40',
        gold: { DEFAULT: '#FFB800', deep: '#CC9300' },
        cobalt: { DEFAULT: '#00E5FF', soft: 'rgba(0,229,255,0.10)' },
        vermilion: { DEFAULT: '#FF2D55', soft: 'rgba(255,45,85,0.10)' },
        graphite: { DEFAULT: '#A3FF12', soft: 'rgba(163,255,18,0.10)' },
        neon: '#00E5FF',
      },
      letterSpacing: {
        tightish: '-0.015em',
        wider2: '0.18em',
        widest2: '0.28em',
      },
      boxShadow: {
        card: '0 1px 0 rgba(0, 229, 255, 0.04), 0 8px 20px -12px rgba(0, 0, 0, 0.7)',
        cardHover: '0 0 0 1px rgba(0, 229, 255, 0.3), 0 0 28px -6px rgba(0, 229, 255, 0.35), 0 24px 40px -20px rgba(0, 0, 0, 0.8)',
        glowCyan: '0 0 24px -6px rgba(0, 229, 255, 0.55)',
        glowMag: '0 0 24px -6px rgba(255, 45, 85, 0.55)',
        glowAcid: '0 0 24px -6px rgba(163, 255, 18, 0.55)',
        glowAmber: '0 0 24px -6px rgba(255, 184, 0, 0.55)',
      },
      animation: {
        'fade-up': 'fadeUp 700ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fadeIn 800ms ease-out both',
        'slide-right': 'slideRight 500ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
        'scan': 'scan 8s linear infinite',
        'drift': 'drift 60s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(12px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideRight: {
          '0%': { opacity: 0, transform: 'translateX(-12px)' },
          '100%': { opacity: 1, transform: 'translateX(0)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.4, transform: 'scale(0.85)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        drift: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-48px)' },
        },
      },
    },
  },
  plugins: [],
};
