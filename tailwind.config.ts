import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#F8E8FA', // pastel pink
        secondary: '#B0E0FF', // pastel blue
        accent: '#FFE0B3', // pastel yellow
        'paid-green': '#8ED99E',
        'alert-red': '#FF8A8A',
      },
      fontFamily: {
        sans: ['Quicksand', 'system-ui', 'sans-serif'],
      },
      mixBlendMode: {
        overlay: 'overlay',
      },
    },
  },
  plugins: [],
}
export default config