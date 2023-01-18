import type { AboutPreview } from "../../models/about_preview";


export const prerender = true;

export async function load({
	fetch,
}: {
	fetch: (info: RequestInfo, init?: RequestInit | undefined) => Promise<Response>;
}): Promise<{ abouts: AboutPreview[] }> {
	let abouts: AboutPreview[] = await fetch("/api/about").then((res) => res.json());

	abouts = abouts.sort((a, b) => {
		return a.attributes.index - b.attributes.index;
	});

	return { abouts };
}
