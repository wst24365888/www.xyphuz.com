import fs from "fs";
import fm from "front-matter";
import { unified } from "unified";
import rehypePrismPlus from "rehype-prism-plus";
import rehypeRaw from "rehype-raw";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import type { MDAttributes } from "src/models/md_attributes";
import type { Post } from "src/models/post";
import remarkParse from "remark-parse";

export function convertMarkdown(path: string): Post {
	let file = fs.readFileSync(path, "utf8");
	let {
		attributes,
		body,
	}: {
		attributes: MDAttributes;
		body: string;
	} = fm(file);

	let result = unified()
		.use(remarkParse)
		.use(remarkRehype)
		.use(rehypePrismPlus)
		.use(rehypeRaw)
		.use(rehypeStringify)
		.processSync(body)
		.toString();

	return {
		mdAttributes: attributes,
		url: path.replace("static/", "").replace(".md", ""),
		html: result,
	};
}
