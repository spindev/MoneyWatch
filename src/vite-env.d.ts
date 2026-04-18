/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_IS_DOCKER?: string;
  readonly VITE_APP_TAG?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare const __APP_VERSION__: string;
declare const __APP_TAG__: string;
