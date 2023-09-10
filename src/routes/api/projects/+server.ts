import { convertMarkdownToProject } from "$lib/server/convert_md_to_project";
import { importMDs } from "$lib/server/import_mds";
import type { ProjectPreview } from "../../../models/project_preview";

export async function GET(): Promise<Response> {
	const projectFiles = importMDs(
		`${import.meta.env.VITE_ASSETS_PREFIX}/projects/**/*.md`,
		convertMarkdownToProject,
	);

	const projects: ProjectPreview[] = projectFiles.map((file) => {
		return {
			attributes: file.attributes,
			url: file.url,
		};
	});

	return new Response(JSON.stringify(projects), {
		headers: {
			"Content-Type": "application/json",
		},
	});
}
