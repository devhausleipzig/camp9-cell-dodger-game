/** @type {import('tailwindcss').Config} */
module.exports = {
	mode: "jit",
	content: ["./src/**/*.{html,js,ts}", "./index.html"],
	theme: {
		extend: {
			backgroundImage: {
				'Fire': "url('/image/Fire.png')"},
			fontFamily: {
				space: ["Space Mono", "monospace"]}
			
		}
	},
	plugins: []
	}
