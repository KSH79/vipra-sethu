/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Saffron (Primary) - Full scale
        saffron: {
          50: "#FFF8E7",
          100: "#FFEDCC",
          200: "#FFD699",
          300: "#FFBF66",
          400: "#FFA833",
          500: "#E57C1F", // Primary brand color
          600: "#CC6E1B",
          700: "#B35F17",
          800: "#995113",
          900: "#80420F",
          DEFAULT: "#E57C1F",
        },
        // Gold (Accent) - Full scale
        gold: {
          50: "#FCF8E8",
          100: "#F9F3DC",
          200: "#F3E7B9",
          300: "#EDDB96",
          400: "#E7CF73",
          500: "#D4AF37", // Accent color
          600: "#B8942F",
          700: "#9C7927",
          800: "#805E1F",
          900: "#644317",
          DEFAULT: "#D4AF37",
        },
        // Ivory (Background) - Full scale
        ivory: {
          50: "#FFFAF2",
          100: "#FFF8E7", // Primary background
          200: "#FEF0D2",
          300: "#FDE8BD",
          DEFAULT: "#FFF8E7",
        },
        // Sandstone (Neutral) - Full scale
        sandstone: {
          50: "#F7F3F0",
          100: "#EFE8E2",
          200: "#D4C4B8",
          300: "#B9A08E",
          400: "#9E7C64",
          500: "#A67B5B", // Primary neutral
          600: "#8B7365",
          700: "#7A6358",
          800: "#69534B",
          900: "#58433E",
          DEFAULT: "#A67B5B",
        },
      },
      fontSize: {
        // Enhanced typography scale
        'xs': ['0.75rem', { lineHeight: '1rem' }],      // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }],     // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],      // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
        '5xl': ['3rem', { lineHeight: '1' }],           // 48px
        '6xl': ['4rem', { lineHeight: '1' }],           // 64px
      },
      boxShadow: {
        // Enhanced elevation system
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'hover': '0 12px 24px -8px rgba(229, 124, 31, 0.15)',
        'soft': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'soft-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        'sm': '0.375rem',  // 6px
        'md': '0.5rem',    // 8px
        'lg': '0.75rem',   // 12px
        'xl': '0.875rem',  // 14px
        '2xl': '1rem',     // 16px
        '3xl': '1.5rem',   // 24px
      },
      spacing: {
        '18': '4.5rem',   // 72px
        '88': '22rem',    // 352px
      },
      maxWidth: {
        '6xl': '72rem',   // 1152px
        '7xl': '80rem',   // 1280px
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        slideIn: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
    fontFamily: {
      sans: ["Inter", "Noto Sans", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      display: ["Noto Serif", "Georgia", "serif"],
    },
  },
  plugins: [],
};
export default config;
