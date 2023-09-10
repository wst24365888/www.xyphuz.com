import { convertMarkdownToPost } from "$lib/server/convert_md_to_post";

export async function GET({ params }: { params: { url: string } }): Promise<Response> {
	const file = convertMarkdownToPost(`${import.meta.env.VITE_ASSETS_PREFIX}/posts/${params.url}`);

	return new Response(JSON.stringify(file), {
		headers: {
			"Content-Type": "application/json",
		},
	});
}
