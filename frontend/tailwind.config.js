/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Enhanced Vetra Theme Colors with Dark Mode Support
        primary: {
          50: '#f8f7fd',
          100: '#ede9fa',
          200: '#ddd5f5',
          300: '#c4b5ec',
          400: '#a48ce0',
          500: '#8464d1',
          600: '#6d46c0',
          700: '#5d39a8',
          800: '#4e318a',
          900: '#34214e', // Deep Violet
          950: '#251a3a',
        },
        secondary: {
          50: '#fdf9f0',
          100: '#fbf0db',
          200: '#f6deb7',
          300: '#f0c488',
          400: '#e8a357',
          500: '#e28834',
          600: '#d4722a',
          700: '#b15724',
          800: '#8d5b04', // Mustard Gold
          900: '#734812',
          950: '#3e2307',
        },
        accent: {
          50: '#faf9f7',
          100: '#f4f2ed',
          200: '#e8e4db',
          300: '#d7d0c3',
          400: '#c3b7a6',
          500: '#b3a691',
          600: '#9a8979', // Subtle Tan/Beige
          700: '#806f60',
          800: '#6a5951',
          900: '#564944',
          950: '#2e2622',
        },
        // Dark Mode Color System
        dark: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b', // Main dark background
          900: '#0f172a', // Deeper dark
          950: '#020617', // Darkest
        },
        neutral: {
          50: '#ffffff', // White/off-white
          100: '#f5f5f5', // Light gray
          200: '#e5e5e5', // Mid gray
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717', // Dark gray
          950: '#09070a', // Charcoal Black
        },
        // Supporting colors
        brown: {
          50: '#faf7f5',
          100: '#f4ede7',
          200: '#e7d7ca',
          300: '#d6bba4',
          400: '#c2977c',
          500: '#b47d5f',
          600: '#a76951',
          700: '#8b5646',
          800: '#71483c',
          900: '#3a2719', // Earthy Brown
          950: '#2c1e12',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      animation: {
        'fadeIn': 'fadeIn 0.5s ease-in-out',
        'slideIn': 'slideIn 0.3s ease-out',
        'scaleIn': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'glow-dark': 'glow-dark 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'typing': 'typing 1s steps(40, end), blink-caret .75s step-end infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(132, 100, 209, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(132, 100, 209, 0.8)' },
        },
        'glow-dark': {
          '0%': { boxShadow: '0 0 10px rgba(132, 100, 209, 0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(132, 100, 209, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        typing: {
          'from': { width: '0' },
          'to': { width: '100%' },
        },
        'blink-caret': {
          'from, to': { borderColor: 'transparent' },
          '50%': { borderColor: 'orange' },
        },
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(132, 100, 209, 0.3)',
        'glow': '0 0 20px rgba(132, 100, 209, 0.4)',
        'glow-lg': '0 0 30px rgba(132, 100, 209, 0.5)',
        'inner-glow': 'inset 0 0 10px rgba(132, 100, 209, 0.2)',
        'dark-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
        'dark': '0 1px 3px 0 rgba(0, 0, 0, 0.7), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'dark-md': '0 4px 6px -1px rgba(0, 0, 0, 0.7), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'dark-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.7), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'dark-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.7), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'dark-2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
      },
      gradients: {
        'primary-to-secondary': 'linear-gradient(135deg, var(--primary-600), var(--secondary-600))',
        'accent-subtle': 'linear-gradient(135deg, var(--accent-100), var(--accent-200))',
      },
      backdropBlur: {
        'xs': '2px',
      },
      scale: {
        '102': '1.02',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#374151',
            maxWidth: 'none',
            code: {
              backgroundColor: '#f3f4f6',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.375rem',
              fontWeight: '600',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
          },
        },
        dark: {
          css: {
            color: '#e2e8f0',
            '[class~="lead"]': {
              color: '#cbd5e1',
            },
            a: {
              color: '#a48ce0',
            },
            strong: {
              color: '#f1f5f9',
            },
            'ol > li::before': {
              color: '#64748b',
            },
            'ul > li::before': {
              backgroundColor: '#64748b',
            },
            hr: {
              borderColor: '#334155',
            },
            blockquote: {
              color: '#cbd5e1',
              borderLeftColor: '#334155',
            },
            h1: {
              color: '#f1f5f9',
            },
            h2: {
              color: '#f1f5f9',
            },
            h3: {
              color: '#f1f5f9',
            },
            h4: {
              color: '#f1f5f9',
            },
            'figure figcaption': {
              color: '#64748b',
            },
            code: {
              color: '#f1f5f9',
              backgroundColor: '#334155',
            },
            'a code': {
              color: '#f1f5f9',
            },
            pre: {
              color: '#e2e8f0',
              backgroundColor: '#1e293b',
            },
            thead: {
              color: '#f1f5f9',
              borderBottomColor: '#334155',
            },
            'tbody tr': {
              borderBottomColor: '#334155',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    // Custom plugin for utilities
    function({ addUtilities, addComponents, theme }) {
      const newUtilities = {
        '.text-gradient': {
          'background': 'linear-gradient(135deg, var(--tw-gradient-stops))',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.glass': {
          'backdrop-filter': 'blur(16px) saturate(180%)',
          'background-color': 'rgba(255, 255, 255, 0.75)',
          'border': '1px solid rgba(209, 213, 219, 0.3)',
        },
        '.glass-dark': {
          'backdrop-filter': 'blur(16px) saturate(180%)',
          'background-color': 'rgba(30, 41, 59, 0.75)',
          'border': '1px solid rgba(51, 65, 85, 0.3)',
        },
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        '.line-clamp-2': {
          display: '-webkit-box',
          '-webkit-line-clamp': '2',
          '-webkit-box-orient': 'vertical',
          overflow: 'hidden',
        },
        '.line-clamp-3': {
          display: '-webkit-box',
          '-webkit-line-clamp': '3',
          '-webkit-box-orient': 'vertical',
          overflow: 'hidden',
        },
      }

      const newComponents = {
        '.btn-primary': {
          '@apply bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-secondary-700 transition-all duration-300 transform hover:scale-105 shadow-lg dark:shadow-dark-lg': {},
        },
        '.btn-secondary': {
          '@apply bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold border-2 border-primary-200 hover:bg-primary-50 hover:border-primary-300 transition-all duration-300 transform hover:scale-105 dark:bg-dark-800 dark:text-primary-400 dark:border-primary-700 dark:hover:bg-dark-700': {},
        },
        '.card': {
          '@apply bg-white rounded-xl shadow-lg border border-neutral-200 p-6 hover:shadow-xl transition-all duration-300 dark:bg-dark-800 dark:border-dark-700 dark:shadow-dark-lg dark:hover:shadow-dark-xl': {},
        },
        '.card-interactive': {
          '@apply card hover:scale-105 transform cursor-pointer': {},
        },
      }

      addUtilities(newUtilities)
      addComponents(newComponents)
    },
  ],
} 