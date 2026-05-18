/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CANVAS_API_TOKEN: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
