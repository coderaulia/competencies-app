import useApiService from "@/composables/useApiService";
import { useAuthStore } from "@/stores/auth";
import {
  computed,
  defineComponent,
  provide,
  reactive,
  ref,
  type InjectionKey,
  watch,
} from "vue";
import { RouterLink, RouterView, useRoute, useRouter } from "vue-router";
import type { UserResource } from "@/models/User";

export const UserInjectionKey = Symbol() as InjectionKey<UserResource | null>;

type NavItem = {
  name: string;
  label: string;
  roles: string[];
  matches?: string[];
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const authenticatedRoles = ["superadmin", "manager", "employee"];
const superadminRoles = ["superadmin"];
const detailedUserRouteNames = new Set([
  "MyProfile",
  "MyEmploymentDetail",
  "MyEmploymentHierarchies",
  "MySelfAssessmentRecords",
  "MySubordinatesRecords",
]);

const navSections: NavSection[] = [
  {
    title: "Overview",
    items: [{ name: "Home", label: "Dashboard Home", roles: authenticatedRoles }],
  },
  {
    title: "Workforce",
    items: [
      {
        name: "Employment",
        label: "Employees",
        roles: superadminRoles,
        matches: ["EmploymentAssessment", "EmploymentAssessmentLegacy"],
      },
      { name: "User", label: "Users", roles: superadminRoles },
    ],
  },
  {
    title: "Access Control",
    items: [
      { name: "Role", label: "Roles", roles: superadminRoles },
      { name: "Permission", label: "Permissions", roles: superadminRoles },
    ],
  },
  {
    title: "Competency System",
    items: [
      { name: "Position", label: "Positions", roles: superadminRoles },
      { name: "Competency", label: "Competencies", roles: superadminRoles },
      {
        name: "CompetencyLevel",
        label: "Competency Levels",
        roles: superadminRoles,
      },
      { name: "Training", label: "Trainings", roles: superadminRoles },
      {
        name: "AssessmentSchedule",
        label: "Assessment Schedules",
        roles: superadminRoles,
      },
      {
        name: "MatrixesRequirementScores",
        label: "Requirement Scores",
        roles: superadminRoles,
      },
    ],
  },
  {
    title: "Analytics",
    items: [
      {
        name: "EmployeAssessmentAnalytics",
        label: "Employee Records",
        roles: superadminRoles,
        matches: ["EmployeAssessmentAnalyticsDetails"],
      },
      {
        name: "DepartmentGroupChildrens",
        label: "Department Charts",
        roles: superadminRoles,
      },
    ],
  },
  {
    title: "My Workspace",
    items: [
      { name: "MyProfile", label: "Profile", roles: authenticatedRoles },
      {
        name: "MyEmploymentDetail",
        label: "Employment Detail",
        roles: authenticatedRoles,
      },
      {
        name: "MyEmploymentHierarchies",
        label: "Reporting Lines",
        roles: authenticatedRoles,
      },
      {
        name: "MySelfAssessmentRecords",
        label: "Self Assessments",
        roles: authenticatedRoles,
      },
      {
        name: "MySubordinatesRecords",
        label: "Subordinates",
        roles: authenticatedRoles,
      },
    ],
  },
  {
    title: "Library",
    items: [
      {
        name: "BucketManagement",
        label: "Buckets",
        roles: superadminRoles,
        matches: ["FileStorageBucket"],
      },
      {
        name: "Publication",
        label: "Upload Publication",
        roles: authenticatedRoles,
      },
      {
        name: "UploadListPublication",
        label: "Publication Lists",
        roles: authenticatedRoles,
        matches: ["UploadedPublicationDetail"],
      },
      {
        name: "SuperadminPublicationManagement",
        label: "Publication Approvals",
        roles: superadminRoles,
      },
    ],
  },
];

export default defineComponent({
  name: "DefaultDashboard",
  setup() {
    const router = useRouter();
    const route = useRoute();
    const authStore = useAuthStore();
    const isLoggingOut = ref(false);
    const injectedUser = reactive<UserResource>({
      name: null,
      email: null,
      email_verified_at: null,
      roles: [],
      permissions: [],
      profile: null,
    } as UserResource);

    const currentRouteName = computed(() => String(route.name ?? ""));
    const shouldHydrateDetailedUser = computed(() =>
      detailedUserRouteNames.has(currentRouteName.value)
    );

    const syncInjectedUserFromStore = () => {
      const user = authStore.$state.user;

      Object.assign(injectedUser, {
        id: user?.id,
        name: user?.name ?? null,
        email: user?.email ?? null,
        email_verified_at: null,
        roles: [],
        permissions: [],
        profile: null,
        last_logged_in_at: null,
        last_logged_in_host: null,
        last_logged_in_port: null,
        last_logged_in_user_agent: null,
        last_logged_in_device: null,
        last_logged_in_browser: null,
        last_logged_in_platform: null,
      });
    };

    const hydrateInjectedUser = async () => {
      if (!authStore.$state.user?.id) {
        return;
      }

      const { data, statusCode } = await useApiService("/auth/user").get().json();

      if (statusCode.value === 200 && data.value) {
        Object.assign(injectedUser, data.value as UserResource);
      }
    };

    const currentUser = computed<UserResource | null>(() => {
      if (!injectedUser?.id) {
        return null;
      }

      return injectedUser;
    });

    const currentRole = computed(() => {
      return String(authStore.$state.roles[0] ?? "guest");
    });

    const visibleSections = computed(() => {
      return navSections
        .map((section) => ({
          ...section,
          items: section.items.filter((item) =>
            item.roles.includes(currentRole.value)
          ),
        }))
        .filter((section) => section.items.length > 0);
    });

    const initials = computed(() => {
      const name = currentUser.value?.name?.trim();
      return name ? name.charAt(0).toUpperCase() : "U";
    });

    const pageTitle = computed(() => {
      return String(route.meta.documentTitle ?? "Dashboard");
    });

    const isActive = (item: NavItem) => {
      const currentName = currentRouteName.value;
      return currentName === item.name || (item.matches ?? []).includes(currentName);
    };

    provide(UserInjectionKey, injectedUser);

    watch(
      () => [currentRouteName.value, authStore.$state.user?.id],
      async () => {
        syncInjectedUserFromStore();

        if (shouldHydrateDetailedUser.value) {
          await hydrateInjectedUser();
        }
      },
      { immediate: true }
    );

    const handleLogoutEvent = async () => {
      if (isLoggingOut.value) {
        return;
      }

      isLoggingOut.value = true;

      try {
        await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authStore.access_token ?? ""}`,
          },
        });
      } finally {
        authStore.onLogoutSuccess();
        isLoggingOut.value = false;
        router.push({ name: "Login" });
      }
    };

    return {
      currentRole,
      currentUser,
      handleLogoutEvent,
      initials,
      isActive,
      isLoggingOut,
      pageTitle,
      visibleSections,
    };
  },
  render() {
    return (
      <div class={["min-h-screen bg-slate-100 text-slate-900"]}>
        <header
          class={[
            "sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur",
          ]}
        >
          <div
            class={[
              "mx-auto flex max-w-7xl items-center justify-between px-6 py-4",
            ]}
          >
            <div>
              <p
                class={[
                  "text-xs font-semibold uppercase tracking-[0.28em] text-emerald-600",
                ]}
              >
                Competencies App
              </p>
              <h1 class={["mt-1 text-xl font-bold text-slate-900"]}>
                {this.pageTitle}
              </h1>
            </div>

            <div class={["flex items-center gap-4"]}>
              <div class={["text-right"]}>
                <div class={["text-sm font-semibold text-slate-900"]}>
                  {this.currentUser?.name}
                </div>
                <div class={["text-xs text-slate-500"]}>
                  {this.currentRole}
                </div>
              </div>

              <div
                class={[
                  "flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700",
                ]}
              >
                {this.initials}
              </div>

              <button
                onClick={this.handleLogoutEvent}
                class={[
                  "rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition",
                  "hover:border-slate-400 hover:bg-slate-50",
                ]}
              >
                {this.isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </header>

        <div
          class={[
            "mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[260px_1fr]",
          ]}
        >
          <aside
            class={[
              "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm",
              "h-fit lg:sticky lg:top-24",
            ]}
          >
            {this.visibleSections.map((section) => (
              <div key={section.title} class={["mb-5 last:mb-0"]}>
                <div
                  class={[
                    "mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400",
                  ]}
                >
                  {section.title}
                </div>
                <nav class={["space-y-1.5"]}>
                  {section.items.map((item) => (
                    <RouterLink
                      key={item.name}
                      to={{ name: item.name }}
                      class={[
                        "block rounded-lg px-4 py-2.5 text-sm font-medium transition",
                        this.isActive(item)
                          ? "bg-emerald-50 text-emerald-700"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                      ]}
                    >
                      {item.label}
                    </RouterLink>
                  ))}
                </nav>
              </div>
            ))}
          </aside>

          <main
            class={[
              "min-w-0 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm",
            ]}
          >
            <RouterView />
          </main>
        </div>
      </div>
    );
  },
});
