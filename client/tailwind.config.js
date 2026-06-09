/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Inter', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        // Instagram brand gradients (used as solid fallbacks)
        ig: {
          purple: '#833AB4',
          pink:   '#FD1D1D',
          orange: '#FCB045',
          blue:   '#3797F0',
        },
        // Chat backgrounds
        chatBg: {
          light: '#fafafa',
          dark:  '#000000',
        },
        sidebarBg: {
          light: '#ffffff',
          dark:  '#000000',
        },
        panelBg: {
          light: '#fafafa',
          dark:  '#121212',
        },
        // Message bubbles — Instagram DM exact colors
        bubbleSelf: {
          light: '#3797F0',
          dark:  '#3797F0',
        },
        bubbleOther: {
          light: '#efefef',
          dark:  '#262626',
        },
        // Surface/card colors
        surface: {
          light: '#ffffff',
          dark:  '#121212',
        },
        border: {
          light: '#dbdbdb',
          dark:  '#262626',
        },
        // Text
        textPrimary: {
          light: '#262626',
          dark:  '#f5f5f5',
        },
        textSecondary: {
          light: '#8e8e8e',
          dark:  '#a8a8a8',
        },
      },
      backgroundImage: {
        'ig-gradient': 'linear-gradient(45deg, #833AB4, #FD1D1D, #FCB045)',
        'ig-gradient-v': 'linear-gradient(to bottom, #833AB4, #FD1D1D, #FCB045)',
        'ig-story-ring': 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
        'ig-blue-gradient': 'linear-gradient(135deg, #3797F0, #0056cc)',
      },
      animation: {
        'spin-slow':        'spin 3s linear infinite',
        'pulse-slow':       'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow':       'float 8s ease-in-out infinite',
        'float-reverse':    'floatReverse 10s ease-in-out infinite',
        'slide-up':         'slideUp 0.3s ease-out',
        'fade-in':          'fadeIn 0.2s ease-out',
        'bounce-soft':      'bounceSoft 1s ease-in-out infinite',
        'typing-dot':       'typingDot 1.4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        floatReverse: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(12px)' },
        },
        slideUp: {
          from: { transform: 'translateY(10px)', opacity: '0' },
          to:   { transform: 'translateY(0)',     opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-4px)' },
        },
        typingDot: {
          '0%, 60%, 100%': { transform: 'translateY(0)',   opacity: '0.4' },
          '30%':            { transform: 'translateY(-6px)', opacity: '1'   },
        },
      },
      boxShadow: {
        'ig': '0 4px 20px rgba(131, 58, 180, 0.25)',
        'ig-sm': '0 2px 8px rgba(131, 58, 180, 0.15)',
      },
    },
  },
  plugins: [],
}
