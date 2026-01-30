/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}", "./node_modules/flowbite/**/*.js"],
  theme: {
    extend: {
      fontFamily: {
        th: ['"TH K2D July8"', "sans-serif"],
      },
    },
  },
  plugins: [require("flowbite/plugin")],
};
