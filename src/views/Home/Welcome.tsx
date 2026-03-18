import { NCard, NTag } from "naive-ui";
import { defineComponent } from "vue";
import { RouterLink } from "vue-router";

export default defineComponent({
  name: "Welcome",
  render() {
    return (
      <div
        class={[
          "min-h-screen bg-slate-950 px-6 py-16 text-slate-100",
          "flex items-center justify-center",
        ]}
      >
        <div class={["w-full max-w-3xl space-y-6"]}>
          <div class={["flex items-center justify-between"]}>
            <div>
              <p class={["text-sm uppercase tracking-[0.3em] text-emerald-300"]}>
                Competencies App
              </p>
              <h1 class={["mt-2 text-4xl font-bold text-white"]}>
                Lean frontend mode
              </h1>
            </div>
            <NTag type="success" round>
              Minimal
            </NTag>
          </div>

          <NCard embedded class={["bg-white/5"]}>
            <div class={["space-y-4 text-slate-200"]}>
              <p>
                The app has been reduced to the smallest useful slice so the dev
                server can boot faster and the first screen can render reliably.
              </p>
              <p>
                Current scope: public landing page, employee lookup, login,
                core dashboard routes, and a local Express mock backend.
              </p>
              <div class={["flex gap-3"]}>
                <RouterLink
                  to="/welcome-app/search"
                  class={[
                    "rounded-md border border-emerald-400/40 px-4 py-2 font-medium text-emerald-200",
                  ]}
                >
                  Search Employee
                </RouterLink>
                <RouterLink
                  to="/authentication/login"
                  class={[
                    "rounded-md bg-emerald-500 px-4 py-2 font-medium text-slate-950",
                  ]}
                >
                  Open Login
                </RouterLink>
                <RouterLink
                  to="/dashboard/home"
                  class={[
                    "rounded-md border border-slate-600 px-4 py-2 font-medium text-slate-100",
                  ]}
                >
                  Dashboard
                </RouterLink>
              </div>
            </div>
          </NCard>
        </div>
      </div>
    );
  },
});
