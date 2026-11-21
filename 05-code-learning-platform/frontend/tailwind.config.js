/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        code: {
          bg: '#0d1117',
          surface: '#161b22',
          border: '#30363d',
          accent: '#238636',
          blue: '#58a6ff',
          orange: '#d29922',
        }
      },
    },
  },
  plugins: [],
};
