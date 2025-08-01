// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        fontFamily: {
          // You might want a system sans-serif font for body for better performance,
          // or a specific one like Inter or Open Sans.
          sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', '"Noto Sans"', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"', '"Noto Color Emoji"'],
          // A classic serif font for headings, similar to Medium
          serif: ['Merriweather', 'Georgia', 'serif'],
        },
        colors: {
          // Define a custom neutral palette for Medium-like feel
          gray: {
            50: '#F9FAFB',    // Lightest background
            100: '#F3F4F6',   // Background
            200: '#E5E7EB',
            300: '#D1D5DB',
            400: '#9CA3AF',   // Light text
            500: '#6B7280',   // Medium text
            600: '#4B5563',   // Darker text
            700: '#374151',   // Even darker text
            800: '#1F2937',   // Main text color
            900: '#111827',   // Darkest text/accents
          },
          blue: { // Keeping a subtle blue for accents
            100: '#DBEAFE',
            200: '#BFDBFE',
            300: '#93C5FD',
            400: '#60A5FA',
            500: '#3B82F6',
            600: '#2563EB',
            700: '#1D4ED8',
            800: '#1E40AF',
            900: '#1E3A8A',
          }
        }
      },
    },
    plugins: [],
  }