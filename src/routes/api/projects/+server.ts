import { convertMarkdownToProject } from "$lib/server/convert_md_to_project";
import { importMDs } from "$lib/server/import_mds";
import type { PostPreview } from "../../../models/post_preview";

export async function GET(): Promise<Response> {
	const projectFiles = importMDs("static/projects/**/*.md", convertMarkdownToProject);

	const posts: PostPreview[] = projectFiles.map((file) => {
		return {
			attributes: file.attributes,
			url: file.url,
		};
	});

	return new Response(JSON.stringify(posts), {
		headers: {
			"Content-Type": "application/json",
		},
	});
}
