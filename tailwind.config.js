/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ixi: {
          orange: '#F57224',
          ember: '#FF9A4D',
          night: '#060B22',
          navy: '#0D1840',
          ink: '#15214F',
          line: '#24316A',
          paper: '#FFF5EA',
        },
        abhi: '#E8384F',
        ctkt: '#14B87A',
        verify: '#38D9C0',
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
