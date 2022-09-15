import pkg from "glob";
const { glob } = pkg;
import { convertMarkdown } from "./convert_markdown";

export function importPosts(postsPath: string) {
	const filePaths = glob.sync(postsPath);
	return filePaths.map((filePath) => convertMarkdown(filePath));
}
