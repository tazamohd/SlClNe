/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the SALIS AUTO API. Unset → the app runs on mock data;
   *  set (e.g. http://localhost:4000) → screens read through the HTTP
   *  repository and login authenticates against `/auth/login`. */
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
