/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_ASSETS_PREFIX: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
