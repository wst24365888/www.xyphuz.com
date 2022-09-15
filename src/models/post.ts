import type { MDAttributes } from "./md_attributes";

export interface Post {
	mdAttributes: MDAttributes;
	url: string;
	html: string;
}
