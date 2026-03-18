import useDocumentTitle from "@/composables/useDocumentTitle";
import useApiService from "@/composables/useApiService";
import { useAuthStore } from "@/stores/auth";
import { defineComponent, reactive, ref } from "vue";
import { RouterLink, useRouter } from "vue-router";

export default defineComponent({
  name: "Login",
  setup() {
    useDocumentTitle();

    const router = useRouter();
    const authStore = useAuthStore();
    const isSubmitting = ref(false);
    const errorMessage = ref("");
    const formData = reactive({
      email: "demo@example.com",
      password: "password",
    });

    const handleLoginEvent = async () => {
      if (isSubmitting.value) {
        return;
      }

      errorMessage.value = "";
      isSubmitting.value = true;

      try {
        const { data, statusCode } = await useApiService("auth/login")
          .post({
            email: formData.email,
            password: formData.password,
          })
          .json();

        if (statusCode.value === 200) {
          authStore.onLoginSuccess(
            data.value.user,
            data.value.oAuth,
            data.value.roles,
            data.value.permissions ?? []
          );
          router.push({
            name: "Home",
          });
          return;
        }

        if (statusCode.value === 422) {
          errorMessage.value = data.value?.error?.message ?? "Login failed";
          authStore.onLoginFailed();
          return;
        }

        errorMessage.value = "The server returned an unexpected response.";
      } catch (error) {
        errorMessage.value = "Unable to connect to the backend.";
      } finally {
        isSubmitting.value = false;
      }
    };

    return {
      authStore,
      errorMessage,
      formData,
      handleLoginEvent,
      isSubmitting,
    };
  },
  render() {
    return (
      <div class={["w-full max-w-md rounded-2xl bg-white p-8 shadow-xl"]}>
        <div class={["mb-8"]}>
          <p class={["text-sm font-semibold uppercase tracking-[0.25em] text-emerald-600"]}>
            Competencies App
          </p>
          <h2 class={["mt-3 text-3xl font-bold tracking-tight text-slate-900"]}>
            Sign in
          </h2>
          <p class={["mt-2 text-sm text-slate-600"]}>
            Lean auth mode. This screen now avoids the heavy UI library on first
            paint.
          </p>
        </div>

        <form
          class={["space-y-5"]}
          onSubmit={(event) => {
            event.preventDefault();
            this.handleLoginEvent();
          }}
        >
          <label class={["block text-sm font-medium text-slate-700"]}>
            Email
            <input
              class={[
                "mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition",
                "focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200",
              ]}
              type="email"
              autocomplete="email"
              value={this.formData.email}
              onInput={(event) => {
                this.formData.email = (event.target as HTMLInputElement).value;
              }}
            />
          </label>

          <label class={["block text-sm font-medium text-slate-700"]}>
            Password
            <input
              class={[
                "mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition",
                "focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200",
              ]}
              type="password"
              autocomplete="current-password"
              value={this.formData.password}
              onInput={(event) => {
                this.formData.password = (event.target as HTMLInputElement).value;
              }}
            />
          </label>

          {this.errorMessage ? (
            <div class={["rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"]}>
              {this.errorMessage}
            </div>
          ) : null}

          <div class={["rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800"]}>
            Demo login: <strong>demo@example.com</strong> / <strong>password</strong>
          </div>

          <button
            type="submit"
            disabled={this.isSubmitting}
            class={[
              "w-full rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white transition",
              this.isSubmitting ? "cursor-wait opacity-70" : "hover:bg-emerald-700",
            ]}
          >
            {this.isSubmitting ? "Signing in..." : "Login"}
          </button>
        </form>

        <div class={["mt-6 flex items-center justify-between text-sm"]}>
          <div class={["flex items-center gap-4"]}>
            <RouterLink
              to={{ name: "RequestPasswordReset" }}
              class={["text-emerald-700 hover:text-emerald-800"]}
            >
              Forgot your password?
            </RouterLink>
            <RouterLink
              to={{ name: "Register" }}
              class={["text-emerald-700 hover:text-emerald-800"]}
            >
              Create account
            </RouterLink>
          </div>
          <RouterLink
            to="/welcome-app"
            class={["text-slate-600 hover:text-slate-900"]}
          >
            Back
          </RouterLink>
        </div>
      </div>
    );
  },
});
