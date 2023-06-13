/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{html,svelte,vue,js,ts,jsx,tsx}"],
	theme: {
		extend: {
			typography: {
				DEFAULT: {
					css: {
						a: {
							color: "var(--accent-color)",
						},
						h1: {
							a: {
								"font-weight": "bold",
								color: "black",
								"text-decoration": "none",
								"&:hover": {
									"text-decoration": "underline",
								},
							},
						},
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
						h3: {
							a: {
								"font-weight": "bold",
								color: "black",
								"text-decoration": "none",
								"&:hover": {
									"text-decoration": "underline",
								},
							},
						},
						h4: {
							a: {
								"font-weight": "bold",
								color: "black",
								"text-decoration": "none",
								"&:hover": {
									"text-decoration": "underline",
								},
							},
						},
						h5: {
							a: {
								"font-weight": "bold",
								color: "black",
								"text-decoration": "none",
								"&:hover": {
									"text-decoration": "underline",
								},
							},
						},
						h6: {
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
