import { computed, defineComponent, inject } from "vue";
import type { UserResource } from "@/models/User";
import { UserInjectionKey } from "@/layouts/Dashboard/Default";
import { NEmpty } from "naive-ui";
export default defineComponent({
  name: "MyDataEmploymentHierarchiesIndex",
  setup() {
    const user = inject<UserResource>(UserInjectionKey);
    const employment = computed(() => user?.profile?.employment);
    return {
      user,
      employment,
    };
  },
  render() {
    const parentEmployment = this.user?.profile?.employment?.parent;

    return (
      <div
        class={[
          "bg-white p-2 rounded-lg shadow-lg shadow-green-100 border border-green-400",
        ]}
      >
        <div class="md:grid md:grid-cols-3 md:gap-6 p-2">
          <div class="md:col-span-1">
            <div class="px-4 sm:px-0">
              <h3 class="text-lg font-medium leading-6 text-black">
                Detail of Hierarchical Employment Report
              </h3>
              <p class="mt-1 text-sm text-black">
                This information is displayed publicly that contains the
                resource detail about Hierarchical employment report context of
                selected resource yet.
              </p>
            </div>
          </div>
          <div class="mt-5 md:col-span-2 md:mt-0">
            <div class="overflow-hidden shadow sm:rounded-md">
              <div class="overflow-hidden bg-transparent shadow sm:rounded-lg">
                <div class="px-4 py-5 sm:px-6">
                  <h3 class="text-lg font-medium leading-6 text-gray-900">
                    Superrior Employment Report Detail Information
                  </h3>
                  <p class="mt-1 max-w-2xl text-sm text-gray-500">
                    Superrior Employment Reporting.
                  </p>
                </div>
                <div class="border-t border-gray-200">
                  {parentEmployment ? (
                    <dl>
                      <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-green-500">
                          Report to Email Address
                        </dt>
                        <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                          {parentEmployment.profile?.user?.email ?? "-"}
                        </dd>
                      </div>
                      <div class="bg-green-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-green-500">
                          Report to Fullname
                        </dt>
                        <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                          {parentEmployment.profile?.profile_fullname ?? "-"}
                        </dd>
                      </div>
                      <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-green-500">
                          Report to Gender
                        </dt>
                        <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                          {parentEmployment.profile?.profile_gender ?? "-"}
                        </dd>
                      </div>
                      <div class="bg-green-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-green-500">
                          Report to Nationality
                        </dt>
                        <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                          {parentEmployment.profile?.profile_nationality ?? "-"}
                        </dd>
                      </div>
                    </dl>
                  ) : (
                    <div class={["px-4 py-6"]}>
                      <NEmpty description="No reporting line is assigned yet." />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
});
