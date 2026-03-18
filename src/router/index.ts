import AuthMiddleware from "@/middlewares/AuthMiddlleware";
import Middleware from "@/middlewares/Middleware";
import RolePermissionMiddleware from "@/middlewares/RolePermissionMiddleware";
import type { RouteMiddleware } from "@/middlewares/Middlleware";
import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

declare module "vue-router" {
  interface RouteMeta {
    requiresAuth: boolean;
    documentTitle: string;
    middleware: RouteMiddleware;
  }
}

const meta = (
  documentTitle: string,
  requiresAuth = false,
  middleware: RouteMiddleware = []
) => ({
  documentTitle,
  requiresAuth,
  middleware,
});

const authOnly: RouteMiddleware = [AuthMiddleware];
const superadminOnly: RouteMiddleware = [
  AuthMiddleware,
  RolePermissionMiddleware("superadmin"),
];

const dashboardChildren: RouteRecordRaw[] = [
  {
    path: "home",
    name: "Home",
    component: () => import("@/views/Dashboard/Home"),
    meta: meta("Dashboard Home", true, authOnly),
  },
  {
    path: "me",
    name: "MyEmploymentData",
    component: () => import("@/views/Dashboard/MyEmploymentData/Index"),
    meta: meta("My Employment Data", true, authOnly),
    redirect: {
      name: "MyProfile",
    },
    children: [
      {
        path: "profile",
        name: "MyProfile",
        component: () => import("@/views/Dashboard/MyEmploymentData/Profile/Index"),
        meta: meta("My Profile", true, authOnly),
      },
      {
        path: "employment-detail",
        name: "MyEmploymentDetail",
        component: () =>
          import("@/views/Dashboard/MyEmploymentData/EmploymentDetail/Index"),
        meta: meta("My Employment Detail", true, authOnly),
      },
      {
        path: "employment-hierarchies",
        name: "MyEmploymentHierarchies",
        component: () =>
          import("@/views/Dashboard/MyEmploymentData/EmploymentHierarchies/Index"),
        meta: meta("My Employment Hierarchies", true, authOnly),
      },
      {
        path: "self-assessment-records",
        name: "MySelfAssessmentRecords",
        component: () =>
          import("@/views/Dashboard/MyEmploymentData/SelfAssessmentRecords/Index"),
        meta: meta("My Self Assessment Records", true, authOnly),
      },
      {
        path: "subordinates",
        name: "MySubordinatesRecords",
        component: () =>
          import("@/views/Dashboard/MyEmploymentData/SubordinatesRecords/Index"),
        meta: meta("My Subordinates Records", true, authOnly),
      },
    ],
  },
  {
    path: "users",
    name: "User",
    component: () => import("@/views/Dashboard/User/Index"),
    meta: meta("Users", true, superadminOnly),
  },
  {
    path: "roles",
    name: "Role",
    component: () => import("@/views/Dashboard/Role/Index"),
    meta: meta("Roles", true, superadminOnly),
  },
  {
    path: "permissions",
    name: "Permission",
    component: () => import("@/views/Dashboard/Permission/Index"),
    meta: meta("Permissions", true, superadminOnly),
  },
  {
    path: "employment",
    name: "Employment",
    component: () => import("@/views/Dashboard/Employment/Index"),
    meta: meta("Employment", true, superadminOnly),
  },
  {
    path: "employment/:id/assessment",
    name: "EmploymentAssessment",
    component: () => import("@/views/Dashboard/Employment/Records/Assessment"),
    meta: meta("Employment Assessment", true, authOnly),
  },
  {
    path: "employment/employment/:id/assessment",
    name: "EmploymentAssessmentLegacy",
    component: () => import("@/views/Dashboard/Employment/Records/Assessment"),
    meta: meta("Employment Assessment", true, authOnly),
  },
  {
    path: "positions",
    name: "Position",
    component: () => import("@/views/Dashboard/Position/Index"),
    meta: meta("Positions", true, superadminOnly),
  },
  {
    path: "competencies",
    name: "Competency",
    component: () => import("@/views/Dashboard/Competency/Index"),
    meta: meta("Competencies", true, superadminOnly),
  },
  {
    path: "competency-levels",
    name: "CompetencyLevel",
    component: () => import("@/views/Dashboard/CompetencyLevel/Index"),
    meta: meta("Competency Levels", true, superadminOnly),
  },
  {
    path: "trainings",
    name: "Training",
    component: () => import("@/views/Dashboard/Training/Index"),
    meta: meta("Trainings", true, superadminOnly),
  },
  {
    path: "assessment-schedules",
    name: "AssessmentSchedule",
    component: () => import("@/views/Dashboard/AssessmentSchedule/Index"),
    meta: meta("Assessment Schedules", true, superadminOnly),
  },
  {
    path: "requirement-scores",
    name: "MatrixesRequirementScores",
    component: () => import("@/views/Dashboard/RequirementScore/Index"),
    meta: meta("Requirement Scores", true, superadminOnly),
  },
  {
    path: "analytics/employees",
    name: "EmployeAssessmentAnalytics",
    component: () => import("@/views/Dashboard/Diagrams/EmployeeRecords/Index"),
    meta: meta("Employee Analytics", true, superadminOnly),
  },
  {
    path: "analytics/employees/:employeeID",
    name: "EmployeAssessmentAnalyticsDetails",
    component: () => import("@/views/Dashboard/Diagrams/EmployeeRecords/Show"),
    meta: meta("Employee Analytics Detail", true, superadminOnly),
  },
  {
    path: "analytics/departments",
    name: "DepartmentGroupChildrens",
    component: () =>
      import("@/views/Dashboard/Diagrams/DepartmentGroupRecords/Childrens/Index"),
    meta: meta("Department Analytics", true, superadminOnly),
  },
  {
    path: "library/buckets",
    name: "BucketManagement",
    component: () => import("@/views/Dashboard/Elearning/Bucket/Index"),
    meta: meta("Bucket Management", true, authOnly),
  },
  {
    path: "library/publications/upload",
    name: "Publication",
    component: () => import("@/views/Dashboard/Elearning/Publication/FormUploadPublication"),
    meta: meta("Upload Publication", true, authOnly),
  },
  {
    path: "library/publications",
    name: "UploadListPublication",
    component: () => import("@/views/Dashboard/Elearning/Publication/LIstUploadPublication"),
    meta: meta("Publication Lists", true, authOnly),
  },
  {
    path: "library/buckets/detail",
    name: "FileStorageBucket",
    component: () => import("@/views/Dashboard/Elearning/FileStorage/FileStorageBucket"),
    meta: meta("Bucket Detail", true, authOnly),
  },
  {
    path: "library/publications/detail",
    name: "UploadedPublicationDetail",
    component: () =>
      import("@/views/Dashboard/Elearning/Publication/UploadedPublicationDetail"),
    meta: meta("Publication Detail", true, authOnly),
  },
  {
    path: "library/publications/approval",
    name: "SuperadminPublicationManagement",
    component: () => import("@/views/Dashboard/Elearning/Publication/SuperAdminList"),
    meta: meta("Publication Approval", true, superadminOnly),
  },
];

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("@/layouts/Base"),
    meta: meta("Welcome"),
    redirect: {
      name: "welcome",
    },
    children: [
      {
        path: "/welcome-app",
        component: () => import("@/views/Home/Welcome"),
        name: "welcome",
        meta: meta("Welcome App"),
      },
      {
        path: "/welcome-app/search",
        component: () => import("@/views/Home/SearchEmployee"),
        name: "SearchEmployeePublic",
        meta: meta("Search Employee"),
      },
      {
        path: "/welcome-app/check-employment/:id",
        component: () => import("@/views/Home/SearchEmployeeResult"),
        name: "check_employment_data",
        meta: meta("Employment Detail"),
      },
    ],
  },
  {
    path: "/authentication",
    component: () => import("@/layouts/Base"),
    meta: meta("Authentication"),
    redirect: {
      name: "DefaultAuthentication",
    },
    children: [
      {
        path: "",
        name: "DefaultAuthentication",
        component: () => import("@/layouts/Authentication/Default"),
        meta: meta("Authentication"),
        redirect: {
          name: "Login",
        },
        children: [
          {
            path: "login",
            name: "Login",
            component: () => import("@/views/Auth/Login"),
            meta: meta("Login"),
          },
          {
            path: "register",
            name: "Register",
            component: () => import("@/views/Auth/Register"),
            meta: meta("Register"),
          },
          {
            path: "request-password-reset",
            name: "RequestPasswordReset",
            component: () => import("@/views/Auth/RequestPasswordReset"),
            meta: meta("Forgot Password"),
          },
          {
            path: "reset-password",
            name: "ResetPassword",
            component: () => import("@/views/Auth/ResetPassword"),
            meta: meta("Reset Password"),
          },
        ],
      },
    ],
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: () => import("@/layouts/Base"),
    meta: meta("Dashboard", true, authOnly),
    redirect: {
      name: "Home",
    },
    children: [
      {
        path: "",
        name: "DefaultDashboard",
        component: () => import("@/layouts/Dashboard/Default"),
        meta: meta("Dashboard", true, authOnly),
        redirect: {
          name: "Home",
        },
        children: dashboardChildren,
      },
    ],
  },
  {
    path: "/errors/403",
    name: "Errors",
    component: () => import("@/views/Errors/403"),
    meta: meta("Error"),
  },
  {
    path: "/errors/500",
    name: "ErrorsInternalServerError",
    component: () => import("@/views/Errors/500"),
    meta: meta("Error"),
  },
  {
    path: "/:catchAll(.*)",
    name: "ErrorsPageNotFound",
    component: () => import("@/views/Errors/404"),
    meta: meta("Error"),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(Middleware());

export default router;
