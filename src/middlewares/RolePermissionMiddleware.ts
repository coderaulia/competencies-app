import { useAuthStore } from "@/stores/auth";
import type { RouteMiddlewareGuard } from "./Middlleware";

export default function RolePermissionMiddleware(role: string | string[]) {
  const allowedRoles = Array.isArray(role) ? role : [role];

  return function roleGuard(guard: RouteMiddlewareGuard) {
    const currentRoles = useAuthStore().$state.roles ?? [];
    const hasAllowedRole = currentRoles.some((item) =>
      allowedRoles.includes(item)
    );

    if (!hasAllowedRole) {
      return guard.next("/errors/403");
    }

    return guard.next();
  };
}
