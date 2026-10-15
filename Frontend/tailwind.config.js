export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0b0f14',
        panel: '#111823',
        panel2: '#151d2a',
        accent: '#b3ff3c',
        accentSoft: '#d9ff87',
        pastelGreen: '#86efac',
        line: 'rgba(255,255,255,0.08)'
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(179,255,60,0.15), 0 16px 40px rgba(0,0,0,0.35)',
        pastelGlow: '0 0 25px rgba(134,239,172,0.18), 0 0 50px rgba(134,239,172,0.06)',
        pastelGlowSubtle: '0 0 18px rgba(134,239,172,0.10)'
      }
    }
  },
  plugins: []
};
