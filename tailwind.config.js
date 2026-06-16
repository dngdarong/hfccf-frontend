/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: 'var(--brand-primary-50)',
          100: 'var(--brand-primary-100)',
          200: 'var(--brand-primary-200)',
          300: 'var(--brand-primary-300)',
          400: 'var(--brand-primary-400)',
          500: 'var(--brand-primary-500)',
          600: 'var(--brand-primary-600)',
          700: 'var(--brand-primary-700)',
          800: 'var(--brand-primary-800)',
          900: 'var(--brand-primary-900)',
          950: 'var(--brand-primary-950)',
        },
        surface: {
          50: 'var(--brand-surface-50)',
          100: 'var(--brand-surface-100)',
          200: 'var(--brand-surface-200)',
          300: 'var(--brand-surface-300)',
          400: 'var(--brand-surface-400)',
          500: 'var(--brand-surface-500)',
          600: 'var(--brand-surface-600)',
          700: 'var(--brand-surface-700)',
          800: 'var(--brand-surface-800)',
          900: 'var(--brand-surface-900)',
          950: 'var(--brand-surface-950)',
        },
        hope: {
          lime: 'var(--hope-lime)',
          cyan: 'var(--hope-cyan)',
          red: 'var(--hope-red)',
          yellow: 'var(--hope-yellow)',
          dark: 'var(--hope-dark)',
          light: 'var(--hope-light)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
      },
      boxShadow: {
        focus: '0 0 0 3px color-mix(in srgb, var(--hope-cyan) 18%, transparent)',
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
      },
    },
  },
}
