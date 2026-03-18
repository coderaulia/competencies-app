import { defineComponent, inject, onMounted } from "vue";
import type { UserResource } from "@/models/User";
import { UserInjectionKey } from "@/layouts/Dashboard/Default";
import { RouterLink } from "vue-router";
export default defineComponent({
  name: "MyDataSubOrdinatesRecordsIndex",
  setup() {
    const user = inject<UserResource>(UserInjectionKey);
    return {
      user,
    };
  },
  render() {
    return (
      <div>
        <div class={["flex flex-col"]}>
          <div class="md:grid md:grid-cols-3 md:gap-6 p-2">
            <div class="mt-5 md:col-span-3 md:mt-0">
              <div class="overflow-hidden shadow sm:rounded-md">
                <div class="overflow-hidden bg-white shadow sm:rounded-lg">
                  <div class="px-4 py-5 sm:px-6">
                    <h3 class="text-lg font-medium leading-6 text-green-900">
                      {this.user?.profile?.profile_fullname} 's sub ordinate
                      report
                    </h3>
                    {/* <p class="mt-1 max-w-2xl text-sm text-green-500">
                      List of all of employyes that are belong's to your employment (give their report to you)
                    </p> */}
                  </div>
                </div>
              </div>
              <div class="overflow-hidden bg-transparent shadow sm:rounded-lg mt-2">
                {/* <div class="px-4 py-5 sm:px-6">
                  <h3 class="text-lg font-medium leading-6 text-gray-900">
                    Employment Report Detail Information
                  </h3>
                  <p class="mt-1 max-w-2xl text-sm text-gray-500">
                    Employment Reporting.
                  </p>
                </div> */}
                <div class="border-t border-gray-200">
                  <dl>
                    <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt class="text-sm font-medium text-gray-500">
                        Report Froms
                      </dt>
                      <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                        <ul
                          role="list"
                          class="divide-y divide-gray-200 rounded-md border border-gray-200"
                        >
                          {this.user?.profile?.employment?.children?.length ? (
                            this.user?.profile?.employment?.children?.map(
                              (element) => (
                                <li class="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
                                  <div class="flex w-0 flex-1 items-center">
                                    <svg
                                      class="h-5 w-5 flex-shrink-0 text-gray-400"
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                      aria-hidden="true"
                                    >
                                      <path
                                        fill-rule="evenodd"
                                        d="M15.621 4.379a3 3 0 00-4.242 0l-7 7a3 3 0 004.241 4.243h.001l.497-.5a.75.75 0 011.064 1.057l-.498.501-.002.002a4.5 4.5 0 01-6.364-6.364l7-7a4.5 4.5 0 016.368 6.36l-3.455 3.553A2.625 2.625 0 119.52 9.52l3.45-3.451a.75.75 0 111.061 1.06l-3.45 3.451a1.125 1.125 0 001.587 1.595l3.454-3.553a3 3 0 000-4.242z"
                                        clip-rule="evenodd"
                                      />
                                    </svg>
                                    <span class="ml-2 w-0 flex-1 truncate">
                                      {element?.profile?.profile_fullname}
                                    </span>
                                  </div>
                                  <div class="ml-4 flex-shrink-0">
                                    <RouterLink
                                      // @ts-ignore
                                      to={`/dashboard/employment/${element?.id}/assessment`}
                                      class="font-medium text-indigo-600 hover:text-indigo-500"
                                    >
                                      See detail assessment
                                    </RouterLink>
                                  </div>
                                </li>
                              )
                            )
                          ) : (
                            <li class="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
                              <div class="flex w-0 flex-1 items-center">
                                {/* <svg class="h-5 w-5 flex-shrink-0 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                      <path fill-rule="evenodd" d="M15.621 4.379a3 3 0 00-4.242 0l-7 7a3 3 0 004.241 4.243h.001l.497-.5a.75.75 0 011.064 1.057l-.498.501-.002.002a4.5 4.5 0 01-6.364-6.364l7-7a4.5 4.5 0 016.368 6.36l-3.455 3.553A2.625 2.625 0 119.52 9.52l3.45-3.451a.75.75 0 111.061 1.06l-3.45 3.451a1.125 1.125 0 001.587 1.595l3.454-3.553a3 3 0 000-4.242z" clip-rule="evenodd" />
                                    </svg> */}
                                <span class="ml-2 w-0 flex-1 truncate">
                                  {" No attached children reports "}
                                </span>
                              </div>
                              <div class="ml-4 flex-shrink-0">
                                {/* <a href="#" class="font-medium text-indigo-600 hover:text-indigo-500">Download</a> */}
                              </div>
                            </li>
                          )}
                        </ul>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
});
