/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#8B80F9', // Soft purple from screenshot
                    hover: '#7A6EE8',
                    light: '#ECEBFF',
                },
                secondary: {
                    DEFAULT: '#CFFAFE', // Soft cyan/blue
                    dark: '#A5F3FC',
                },
                accent: {
                    DEFAULT: '#FDE68A', // Soft yellow
                },
                background: '#F9FAFB', // Light gray background
                surface: '#FFFFFF',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
                '3xl': '2rem',
            }
        },
    },
    plugins: [],
}
