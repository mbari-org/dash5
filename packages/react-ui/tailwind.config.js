module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
    '../../apps/lrauv-dash2/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        primary: {
          600: '#1D4ED8',
        },
        secondary: {
          100: '#F0F9FF',
          300: '#E0F2FE',
        },
      },
      fontFamily: {
        display: "'Inter', sans-serif",
        mono: "'Inconsolata', monospace",
      },
      screens: { print: { raw: 'print' } },
      maxHeight: {
        0: '0',
        '1/4': '25%',
        '1/2': '50%',
        '3/4': '75%',
      },
      maxWidth: {
        xxs: '10rem',
      },
    },
  },
  variants: {
    extend: {
      outline: ['responsive', 'focus', 'hover', 'active'],
      borderRadius: ['last', 'first'],
      borderWidth: ['last', 'first', 'hover'],
      borderColor: ['hover'],
    },
  },
  plugins: [],
}
