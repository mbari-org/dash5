module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
    "../client/src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "media",
  theme: {
    extend: {
      fontFamily: {
        display: "'Mulish', sans-serif",
      },
      screens: { print: { raw: "print" } },
      maxHeight: {
        0: "0",
        "1/4": "25%",
        "1/2": "50%",
        "3/4": "75%",
      },
      maxWidth: {
        xxs: "10rem",
      },
    },
  },
  variants: {
    extend: {
      outline: ["responsive", "focus", "hover", "active"],
      borderRadius: ["last", "first"],
      borderWidth: ["last", "first", "hover"],
      borderColor: ["hover"],
    },
  },
  plugins: [],
}
