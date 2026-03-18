import { useAuthStore } from "@/stores/auth";
import { createFetch, type MaybeComputedRef } from "@vueuse/core";

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
      const publicApiEndpoint = [
        "/auth/login",
        "/auth/register",
        "/auth/forgot-password/request-reset-link",
        "/auth/reset-password",
      ].map((el) => env + el);
      const securedApiEndpoint = !publicApiEndpoint.includes(url);

      if (securedApiEndpoint) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        };
      }
      return { options };
    },
    onFetchError(ctx) {
      return ctx;
    },
  },
  fetchOptions: {
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
