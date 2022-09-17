import { convertMarkdownToAbout } from "$lib/server/convert_md_to_about";

export async function GET({ params }: { params: { url: string } }): Promise<Response> {
	const file = convertMarkdownToAbout(`static/about/${params.url}`);

	return new Response(JSON.stringify(file), {
		headers: {
			"Content-Type": "application/json",
		},
	});
}
