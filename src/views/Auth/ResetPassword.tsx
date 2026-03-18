import { fetchData } from "@/composables/useApiService";
import useDocumentTitle from "@/composables/useDocumentTitle";
import { computed, defineComponent, reactive, ref, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";

export default defineComponent({
  name: "ResetPassword",
  setup() {
    useDocumentTitle();

    const route = useRoute();
    const router = useRouter();
    const isSubmitting = ref(false);
    const errorMessage = ref("");
    const formData = reactive({
      email: String(route.query.email || ""),
      token: String(route.query.token || ""),
      password: "",
      password_confirmation: "",
    });

    watch(
      () => route.query,
      (query) => {
        formData.email = String(query.email || formData.email || "");
        formData.token = String(query.token || formData.token || "");
      },
      { deep: true }
    );

    const hasQueryToken = computed(() => Boolean(formData.email && formData.token));

    async function handleResetPassword() {
      if (isSubmitting.value) {
        return;
      }

      errorMessage.value = "";
      isSubmitting.value = true;

      try {
        const { data, statusCode } = await fetchData("POST", {
          path: "/auth/reset-password",
          payload: { ...formData },
        });

        if (statusCode.value === 200) {
          router.push({
            name: "Login",
          });
          return;
        }

        errorMessage.value =
          data.value?.error?.message ?? "Unable to reset password.";
      } catch (error) {
        errorMessage.value = "Unable to connect to the backend.";
      } finally {
        isSubmitting.value = false;
      }
    }

    return {
      errorMessage,
      formData,
      handleResetPassword,
      hasQueryToken,
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
            Set new password
          </h2>
          <p class={["mt-2 text-sm text-slate-600"]}>
            {this.hasQueryToken
              ? "The reset token was filled from the local reset flow."
              : "Paste the local reset token and email to finish the password change."}
          </p>
        </div>

        <form
          class={["space-y-5"]}
          onSubmit={(event) => {
            event.preventDefault();
            this.handleResetPassword();
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
            Reset token
            <input
              class={[
                "mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 font-mono text-sm outline-none transition",
                "focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200",
              ]}
              type="text"
              value={this.formData.token}
              onInput={(event) => {
                this.formData.token = (event.target as HTMLInputElement).value;
              }}
            />
          </label>

          <label class={["block text-sm font-medium text-slate-700"]}>
            New password
            <input
              class={[
                "mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition",
                "focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200",
              ]}
              type="password"
              autocomplete="new-password"
              value={this.formData.password}
              onInput={(event) => {
                this.formData.password = (event.target as HTMLInputElement).value;
              }}
            />
          </label>

          <label class={["block text-sm font-medium text-slate-700"]}>
            Confirm new password
            <input
              class={[
                "mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition",
                "focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200",
              ]}
              type="password"
              autocomplete="new-password"
              value={this.formData.password_confirmation}
              onInput={(event) => {
                this.formData.password_confirmation = (
                  event.target as HTMLInputElement
                ).value;
              }}
            />
          </label>

          {this.errorMessage ? (
            <div class={["rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"]}>
              {this.errorMessage}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={this.isSubmitting}
            class={[
              "w-full rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white transition",
              this.isSubmitting ? "cursor-wait opacity-70" : "hover:bg-emerald-700",
            ]}
          >
            {this.isSubmitting ? "Updating..." : "Change password"}
          </button>
        </form>

        <div class={["mt-6 flex items-center justify-between text-sm"]}>
          <RouterLink
            to={{ name: "RequestPasswordReset" }}
            class={["text-emerald-700 hover:text-emerald-800"]}
          >
            Generate new token
          </RouterLink>
          <RouterLink
            to={{ name: "Login" }}
            class={["text-slate-600 hover:text-slate-900"]}
          >
            Back to login
          </RouterLink>
        </div>
      </div>
    );
  },
});
