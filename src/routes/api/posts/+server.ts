import { convertMarkdownToPost } from "$lib/server/convert_md_to_post";
import { importMDs } from "$lib/server/import_mds";
import type { PostPreview } from "../../../models/post_preview";

export async function GET(): Promise<Response> {
	const postFiles = importMDs(
		`${import.meta.env.VITE_ASSETS_PREFIX}/posts/**/*.md`,
		convertMarkdownToPost,
	);

	const posts: PostPreview[] = postFiles.map((file) => {
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
