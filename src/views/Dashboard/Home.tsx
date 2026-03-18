import { useAuthStore } from "@/stores/auth";
import { computed, defineComponent } from "vue";
import { RouterLink } from "vue-router";

type Shortcut = {
  label: string;
  description: string;
  routeName: string;
  roles: string[];
};

const shortcuts: Shortcut[] = [
  {
    label: "Employees",
    description: "Manage employment data and assessment links.",
    routeName: "Employment",
    roles: ["superadmin"],
  },
  {
    label: "Positions",
    description: "Check positions, filters, and position analytics.",
    routeName: "Position",
    roles: ["superadmin"],
  },
  {
    label: "Requirement Scores",
    description: "Edit score mappings between positions and competencies.",
    routeName: "MatrixesRequirementScores",
    roles: ["superadmin"],
  },
  {
    label: "Publication Lists",
    description: "Browse uploaded mock publications and bucket contents.",
    routeName: "UploadListPublication",
    roles: ["superadmin", "manager", "employee"],
  },
  {
    label: "My Profile",
    description: "Inspect the hydrated employee profile and account activity.",
    routeName: "MyProfile",
    roles: ["superadmin", "manager", "employee"],
  },
  {
    label: "Self Assessments",
    description: "Review the current employee assessment records.",
    routeName: "MySelfAssessmentRecords",
    roles: ["superadmin", "manager", "employee"],
  },
  {
    label: "Subordinates",
    description: "See direct reports and jump into their assessment pages.",
    routeName: "MySubordinatesRecords",
    roles: ["superadmin", "manager", "employee"],
  },
];

export default defineComponent({
  name: "WelcomeDashboard",
  setup() {
    const store = useAuthStore();
    const primaryRole = computed(() => {
      return store.$state.roles[0] ?? "guest";
    });

    const visibleShortcuts = computed(() => {
      return shortcuts.filter((shortcut) =>
        shortcut.roles.includes(String(primaryRole.value))
      );
    });

    return {
      primaryRole,
      store,
      visibleShortcuts,
    };
  },
  render() {
    return (
      <div class={["space-y-6"]}>
        <div>
          <p class={["text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600"]}>
            Overview
          </p>
          <h2 class={["mt-2 text-3xl font-bold text-slate-900"]}>
            Welcome back {this.store.$state.user?.name ?? "User"}
          </h2>
          <p class={["mt-2 text-sm text-slate-600"]}>
            The shell is still optimized for fast first paint, but the backend
            now exposes a broader mock API so the legacy modules below can be
            exercised again.
          </p>
        </div>

        <div class={["grid gap-4 md:grid-cols-3"]}>
          <section class={["rounded-2xl border border-slate-200 bg-slate-50 p-5"]}>
            <div class={["text-sm text-slate-500"]}>Session</div>
            <div class={["mt-3 text-2xl font-bold text-slate-900"]}>
              {this.store.$state.isAuthenticated ? "Active" : "Inactive"}
            </div>
          </section>

          <section class={["rounded-2xl border border-slate-200 bg-slate-50 p-5"]}>
            <div class={["text-sm text-slate-500"]}>Role</div>
            <div class={["mt-3 text-2xl font-bold text-slate-900"]}>
              {this.primaryRole}
            </div>
          </section>

          <section class={["rounded-2xl border border-slate-200 bg-slate-50 p-5"]}>
            <div class={["text-sm text-slate-500"]}>Backend mode</div>
            <div class={["mt-3 text-2xl font-bold text-slate-900"]}>Mock</div>
          </section>
        </div>

        <section class={["rounded-2xl border border-slate-200 bg-slate-50 p-5"]}>
          <div class={["flex items-center justify-between"]}>
            <div>
              <h3 class={["text-lg font-bold text-slate-900"]}>
                Re-enabled modules
              </h3>
              <p class={["mt-1 text-sm text-slate-600"]}>
                Start with the screens already backed by the new in-memory API.
              </p>
            </div>
          </div>

          <div class={["mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4"]}>
            {this.visibleShortcuts.map((shortcut) => (
              <RouterLink
                key={shortcut.routeName}
                to={{ name: shortcut.routeName }}
                class={[
                  "rounded-2xl border border-slate-200 bg-white p-4 transition",
                  "hover:border-emerald-300 hover:shadow-sm",
                ]}
              >
                <div class={["text-sm font-semibold text-slate-900"]}>
                  {shortcut.label}
                </div>
                <div class={["mt-2 text-sm text-slate-500"]}>
                  {shortcut.description}
                </div>
              </RouterLink>
            ))}
          </div>
        </section>
      </div>
    );
  },
});
