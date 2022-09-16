import type { PostAttributes } from "./post_attributes";

export interface Post {
	attributes: PostAttributes;
	url: string;
	html: string;
}
