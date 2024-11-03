/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            width: {
                'popup': '320px',
            },
            colors: {
                'timer-blue': '#4a90e2',
                'timer-green': '#4caf50',
            }
        },
    },
    plugins: [],
}