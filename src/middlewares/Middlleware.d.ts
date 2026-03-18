import type {
  NavigationGuardNext,
  NavigationGuardWithThis,
  RouteLocationNormalized,
} from "vue-router";
export type RouteMiddlewareGuard = {
  to: RouteLocationNormalized;
  from: RouteLocationNormalized;
  next: NavigationGuardNext;
};

export type RouteMiddleware =
  | ((guard: RouteMiddlewareGuard) => void)[]
  | string[];
