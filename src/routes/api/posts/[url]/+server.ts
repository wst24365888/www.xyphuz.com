import { convertMarkdown } from "$lib/server/convert_markdown";

export async function GET({ params }: { params: { url: string } }): Promise<Response> {
	const file = convertMarkdown(`static/posts/${params.url}`);

	return new Response(JSON.stringify(file), {
		headers: {
			"Content-Type": "application/json",
		},
	});
}
