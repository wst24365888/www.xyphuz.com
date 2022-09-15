import type { PostPreview } from "src/models/post_preview";

export async function load(): Promise<{ posts: PostPreview[] }> {
	const posts: PostPreview[] = await fetch("http://127.0.0.1:5173/api/posts").then((res) =>
		res.json(),
	);

	console.log(posts.length);

	return { posts };
}
