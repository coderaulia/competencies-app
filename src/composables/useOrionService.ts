import { Orion } from "@tailflow/laravel-orion/lib/orion";
import { useLocalStorage } from "@vueuse/core";

/**
 * Orion init function
 * @date 12/2/2022 - 01:42:55
 *
 * @export
 */
export default function useOrionService() {
  const storage = useLocalStorage("useAuthStore", null);
  const storedAuth = JSON.parse(storage.value as unknown as string);
  const isAuthenticated = storedAuth.isAuthenticated ? true : false;
  const storedBearedToken = storedAuth.authorization.token;
  if (isAuthenticated) {
    Orion.init(import.meta.env.VITE_BACKEND_ORION_BASE_URL);
    Orion.setToken(storedBearedToken);
  }
}
