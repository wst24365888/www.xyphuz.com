import type { PostPreview } from "../../models/post_preview";


export const prerender = true;

export async function load({
	fetch,
}: {
	fetch: (info: RequestInfo, init?: RequestInit | undefined) => Promise<Response>;
}): Promise<{ posts: PostPreview[] }> {
	let posts: PostPreview[] = await fetch("/api/posts").then((res) => res.json());

	posts = posts.sort((a, b) => {
		return new Date(b.attributes.date).getTime() - new Date(a.attributes.date).getTime();
	});

	return { posts };
}
