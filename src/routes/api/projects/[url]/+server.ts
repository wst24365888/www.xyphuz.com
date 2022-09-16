import { convertMarkdownToProject } from "$lib/server/convert_md_to_project";

export async function GET({ params }: { params: { url: string } }): Promise<Response> {
	const file = convertMarkdownToProject(`static/projects/${params.url}`);

	return new Response(JSON.stringify(file), {
		headers: {
			"Content-Type": "application/json",
		},
	});
}
