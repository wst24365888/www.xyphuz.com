import { glob } from "glob";

export function importMDs<T>(path: string, convert_function: (path: string) => T): T[] {
	const filePaths = glob.sync(path);
	return filePaths.map((filePath) => convert_function(filePath));
}
