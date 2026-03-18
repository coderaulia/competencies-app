import { defineComponent, inject, onMounted } from "vue";
import type { UserResource } from "@/models/User";
import { UserInjectionKey } from "@/layouts/Dashboard/Default";
export default defineComponent({
  name: "MyDataEmploymentDetailIndex",
  setup() {
    const user = inject<UserResource>(UserInjectionKey);
    return {
      user,
    };
  },
  render() {
    return (
      <div class={["flex flex-col px-6"]}>
        <div
          class={[
            "bg-white p-2 rounded-lg shadow-lg shadow-green-100 border border-green-400",
          ]}
        >
          <div class="md:grid md:grid-cols-3 md:gap-6 p-2">
            <div class="md:col-span-1">
              <div class="px-4 sm:px-0">
                <h3 class="text-lg font-medium leading-6 text-black">
                  Detail of Related Employee's Profile, Account's and
                  Employments Record
                </h3>
                <p class="mt-1 text-sm text-black">
                  This information is displayed publicly that contains the
                  resource detail about related employee profile context of
                  selected resource yet.
                </p>
              </div>
            </div>
            <div class="mt-5 md:col-span-2 md:mt-0">
              <div class="overflow-hidden shadow sm:rounded-md">
                <div class="overflow-hidden bg-white shadow sm:rounded-lg">
                  <div class="px-4 py-5 sm:px-6">
                    <h3 class="text-lg font-medium leading-6 text-green-900">
                      Employee Profile, Account's and Record Detail
                    </h3>
                    <p class="mt-1 max-w-2xl text-sm text-green-500">
                      Account's and Personal details
                    </p>
                  </div>
                  <div class="border-t border-green-200">
                    <dl>
                      <div class="bg-green-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-green-500">
                          Current Position
                        </dt>
                        <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                          {
                            this.user?.profile?.employment?.position
                              ?.position_name
                          }
                        </dd>
                      </div>
                      <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-green-500">
                          Hiring Date
                        </dt>
                        <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                          {new Date(
                            this.user?.profile?.employment
                              ?.employment_hiring_date as string
                          ).toUTCString()}
                        </dd>
                      </div>
                      <div class="bg-green-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-green-500">
                          End Date
                        </dt>
                        <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                          {this.user?.profile?.employment?.employment_end_date
                            ? new Date(
                                this.user?.profile?.employment
                                  ?.employment_end_date as string
                              ).toUTCString()
                            : "-"}
                        </dd>
                      </div>
                      <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-green-500">
                          Group Type
                        </dt>
                        <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                          {
                            this.user?.profile?.employment
                              ?.employment_group_type_name
                          }
                        </dd>
                      </div>
                      <div class="bg-green-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-green-500">
                          Group Age
                        </dt>
                        <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                          {this.user?.profile?.employment?.employment_group_age}
                        </dd>
                      </div>
                      <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-green-500">
                          Employment Status
                        </dt>
                        <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                          {this.user?.profile?.employment?.employment_status}
                        </dd>
                      </div>
                      <div class="bg-green-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-green-500">
                          Employment Position Status
                        </dt>
                        <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                          {
                            this.user?.profile?.employment
                              ?.employment_position_status
                          }
                        </dd>
                      </div>
                      <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-green-500">
                          Employment WSR
                        </dt>
                        <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                          {this.user?.profile?.employment?.employment_wsr}
                        </dd>
                      </div>
                      <div class="bg-green-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-green-500">
                          Company
                        </dt>
                        <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                          {
                            this.user?.profile?.employment?.company
                              ?.company_name
                          }
                        </dd>
                      </div>
                      <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-green-500">
                          Directorate
                        </dt>
                        <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                          {
                            this.user?.profile?.employment?.directorat
                              ?.directorat_name
                          }
                        </dd>
                      </div>
                      <div class="bg-green-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-green-500">
                          Personel Area
                        </dt>
                        <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                          {
                            this.user?.profile?.employment?.personel_area
                              ?.personel_area_text
                          }
                        </dd>
                      </div>
                      <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-green-500">
                          Personel Sub Area
                        </dt>
                        <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                          {
                            this.user?.profile?.employment?.personel_sub_area
                              ?.personel_sub_area_text
                          }
                        </dd>
                      </div>
                      <div class="bg-green-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-green-500">
                          Plant Area
                        </dt>
                        <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                          {
                            this.user?.profile?.employment?.plant_area
                              ?.plant_area_name
                          }
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
});
