/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                rag: {
                    red: '#EF4444',
                    amber: '#F59E0B',
                    green: '#10B981',
                },
                brand: {
                    50: '#EEF2FF',
                    100: '#E0E7FF',
                    200: '#C7D2FE',
                    300: '#A5B4FC',
                    400: '#818CF8',
                    500: '#6366F1',
                    600: '#4F46E5',
                    700: '#4338CA',
                    800: '#3730A3',
                    900: '#312E81',
                },
                surface: {
                    light: '#F8FAFC',
                    DEFAULT: '#FFFFFF',
                    dark: '#0F172A',
                    'dark-card': '#1E293B',
                    'dark-hover': '#334155',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            animation: {
                'pulse-slow': 'pulse 3s ease-in-out infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
                'counter': 'counter 1s ease-out forwards',
                'slide-up': 'slideUp 0.5s ease-out',
                'slide-in-right': 'slideInRight 0.3s ease-out',
                'fade-in': 'fadeIn 0.4s ease-out',
            },
            keyframes: {
                glow: {
                    '0%': { boxShadow: '0 0 5px rgba(99, 102, 241, 0.3)' },
                    '100%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.6)' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideInRight: {
                    '0%': { opacity: '0', transform: 'translateX(20px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
            },
            backdropBlur: {
                xs: '2px',
            },
        },
    },
    plugins: [],
}
