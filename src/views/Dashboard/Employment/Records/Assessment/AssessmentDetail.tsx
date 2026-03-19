import AssessmentHistorySection from "@/components/Assessment/AssessmentHistorySection";
import type { EmploymentResource } from "@/models/Employment";
import { NEmpty } from "naive-ui";
import { defineComponent, toRefs, type PropType } from "vue";

export default defineComponent({
  name: "EmploymentRecordsAssessmentDetail",
  props: {
    data: {
      type: Object as PropType<EmploymentResource | null>,
      default: null,
    },
  },
  setup(props) {
    const { data } = toRefs(props);

    return {
      data,
    };
  },
  render() {
    const employment = this.data;

    return (
      <div>
        <div class={["flex flex-col"]}>
          <div class="md:grid md:grid-cols-3 md:gap-6 p-2">
            <div class="mt-5 md:col-span-3 md:mt-0">
              <div class="overflow-hidden shadow sm:rounded-md">
                <div class="overflow-hidden bg-white shadow sm:rounded-lg">
                  <div class="px-4 py-5 sm:px-6">
                    <h3 class="text-lg font-medium leading-6 text-green-900">
                      Employee Assessment Records
                    </h3>
                    <p class="mt-1 max-w-2xl text-sm text-green-500">
                      Assessment score and reporting detail
                    </p>
                  </div>
                  <div class="border-t border-green-200">
                    <dl>
                      <div class="bg-green-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-green-500">
                          Username
                        </dt>
                        <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                          {employment?.profile?.user?.name ?? "-"}
                        </dd>
                      </div>
                      <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-green-500">
                          Email Address
                        </dt>
                        <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                          {employment?.profile?.user?.email ?? "-"}
                        </dd>
                      </div>
                      <div class="bg-green-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-green-500">
                          Fullname
                        </dt>
                        <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                          {employment?.profile?.profile_fullname ?? "-"}
                        </dd>
                      </div>
                      <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-green-500">
                          Report to Email Address
                        </dt>
                        <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                          {employment?.parent?.profile?.user?.email ?? "-"}
                        </dd>
                      </div>
                      <div class="bg-green-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-green-500">
                          Report to Fullname
                        </dt>
                        <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                          {employment?.parent?.profile?.profile_fullname ?? "-"}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class={["flex flex-col"]}>
          <div class={["md:grid md:grid-cols-3 md:gap-6 p-2"]}>
            <div class={["md:col-span-12"]}>
              {employment ? (
                <AssessmentHistorySection employment={employment} />
              ) : (
                <NEmpty
                  description="Employment detail is not available."
                  class={["mt-4"]}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
});
