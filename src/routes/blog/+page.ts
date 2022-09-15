import type { PostPreview } from "src/models/post_preview";

export async function load({ fetch }: { fetch: (info: RequestInfo, init?: RequestInit | undefined) => Promise<Response>}): Promise<{ posts: PostPreview[] }> {	
	const posts: PostPreview[] = await fetch("/api/posts").then((res) =>
		res.json(),
	);

	console.log(posts.length);

	return { posts };
}
