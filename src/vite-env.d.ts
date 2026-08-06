/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SEOUL_BUS_SERVICE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
