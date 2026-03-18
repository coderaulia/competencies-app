import useApiService from "@/composables/useApiService";
import type { EmploymentResource } from "@/models/Employment";
import { NCard, NSelect } from "naive-ui";
import { defineComponent, onMounted, ref, watch, computed } from "vue";
import { RouterLink, useRouter } from "vue-router";
export default defineComponent({
  name: "SearchEmployee",
  setup(props, {}) {
    const employments = ref<EmploymentResource[] | []>([]);
    const options = ref([]);
    const selectedOption = ref<unknown>(null);
    const selectIsLoading = ref<boolean>(false);

    const selectedOption_ = computed({
      get: () => selectedOption.value,
      set: (value) => (selectedOption.value = value),
    });

    const initEmploymentOptions = async () => {
      const { data, statusCode } = await useApiService(
        "/employments_autocomplete_options"
      )
        .get()
        .json();

      if (statusCode.value === 200) {
        employments.value = data.value.data as EmploymentResource[];
      }
    };

    const patchOptions = (values: EmploymentResource[] | []) => {
      // @ts-ignore
      options.value = Array.from(values).map((el) => {
        return {
          // @ts-ignore
          label: el.profile_fullname,
          // @ts-ignore
          value: el.employment_id,
        };
      });
    };

    const handleSearchOptions = (value: string) => {
      if (!value.length) {
        patchOptions(employments.value);
        return;
      }

      selectIsLoading.value = true;
      window.setTimeout(() => {
        const keyword = value.toLowerCase();
        options.value = employments.value
          .map((employment) => ({
            // @ts-ignore
            label: employment.profile_fullname,
            // @ts-ignore
            value: employment.employment_id,
          }))
          .filter((item) => String(item.label).toLowerCase().includes(keyword));
        selectIsLoading.value = false;
      }, 500);
    };

    const resetOptions = () => {
      // @ts-ignore
      patchOptions(employments.value);
    };

    const router = useRouter();
    function handleSelectedChange(n: unknown): void {
      if (n === null) {
        return;
      }
      router.push({
        name: "check_employment_data",
        params: {
          // @ts-ignore
          id: n,
        },
      });
    }

    watch(
      () => employments.value,
      (n, o) => patchOptions(n as EmploymentResource[])
    );

    watch(
      () => selectedOption.value,
      (n, o) => handleSelectedChange(n)
    );

    onMounted(() => {
      initEmploymentOptions();
    });

    return {
      employments,
      patchOptions,
      options,
      selectedOption,
      selectedOption_,
      handleSearchOptions,
      selectIsLoading,
      resetOptions,
    };
  },
  render() {
    const { options, handleSearchOptions, selectIsLoading, resetOptions } =
      this;
    return (
      <div
        class={[
          "min-h-screen bg-slate-950 px-6 py-16 text-slate-100",
          "flex items-center justify-center",
        ]}
      >
        <div class={["w-full max-w-3xl space-y-6"]}>
          <div class={["space-y-2"]}>
            <p class={["text-sm uppercase tracking-[0.3em] text-emerald-300"]}>
              Public Directory
            </p>
            <h1 class={["text-4xl font-bold text-white"]}>Search employee data</h1>
            <p class={["max-w-2xl text-sm text-slate-300"]}>
              Pick a seeded employee to inspect the public employment detail flow
              against the local mock backend.
            </p>
          </div>

          <NCard embedded class={["bg-white/5"]}>
            <div class={["space-y-4"]}>
              <NSelect
                v-model:value={this.selectedOption_}
                size="large"
                clearable
                remote
                filterable
                options={options}
                loading={selectIsLoading}
                onSearch={(value) => handleSearchOptions(value)}
                placeholder="Type the name of employee that you want to check"
                onClear={() => resetOptions()}
              />

              <div class={["flex gap-3 text-sm"]}>
                <RouterLink
                  to="/welcome-app"
                  class={[
                    "rounded-md border border-slate-700 px-4 py-2 font-medium text-slate-200",
                  ]}
                >
                  Back
                </RouterLink>
                <RouterLink
                  to="/authentication/login"
                  class={[
                    "rounded-md bg-emerald-500 px-4 py-2 font-medium text-slate-950",
                  ]}
                >
                  Open Login
                </RouterLink>
              </div>
            </div>
          </NCard>
        </div>
      </div>
    );
  },
});
