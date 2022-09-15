import type { PostPreview } from "src/models/post_preview";

export async function load({
	fetch,
}: {
	fetch: (info: RequestInfo, init?: RequestInit | undefined) => Promise<Response>;
}): Promise<{ posts: PostPreview[] }> {
	let posts: PostPreview[] = await fetch("/api/posts").then((res) => res.json());

	posts = posts.sort((a, b) => {
		return new Date(b.mdAttributes.date).getTime() - new Date(a.mdAttributes.date).getTime();
	});

	return { posts };
}
