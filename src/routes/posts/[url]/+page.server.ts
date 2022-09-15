import type { Post } from "src/models/post";

export async function load({ params }: { params: { url: string } }): Promise<{ post: Post }> {
	const post: Post = await fetch(`http://127.0.0.1:5173/api/posts/${params.url}`).then((res) =>
		res.json(),
	);

	return { post };
}
