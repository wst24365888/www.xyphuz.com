import type { PostPreview } from "../../../models/post_preview";

export const prerender = "auto";

export async function load({
	params,
	fetch,
}: {
	params: { tag: string };
	fetch: (info: RequestInfo, init?: RequestInit | undefined) => Promise<Response>;
}): Promise<{ tag: string; posts: PostPreview[] }> {
	let posts: PostPreview[] = await fetch("/api/posts").then((res) => res.json());

	posts = posts.filter((post) => post.attributes.tags.includes(params.tag));

	posts = posts.sort((a, b) => {
		return new Date(b.attributes.date).getTime() - new Date(a.attributes.date).getTime();
	});

	return { tag: params.tag, posts };
}
