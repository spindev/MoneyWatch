/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_IS_DOCKER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare const __APP_VERSION__: string;
