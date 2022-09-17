import type { ProjectAttributes } from "./project_attributes";

export interface Project {
	attributes: ProjectAttributes;
	url: string;
	html: string;
}
