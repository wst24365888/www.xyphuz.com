/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{html,svelte,vue,js,ts,jsx,tsx}"],
	theme: {
		extend: {
			typography: {
				DEFAULT: {
					css: {
						h2: {
							a: {
								"font-weight": "bold",
								color: "black",
								"text-decoration": "none",
								"&:hover": {
									"text-decoration": "underline",
								},
							},
						},
					},
				},
			},
		},
	},
	plugins: [require("@tailwindcss/typography")],
};
