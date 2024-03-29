import type { Project } from "../../../models/project";

export const prerender = "auto";

export async function load({
	params,
	fetch,
}: {
	params: { url: string };
	fetch: (info: RequestInfo, init?: RequestInit | undefined) => Promise<Response>;
}): Promise<{ project: Project }> {
	const project: Project = await fetch(`/api/projects/${params.url}.md`).then((res) => res.json());

	return { project };
}
