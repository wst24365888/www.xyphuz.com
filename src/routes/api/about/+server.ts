import { convertMarkdownToAbout } from "$lib/server/convert_md_to_about";
import { importMDs } from "$lib/server/import_mds";
import type { AboutPreview } from "../../../models/about_preview";

export async function GET(): Promise<Response> {
	const aboutFiles = importMDs(
		`${import.meta.env.VITE_ASSETS_PREFIX}/about/**/*.md`,
		convertMarkdownToAbout,
	);

	const posts: AboutPreview[] = aboutFiles.map((file) => {
		return {
			attributes: file.attributes,
			url: file.url,
		};
	});

	return new Response(JSON.stringify(posts), {
		headers: {
			"Content-Type": "application/json",
		},
	});
}
