/** @type {import('tailwindcss').Config} */
// Theme colours are CSS variables (see index.css) so light and dark mode share every class.
// `white` is the foreground ink: true white in dark mode, deep navy in light mode.
// Use `snow` / `abyss` when a colour must stay fixed regardless of theme.
const v = (name) => `rgb(var(--c-${name}) / <alpha-value>)`

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        white: v('fg'),
        snow: '#FFFFFF',
        abyss: '#060B22',
        ixi: {
          orange: '#F57224',
          ember: v('ember'),
          night: v('night'),
          navy: v('navy'),
          ink: v('ink'),
          line: v('line'),
          paper: '#FFF5EA',
        },
        abhi: '#E8384F',
        ctkt: '#14B87A',
        verify: v('verify'),
        gold: v('gold'),
        danger: v('danger'),
        link: v('link'),
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(245,114,36,.4), 0 10px 40px -6px rgba(245,114,36,.65)',
      },
    },
  },
  plugins: [],
}
