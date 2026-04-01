export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        teal: { DEFAULT: '#00796b', light: '#e8f5e9', dark: '#005a4e' },
        coral: '#ff6b6b',
        amber: { DEFAULT: '#ffb300', light: '#fff8e1' },
        sage: '#e8f5e9',
      },
      fontFamily: {
        nunito: ['Nunito', 'sans-serif'],
      },
      borderRadius: {
        xl: '16px',
        '2xl': '20px',
      }
    }
  }
}
