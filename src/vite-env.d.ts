/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_ALLOWED_EMAILS: string;
  readonly VITE_CHECKIN_WEBHOOK_URL: string;
  readonly VITE_STATS_WEBHOOK_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
