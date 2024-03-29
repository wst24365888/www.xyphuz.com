import type { Post } from "../../../models/post";

export const prerender = false;

export async function load({
	params,
	fetch,
}: {
	params: { url: string };
	fetch: (info: RequestInfo, init?: RequestInit | undefined) => Promise<Response>;
}): Promise<{ post: Post }> {
	const post: Post = await fetch(`/api/posts/${params.url}.md`).then((res) => res.json());

	return { post };
}
