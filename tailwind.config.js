/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        bordercolor: 'var(--color-border)',
        primary: 'var(--color-text-primary)',
        secondary: 'var(--color-text-secondary)',
        tertiary: 'var(--color-text-tertiary)',
        'brand-primary': 'var(--color-brand-primary)',
        'brand-primary-content': 'var(--color-brand-primary-content)',
        'status-danger': 'var(--color-status-danger)',
        'status-success': 'var(--color-status-success)',
      }
    },
  },
  plugins: [],
}