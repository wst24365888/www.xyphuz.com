import type { PostPreview } from "src/models/post_preview";

export async function load({ params, fetch }: { params: { tag: string }, fetch: (info: RequestInfo, init?: RequestInit | undefined) => Promise<Response>}): Promise<{ tag: string, posts: PostPreview[] }> {	
	let posts: PostPreview[] = await fetch("/api/posts").then((res) =>
		res.json(),
	);

	posts = posts.filter((post) => post.mdAttributes.tags.includes(params.tag));

	return { tag: params.tag, posts };
}
