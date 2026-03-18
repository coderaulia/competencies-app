import { useAuthStore } from "@/stores/auth";
import router from "@/router";
import { createFetch, type MaybeComputedRef } from "@vueuse/core";

const PUBLIC_API_PATHS = new Set([
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password/request-reset-link",
  "/auth/reset-password",
]);

const GUEST_APP_PATHS = new Set([
  "/",
  "/welcome-app",
  "/authentication/login",
  "/authentication/register",
  "/authentication/request-password-reset",
  "/authentication/reset-password",
]);

function normalizeApiPath(url: string, baseUrl: string) {
  const normalizedUrl = String(url || "").replace(baseUrl, "");
  const [path] = normalizedUrl.split("?");
  if (!path.startsWith("/")) {
    return `/${path}`;
  }
  return path;
}

function isPublicApiRequest(url: string, baseUrl: string) {
  return PUBLIC_API_PATHS.has(normalizeApiPath(url, baseUrl));
}

function redirectToLogin() {
  const currentPath = window.location.pathname;
  if (GUEST_APP_PATHS.has(currentPath) || currentPath.startsWith("/welcome-app/")) {
    return;
  }

  router
    .replace({
      name: "Login",
      query: { expired: "1" },
    })
    .catch(() => undefined);
}

function handleUnauthorizedRequest(url: string) {
  const store = useAuthStore();
  const env = import.meta.env.VITE_BACKEND_BASE_URL;

  if (isPublicApiRequest(url, env)) {
    return;
  }

  store.onLogoutFailed();
  redirectToLogin();
}

/**
 * Api wrapper for native fetch build on top of vue-member
 *
 *
 * @date 12/1/2022 - 11:10:36
 *
 * @type {*}
 */
const useApiService = createFetch({
  baseUrl: import.meta.env.VITE_BACKEND_BASE_URL,
  combination: "overwrite",
  options: {
    async beforeFetch({ url, options, cancel }) {
      const store = useAuthStore();
      const token = store.access_token;
      const env = import.meta.env.VITE_BACKEND_BASE_URL;
      const securedApiEndpoint = !isPublicApiRequest(String(url), env);

      if (securedApiEndpoint && token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        };
      }
      return { options };
    },
    afterFetch(ctx) {
      if (ctx.response?.status === 401) {
        handleUnauthorizedRequest(ctx.response.url || String(ctx.url || ""));
      }

      return ctx;
    },
    onFetchError(ctx) {
      if (ctx.response?.status === 401) {
        handleUnauthorizedRequest(ctx.response.url || String(ctx.url || ""));
      }

      return ctx;
    },
  },
  fetchOptions: {
    credentials: "omit",
    mode: "cors",
  },
});

type HTTPMethodtType = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type FetchOptions = {
  path: string;
  payload?: Object | null;
} | null;
export async function fetchData(
  method: HTTPMethodtType,
  options: FetchOptions
) {
  const invokableFunc = useApiService(
    options?.path as unknown as MaybeComputedRef<string>
  );
  switch (method) {
    case "GET":
      return invokableFunc.get();
    case "POST":
      return invokableFunc.post(options?.payload).json();
    default:
      return invokableFunc.get();
  }
}
export default useApiService;
