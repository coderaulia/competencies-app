import type { EmploymentResource } from "@/models/Employment";
import { NSelect, type DataTableColumns, NForm } from "naive-ui";
import {
  ColumnCreator,
  type BuildInDatatableKeys,
} from "./DatatableColumnCreator";
import {
  defineComponent,
  toRefs,
  type PropType,
  ref,
  onMounted,
  computed,
  watch,
  reactive,
  getCurrentInstance,
} from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import FormModal from "@/components/Modal/FormModal";
import useApiService from "@/composables/useApiService";
import useBasicNotification from "@/composables/notifications/useBasicNotification";
import type DatatableServerSide from "@/components/Datatable/DatatableServerSide";
export type EmploymentDatatable = EmploymentResource & BuildInDatatableKeys;
export const createEmploymentDatatableColumn =
  (): DataTableColumns<EmploymentDatatable> =>
    ColumnCreator([
      {
        title: "FULLNAME",
        key: "profile.profile_fullname",
        minWidth: 200,
        maxWidth: 300,
      },
      {
        title: "EMAIL",
        key: "profile.user.email",
        minWidth: 200,
        maxWidth: 300,
      },
      {
        title: "STATUS",
        key: "employment_status",
        width: 150,
      },
      {
        title: "POSITION",
        key: "position.position_name",
        width: 200,
      },
      {
        title: "DETAIL",
        type: "expand",
        expandable: (rowData) => true,
        renderExpand: (rowData) => {
          return <RenderExpandableColumn data={rowData} />;
        },
        width: 100,
      },
    ]);

export const RenderExpandableColumn = defineComponent({
  name: "RenderExpandableColumn",
  props: {
    data: {
      type: Object as PropType<EmploymentDatatable>,
      required: true,
    },
  },
  setup(props, ctx) {
    const { data } = toRefs(props);
    const { fullPath } = useRoute();
    const path = fullPath.split("/").pop()?.toString();
    // console.log(path, fullPath);
    return {
      data,
      path,
      fullPath,
    };
  },
  render() {
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
                Detail of Related Employee's Profile, Account's and Employments
                Record
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
                        {this.data?.profile?.user?.name}
                      </dd>
                    </div>
                    <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt class="text-sm font-medium text-green-500">
                        Email Address
                      </dt>
                      <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                        {this.data?.profile?.user?.email}
                      </dd>
                    </div>
                    <div class="bg-green-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt class="text-sm font-medium text-green-500">
                        Fullname
                      </dt>
                      <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                        {this.data?.profile?.profile_fullname}
                      </dd>
                    </div>
                    {/* <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt class="text-sm font-medium text-green-500">Gender</dt>
                      <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                        {this.data?.profile?.profile_gender}
                      </dd>
                    </div>
                    <div class="bg-green-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt class="text-sm font-medium text-green-500">
                        Marriage Status
                      </dt>
                      <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                        {this.data?.profile?.profile_marital_status}
                      </dd>
                    </div>
                    <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt class="text-sm font-medium text-green-500">
                        Place of birth
                      </dt>
                      <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                        {this.data?.profile?.profile_place_of_birth}
                      </dd>
                    </div>
                    <div class="bg-green-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt class="text-sm font-medium text-green-500">
                        Date of Birth
                      </dt>
                      <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                        {new Date(
                          this.data?.profile?.profile_date_of_birth
                        ).toUTCString()}
                      </dd>
                    </div>
                    <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt class="text-sm font-medium text-green-500">
                        Nationality
                      </dt>
                      <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                        {this.data?.profile?.profile_nationality}
                      </dd>
                    </div>
                    <div class="bg-green-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt class="text-sm font-medium text-green-500">
                        Religion
                      </dt>
                      <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                        {this.data?.profile?.profile_religion}
                      </dd>
                    </div> */}
                    <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt class="text-sm font-medium text-green-500">
                        Hiring Date
                      </dt>
                      <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                        {new Date(
                          this.data?.employment_hiring_date as string
                        ).toUTCString()}
                      </dd>
                    </div>
                    <div class="bg-green-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt class="text-sm font-medium text-green-500">
                        End Date
                      </dt>
                      <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                        {this.data?.employment_end_date
                          ? new Date(
                              this.data?.employment_end_date as string
                            ).toUTCString()
                          : "-"}
                      </dd>
                    </div>
                    <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt class="text-sm font-medium text-green-500">
                        Group Type
                      </dt>
                      <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                        {this.data?.employment_group_type_name}
                      </dd>
                    </div>
                    <div class="bg-green-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt class="text-sm font-medium text-green-500">
                        Group Age
                      </dt>
                      <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                        {this.data?.employment_group_age}
                      </dd>
                    </div>
                    <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt class="text-sm font-medium text-green-500">
                        Employment Status
                      </dt>
                      <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                        {this.data?.employment_status}
                      </dd>
                    </div>
                    <div class="bg-green-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt class="text-sm font-medium text-green-500">
                        Employment Position Status
                      </dt>
                      <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                        {this.data?.employment_position_status}
                      </dd>
                    </div>
                    <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt class="text-sm font-medium text-green-500">
                        Employment WSR
                      </dt>
                      <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                        {this.data?.employment_wsr}
                      </dd>
                    </div>
                    <div class="bg-green-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt class="text-sm font-medium text-green-500">
                        Company
                      </dt>
                      <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                        {this.data?.company?.company_name}
                      </dd>
                    </div>
                    <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt class="text-sm font-medium text-green-500">
                        Directorate
                      </dt>
                      <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                        {this.data?.directorat?.directorat_name}
                      </dd>
                    </div>
                    <div class="bg-green-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt class="text-sm font-medium text-green-500">
                        Personel Area
                      </dt>
                      <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                        {this.data?.personel_area?.personel_area_text}
                      </dd>
                    </div>
                    <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt class="text-sm font-medium text-green-500">
                        Personel Sub Area
                      </dt>
                      <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                        {this.data?.personel_sub_area?.personel_sub_area_text}
                      </dd>
                    </div>
                    <div class="bg-green-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt class="text-sm font-medium text-green-500">
                        Plant Area
                      </dt>
                      <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                        {this.data?.plant_area?.plant_area_name}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="hidden sm:block p-2" aria-hidden="true">
          <div class="py-5">
            <div class="border-t border-green-200"></div>
          </div>
        </div>

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
                  {/* { JSON.stringify(this.data?.parent, null, 4)} */}
                  <dl>
                    <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt class="text-sm font-medium text-green-500">
                        Report to Email Address
                      </dt>
                      <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                        {this.data?.parent?.profile?.user?.email}
                      </dd>
                    </div>
                    <div class="bg-green-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt class="text-sm font-medium text-green-500">
                        Report to Fullname
                      </dt>
                      <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                        {this.data?.parent?.profile?.profile_fullname}
                      </dd>
                    </div>
                    <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt class="text-sm font-medium text-green-500">
                        Report to Gender
                      </dt>
                      <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                        {this.data?.parent?.profile?.profile_gender}
                      </dd>
                    </div>
                    <div class="bg-green-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt class="text-sm font-medium text-green-500">
                        Report to Nationality
                      </dt>
                      <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0">
                        {this.data?.parent?.profile?.profile_nationality}
                      </dd>
                    </div>
                    <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt class="text-sm font-medium text-green-500">Action</dt>
                      <dd class="mt-1 text-sm text-green-900 sm:col-span-2 sm:mt-0 flex flex-row">
                        <RenderActionModal v-model:employment={this.data} />
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
              <div class="overflow-hidden bg-transparent shadow sm:rounded-lg mt-2">
                <div class="px-4 py-5 sm:px-6">
                  <h3 class="text-lg font-medium leading-6 text-gray-900">
                    Subordinates Employment Report Detail Information
                  </h3>
                  <p class="mt-1 max-w-2xl text-sm text-gray-500">
                    Subordinates Employment Reporting.
                  </p>
                </div>
                <div class="border-t border-gray-200">
                  {/* { JSON.stringify(this.data?.children, null, 4)} */}
                  <dl>
                    <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt class="text-sm font-medium text-gray-500">
                        Subordinates Report Froms
                      </dt>
                      <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                        <ul
                          role="list"
                          class="divide-y divide-gray-200 rounded-md border border-gray-200"
                        >
                          {this.data?.children?.length ? (
                            this.data?.children?.map((element) => (
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
                                    {element?.profile?.user?.email}
                                  </span>
                                  {/* <span class="ml-2 w-0 flex-1 truncate">
                                    {element.profile.profile_fullname}
                                  </span> */}
                                </div>
                                <div class="ml-4 flex-shrink-0">
                                  {/* <a href="#" class="font-medium text-indigo-600 hover:text-indigo-500">Download</a> */}
                                  <RouterLink
                                    // @ts-ignore
                                    to={`employment/${element?.id}/assessment`}
                                    class="font-medium text-indigo-600 hover:text-indigo-500"
                                  >
                                    See detail assessment
                                  </RouterLink>
                                </div>
                              </li>
                            ))
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

        <div class="hidden sm:block p-2" aria-hidden="true">
          <div class="py-5">
            <div class="border-t border-green-200"></div>
          </div>
        </div>

        <div class="md:grid md:grid-cols-3 md:gap-6 p-2">
          <div class="md:col-span-1">
            <div class="px-4 sm:px-0">
              <h3 class="text-lg font-medium leading-6 text-black">
                Employment Assessment Record Summary
              </h3>
              <p class="mt-1 text-sm text-black">
                This information is displayed publicly that contains the
                resource detail about Employment Assessment report context of
                selected resource yet.
              </p>
            </div>
          </div>
          <div class="mt-5 md:col-span-2 md:mt-0">
            <div class="overflow-hidden shadow sm:rounded-md">
              <div class="overflow-hidden bg-transparent shadow sm:rounded-lg mt-2">
                <div class="px-4 py-5 sm:px-6">
                  <h3 class="text-lg font-medium leading-6 text-gray-900">
                    Employment Record & Assessment Information
                  </h3>
                  <p class="mt-1 max-w-2xl text-sm text-gray-500">
                    Assessment & Certification Reporting.
                  </p>
                </div>
                <div class="border-t border-gray-200">
                  {/* { JSON.stringify(this.data?.children, null, 4)} */}
                  <dl>
                    <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt class="text-sm font-medium text-gray-500">
                        Employment Position Name & Record detail
                      </dt>
                      <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                        <ul
                          role="list"
                          class="divide-y divide-gray-200 rounded-md border border-gray-200"
                        >
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
                                {this.data?.profile?.profile_fullname}
                              </span>
                            </div>
                            <div class="ml-4 flex-shrink-0">
                              <RouterLink
                                to={`employment/${this.data?.id}/assessment`}
                                class="font-medium text-indigo-600 hover:text-indigo-500"
                              >
                                See detail assessment
                              </RouterLink>
                              {/* <a href="#" class="font-medium text-indigo-600 hover:text-indigo-500">See detail</a> */}
                            </div>
                          </li>
                        </ul>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* <div class="hidden sm:block p-2" aria-hidden="true">
                <div class="py-5">
                  <div class="border-t border-green-200"></div>
                </div>
              </div>
    
              <div class="md:grid md:grid-cols-3 md:gap-6 p-2">
                <div class="md:col-span-1">
                  <div class="px-4 sm:px-0">
                    <h3 class="text-lg font-medium leading-6 text-black">Detail of Related Position</h3>
                    <p class="mt-1 text-sm text-black">This information is displayed publicly that contains the resource detail about related position context of selected score yet.</p>
                  </div>
                </div>
                <div class="mt-5 md:col-span-2 md:mt-0">
                  <div class="overflow-hidden shadow sm:rounded-md">
                    <div class="bg-white px-4 py-5 sm:p-6">
                      <div class="grid grid-cols-6 gap-6">
                        <div class="col-span-6 sm:col-span-3">
                        <pre>
                          {
                            JSON.stringify(this.data?.position, null, 4)
                          }
                        </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div> */}
      </div>
    );
  },
});

export const RenderActionModal = defineComponent({
  name: "RenderableActionModal",
  props: {
    employment: Object as PropType<EmploymentResource>,
  },
  setup(props, { emit }) {
    const { employment } = toRefs(props);

    const instance = getCurrentInstance();

    const computedEmploymentProps = computed(() => employment.value);

    const options = ref<[]>([]);
    // @ts-ignore
    const selectedOption = ref<unknown>(
      computedEmploymentProps.value?.parent?.id
    );
    const selectIsLoading = ref<boolean>(false);

    const selectedOption_ = computed({
      get: () => selectedOption.value,
      set: (value) => (selectedOption.value = value),
    });

    const showAddModal = ref<boolean>(false);
    const showChangeModal = ref<boolean>(false);
    const showSpinner = ref<boolean>(false);
    const parentEmploymentsOptions = ref<EmploymentResource[] | []>([]);

    const initEmploymentOptions = async () => {
      const { data, statusCode } = await useApiService(
        "employments_autocomplete_options"
      )
        .get()
        .json();

      if (statusCode.value === 200) {
        parentEmploymentsOptions.value = data.value
          .data as EmploymentResource[];
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

    watch(
      () => parentEmploymentsOptions.value,
      (n, o) => {
        patchOptions(n as EmploymentResource[]);
      }
    );

    watch(
      () => selectedOption_.value,
      (n, o) => {
        // @ts-ignore
        formChangeParent.parent_employment_id = n;
      }
    );

    const formChangeParent = reactive({
      // @ts-ignore
      employment_id: computed(() => employment.value?.id).value,
      parent_employment_id: null,
    });

    const notification = useBasicNotification();

    const handleChangeParentSubmited = async () => {
      showSpinner.value = true;
      const { data, statusCode, isFinished } = await useApiService(
        "/utilities/change_parent_employment"
      )
        .post(formChangeParent)
        .json();

      if (statusCode.value === 200) {
        // @ts-ignore
        const RootDatatableComponentInstanceRefs =
          instance?.parent?.parent?.parent?.parent?.parent?.parent?.parent
            ?.parent;

        // Reload datatable to update current data instance.
        // @ts-ignore
        RootDatatableComponentInstanceRefs?.proxy?.reload();
        notification.notify(
          "success",
          "success",
          "Change parent superrior successfully",
          ""
        );
        showSpinner.value = false;
        showChangeModal.value = false;
      }
    };

    const handleChangeParentCanceled = () => {
      // console.log(formChangeParent, );
      // @ts-ignore
      selectedOption_.value = computedEmploymentProps.value?.parent?.id;
    };

    const handleChangeParentClosed = () => {
      console.log(formChangeParent);
      // @ts-ignore
      selectedOption_.value = computedEmploymentProps.value?.parent?.id;
    };

    onMounted(() => {
      initEmploymentOptions();
      // @ts-ignore
      formChangeParent.parent_employment_id =
        computedEmploymentProps.value?.parent?.id;
    });

    return {
      employment,
      showAddModal,
      showChangeModal,
      showSpinner,
      parentEmploymentsOptions,
      options,
      selectedOption,
      selectedOption_,
      selectIsLoading,
      handleChangeParentSubmited,
      handleChangeParentCanceled,
      handleChangeParentClosed,
      computedEmploymentProps,
    };
  },
  render() {
    return (
      <div class={["flex flex-row"]}>
        {this.employment?.parent === null ? (
          <button
            class={[
              "inline-flex w-full justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm",
            ]}
            onClick={() => (this.showAddModal = !this.showAddModal)}
          >
            Add Superriors
          </button>
        ) : (
          ""
        )}
        <button
          class={[
            "inline-flex w-full justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm",
          ]}
          onClick={() => (this.showChangeModal = !this.showChangeModal)}
        >
          Change Superriors
        </button>

        <FormModal
          ref="employmentFormCardRefs"
          title={"Add new superrior to employye"}
          spin={this.showSpinner}
          v-model:show={this.showAddModal}
          onSubmit={() => {
            this.showAddModal = !this.showAddModal;
          }}
          onCancel={() => {
            this.showAddModal = !this.showAddModal;
          }}
          onClose={() => {
            this.showAddModal = !this.showAddModal;
          }}
        >
          <div class={["flex w-full text-gray-900"]}>TODO.</div>
        </FormModal>
        <FormModal
          ref="employmentFormCardRefs"
          title={"Change current superrior to employye"}
          spin={this.showSpinner}
          class={["w-full"]}
          v-model:show={this.showChangeModal}
          onSubmit={() => {
            this.handleChangeParentSubmited();
          }}
          onCancel={() => {
            this.handleChangeParentCanceled();
            this.showChangeModal = !this.showChangeModal;
          }}
          onClose={() => {
            this.handleChangeParentClosed();
            this.showChangeModal = !this.showChangeModal;
          }}
        >
          <div class={["flex w-full text-gray-900"]}>
            <NForm class={["w-full h-full"]}>
              <NSelect
                class={["w-full"]}
                v-model:value={this.selectedOption_}
                size="large"
                clearable
                remote
                filterable
                options={this.options}
                loading={this.selectIsLoading}
                onClear={() => {
                  // @ts-ignore
                  this.selectedOption_ =
                    this.computedEmploymentProps?.parent.id;
                }}
              ></NSelect>
            </NForm>
          </div>
        </FormModal>
      </div>
    );
  },
});
