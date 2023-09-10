import { glob } from "glob";

export async function GET(): Promise<Response> {
	const sitePrefix = "https://www.xyphuz.com";

	const normalRoutes = ["", "about", "projects", "blog", "contact"];

	const mdRoutes = ["about", "projects", "posts"];

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
	xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"
	xmlns:news="https://www.google.com/schemas/sitemap-news/0.9"
	xmlns:xhtml="https://www.w3.org/1999/xhtml"
	xmlns:mobile="https://www.google.com/schemas/sitemap-mobile/1.0"
	xmlns:image="https://www.google.com/schemas/sitemap-image/1.1"
	xmlns:video="https://www.google.com/schemas/sitemap-video/1.1"
>
	${normalRoutes
		.map(
			(route) => `<url>
			<loc>${sitePrefix}/${route}</loc>
		</url>
	`,
		)
		.join("")}
	${mdRoutes
		.map((route) =>
			glob
				.sync(`${import.meta.env.VITE_ASSETS_PREFIX}/${route}/*.md`)
				.map((filePath) => {
					const url = filePath.replace(import.meta.env.VITE_ASSETS_PREFIX, "").replace(".md", "");
					return `<url>
						<loc>${sitePrefix}/${url}</loc>
					</url>
					`;
				})
				.join(""),
		)
		.join("")}
</urlset>
	`;

	return new Response(xml, {
		headers: {
			"Content-Type": "application/xml",
			"Cached-Control": "max-age=0, s-maxage=3600",
		},
	});
}
