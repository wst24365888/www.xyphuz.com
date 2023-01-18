import fs from "fs";
import fm from "front-matter";
import { unified } from "unified";
import rehypePrismPlus from "rehype-prism-plus";
import rehypeRaw from "rehype-raw";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import type { Post } from "../../models/post";
import type { PostAttributes } from "../../models/post_attributes";

export function convertMarkdownToPost(path: string): Post {
	const file = fs.readFileSync(path, "utf8");
	const {
		attributes,
		body,
	}: {
		attributes: PostAttributes;
		body: string;
	} = fm(file);

	const result = unified()
		.use(remarkParse)
		.use(remarkGfm)
		.use(remarkRehype)
		.use(rehypePrismPlus)
		.use(rehypeRaw)
		.use(rehypeSlug)
		.use(rehypeAutolinkHeadings, {
			behavior: "wrap",
		})
		.use(rehypeStringify)
		.processSync(body)
		.toString();

	return {
		attributes,
		url: path.replace("static", "").replace(".md", ""),
		html: result,
	};
}
