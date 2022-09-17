import type { ProjectPreview } from "src/models/project_preview";

export async function load({
	fetch,
}: {
	fetch: (info: RequestInfo, init?: RequestInit | undefined) => Promise<Response>;
}): Promise<{ projects: ProjectPreview[] }> {
	let projects: ProjectPreview[] = await fetch("/api/projects").then((res) => res.json());

	projects = projects.sort((a, b) => {
		return a.attributes.index - b.attributes.index;
	});

	return { projects };
}
