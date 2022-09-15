import { glob } from "glob";
import { convertMarkdown } from "./convert_markdown";

export function importPosts(postsPath: string) {
	const filePaths = glob.sync(`${postsPath}*.md`);
	return filePaths.map((filePath) => convertMarkdown(filePath));
}
