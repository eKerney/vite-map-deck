/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      '5xs': '280px',
      '4xs': '360px',
      '3xs': '400px',
      '2xs': '480px',
      'xs': '540px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      '3xl': '1700px',
      '4xl': '1920px',
      '5xl': '2120px',
      '6xl': '3000px',
    },
    extend: {
      width: {
        '68': '17rem',
        '76': '19rem',
        '84': '21rem',
        '88': '22rem',
        '92': '23rem',
      },
      height: {
        '68': '17rem',
        '76': '19rem',
        '84': '21rem',
        '88': '22rem',
        '92': '23rem',
      },
      gridColumn: {
        'span-13': 'span 13 / span 13',
        'span-14': 'span 14 / span 14',
        'span-15': 'span 15 / span 15',
        'span-16': 'span 16 / span 16',
        'span-17': 'span 17 / span 17',
        'span-18': 'span 18 / span 18',
        'span-19': 'span 19 / span 19',
        'span-20': 'span 20 / span 20',
        'span-21': 'span 21 / span 21',
        'span-22': 'span 22 / span 22',
        'span-23': 'span 23 / span 23',
        'span-24': 'span 24 / span 24',
        'span-25': 'span 25 / span 25',
        'span-26': 'span 26 / span 26',
        'span-27': 'span 27 / span 27',
        'span-28': 'span 28 / span 28',
        'span-29': 'span 29 / span 29',
        'span-30': 'span 30 / span 30',
        'span-31': 'span 31 / span 31',
        'span-32': 'span 32 / span 32',
        'span-33': 'span 33 / span 33',
        'span-34': 'span 34 / span 34',
      },
      gridTemplateRows: {
        '16': 'repeat(16, minmax(0, 1fr))',
      },
      gridRow: {
        '16': 'repeat(16, minmax(0, 1fr))',
      },
      gridTemplateRows: {
        '24': 'repeat(24, minmax(0, 1fr))',
      },
      gridRow: {
        '24': 'repeat(24, minmax(0, 1fr))',
      },
      gridTemplateColumns: {
        '16': 'repeat(16, minmax(0, 1fr))',
      },
      gridTemplateColumns: {
        '24': 'repeat(24, minmax(0, 1fr))',
      },
      gridTemplateColumns: {
        '36': 'repeat(36, minmax(0, 1fr))',
      },
    },
  },
}

