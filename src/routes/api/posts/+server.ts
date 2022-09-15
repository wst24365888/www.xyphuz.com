import { importPosts } from "$lib/server/import_posts";
import type { PostPreview } from "src/models/post_preview";

export async function GET(): Promise<Response> {
	const postFiles = importPosts("src/posts/");

	const posts: PostPreview[] = postFiles.map((file) => {
		return {
			mdAttributes: file.mdAttributes,
			url: file.url,
		};
	});

	return new Response(JSON.stringify(posts), {
		headers: {
			"Content-Type": "application/json",
		},
	});
}
