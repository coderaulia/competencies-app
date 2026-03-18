import { useAuthStore } from "@/stores/auth";
import type { RouteMiddlewareGuard } from "./Middlleware";
export default function AuthMiddlleware(guard: RouteMiddlewareGuard) {
  const guestPath = [
    "/authentication/login",
    "/authentication/register",
    "/authentication/request-password-reset",
    "/authentication/reset-password",
    "/welcome-app",
    "/",
  ];

  const requiredAuthorization = !guestPath.includes(guard.to.path);
  const store = useAuthStore();
  const user = store.$state.user;
  const token = store.access_token;

  if (requiredAuthorization && (!user?.id || !token)) {
    return guard.next("/authentication/login");
  }
  return guard.next();
}
