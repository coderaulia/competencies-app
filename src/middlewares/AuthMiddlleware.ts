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
  const user = useAuthStore().$state.user;
  const isAuthenticatedUSer = useAuthStore().$state.isAuthenticated;
  if (requiredAuthorization && !user?.id && !isAuthenticatedUSer) {
    return guard.next("/authentication/login");
  }
  return guard.next();
}
