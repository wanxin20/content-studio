/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    screens: {
      xs: '480px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'Liberation Mono', 'monospace'],
      },
      colors: {
        // 模块主色（也通过 Tailwind 的 blue-600 / orange-600 等访问，这里给语义别名方便复用）
        mod: {
          home: '#18181b',      // zinc-900
          library: '#2563eb',   // blue-600
          text: '#ea580c',      // orange-600
          multimodal: '#059669', // emerald-600
          manage: '#7c3aed',    // violet-600
        },
      },
      keyframes: {
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        blink: 'blink 1s steps(2) infinite',
        fadeIn: 'fadeIn 200ms ease-out',
      },
    },
  },
  plugins: [],
};
