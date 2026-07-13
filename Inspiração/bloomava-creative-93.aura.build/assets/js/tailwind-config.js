// Tailwind runtime configuration — extends the default theme with the
// project's custom font family and brand color tokens. Must load after
// the Tailwind CDN runtime and before the page is rendered.
tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        background: '#ffffff',
        foreground: '#111111',
        muted: '#f4f4f4',
        'muted-foreground': '#666666',
        border: '#e5e5e5',
        accent: '#ff7a59',
      },
    },
  },
};
