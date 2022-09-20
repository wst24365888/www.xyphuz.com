import type { About } from "src/models/about";

export const prerender = true;

export async function load({
	params,
	fetch,
}: {
	params: { url: string };
	fetch: (info: RequestInfo, init?: RequestInit | undefined) => Promise<Response>;
}): Promise<{ about: About }> {
	const about: About = await fetch(`/api/about/${params.url}.md`).then((res) => res.json());

	return { about };
}
