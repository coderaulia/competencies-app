import useDocumentTitle from "@/composables/useDocumentTitle";
import useApiService from "@/composables/useApiService";
import { defineComponent, reactive, ref } from "vue";
import { RouterLink, useRouter } from "vue-router";

export default defineComponent({
  name: "Register",
  setup() {
    useDocumentTitle();

    const router = useRouter();
    const isSubmitting = ref(false);
    const errorMessage = ref("");
    const formData = reactive({
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
    });

    const handleRegister = async () => {
      if (isSubmitting.value) {
        return;
      }

      errorMessage.value = "";
      isSubmitting.value = true;

      try {
        const { data, statusCode } = await useApiService("auth/register")
          .post({ ...formData })
          .json();

        if (statusCode.value === 201) {
          router.push({
            name: "Login",
          });
          return;
        }

        errorMessage.value =
          data.value?.error?.message ?? "Unable to create account.";
      } catch (error) {
        errorMessage.value = "Unable to connect to the backend.";
      } finally {
        isSubmitting.value = false;
      }
    };

    return {
      errorMessage,
      formData,
      handleRegister,
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
            Create account
          </h2>
          <p class={["mt-2 text-sm text-slate-600"]}>
            Register a local account for the minimal backend.
          </p>
        </div>

        <form
          class={["space-y-5"]}
          onSubmit={(event) => {
            event.preventDefault();
            this.handleRegister();
          }}
        >
          <label class={["block text-sm font-medium text-slate-700"]}>
            Full name
            <input
              class={[
                "mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition",
                "focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200",
              ]}
              type="text"
              autocomplete="name"
              value={this.formData.name}
              onInput={(event) => {
                this.formData.name = (event.target as HTMLInputElement).value;
              }}
            />
          </label>

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
              autocomplete="new-password"
              value={this.formData.password}
              onInput={(event) => {
                this.formData.password = (event.target as HTMLInputElement).value;
              }}
            />
          </label>

          <label class={["block text-sm font-medium text-slate-700"]}>
            Confirm password
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
            {this.isSubmitting ? "Creating..." : "Create account"}
          </button>
        </form>

        <div class={["mt-6 flex items-center justify-between text-sm"]}>
          <RouterLink
            to={{ name: "Login" }}
            class={["text-emerald-700 hover:text-emerald-800"]}
          >
            Back to login
          </RouterLink>
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
