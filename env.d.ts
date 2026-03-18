/// <reference types="vite/client" />

declare global {
  interface Window {
    Pusher: any;
    Echo: any;
  }
}
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_BACKEND_SCHEME: "https" | "http";
  readonly VITE_BACKEND_HOST: "localhost";
  readonly VITE_BACKEND_PORT: "8080";
  readonly VITE_BACKEND_BASE_URL: string;
  readonly VITE_BACKEND_ORION_BASE_URL: string;
  readonly VITE_PUSHER_APP_KEY: string;
  readonly VITE_PUSHER_APP_CLUSTER: string;
  readonly VITE_AWS_S3_BUCKET_OBJECT_BASEPATH: string;
  // more env variables...
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
