import { defineComponent, inject } from "vue";
import type { UserResource } from "@/models/User";
import { UserInjectionKey } from "@/layouts/Dashboard/Default";
import { formatUtcDate } from "@/utilities/date-display";
export default defineComponent({
  name: "MyDataProfileIndex",
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
                  Detail of Related Employee's Profile, and Account
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
                          Username
                        </dt>
                        <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                          {this.user?.name}
                        </dd>
                      </div>
                      <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-green-500">
                          Email Address
                        </dt>
                        <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                          {this.user?.email}
                        </dd>
                      </div>
                      <div class="bg-green-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-green-500">
                          Fullname
                        </dt>
                        <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                          {this.user?.profile?.profile_fullname}
                        </dd>
                      </div>
                      <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-green-500">
                          Gender
                        </dt>
                        <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                          {this.user?.profile?.profile_gender}
                        </dd>
                      </div>
                      <div class="bg-green-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-green-500">
                          Marriage Status
                        </dt>
                        <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                          {this.user?.profile?.profile_marital_status}
                        </dd>
                      </div>
                      <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-green-500">
                          Place of birth
                        </dt>
                        <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                          {this.user?.profile?.profile_place_of_birth}
                        </dd>
                      </div>
                      <div class="bg-green-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-green-500">
                          Date of Birth
                        </dt>
                        <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                          {formatUtcDate(this.user?.profile?.profile_date_of_birth)}
                        </dd>
                      </div>
                      <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-green-500">
                          Nationality
                        </dt>
                        <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                          {this.user?.profile?.profile_nationality}
                        </dd>
                      </div>
                      <div class="bg-green-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-green-500">
                          Religion
                        </dt>
                        <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                          {this.user?.profile?.profile_religion}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="md:grid md:grid-cols-3 md:gap-6 p-2">
            <div class="md:col-span-1">
              <div class="px-4 sm:px-0">
                <h3 class="text-lg font-medium leading-6 text-black">
                  User Account Last Activity Details
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
                      Employee Account Last Activity
                    </h3>
                    <p class="mt-1 max-w-2xl text-sm text-green-500">
                      Last Activity Details
                    </p>
                  </div>
                  <div class="border-t border-green-200">
                    <dl>
                      <div class="bg-green-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-green-500">
                          Last logged in
                        </dt>
                        <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                          {this.user?.last_logged_in_at}
                        </dd>
                      </div>
                      <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-green-500">
                          Logged in browser
                        </dt>
                        <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                          {this.user?.last_logged_in_browser}
                        </dd>
                      </div>
                      <div class="bg-green-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-green-500">
                          Logged in device
                        </dt>
                        <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                          {this.user?.last_logged_in_device}
                        </dd>
                      </div>
                      <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-green-500">
                          User agent
                        </dt>
                        <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                          {this.user?.last_logged_in_user_agent}
                        </dd>
                      </div>
                      <div class="bg-green-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-green-500">
                          Platform
                        </dt>
                        <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                          {this.user?.last_logged_in_platform}
                        </dd>
                      </div>
                      <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt class="text-sm font-medium text-green-500">Host</dt>
                        <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                          {this.user?.last_logged_in_host}
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
