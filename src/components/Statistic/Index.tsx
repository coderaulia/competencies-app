import useApiService from "@/composables/useApiService";
import useFileSaver from "@/composables/useFileSaver";
import useReactivePagination, {
  type PaginationMeta,
} from "@/composables/useReactivePagination";
import type { EmploymentResource } from "@/models/Employment";
// import { EmploymentCollections, type EmploymentemployeHasAssessements } from "@/models/Employment";
import { useAuthStore } from "@/stores/auth";
import AssessmentDetail from "@/views/Dashboard/Employment/Records/Assessment/AssessmentDetail";
import {
  NDataTable,
  NTable,
  NTag,
  NModal,
  type DataTableColumns,
  NAlert,
  NCollapse,
  NCollapseItem,
  NEmpty,
} from "naive-ui";
import type { RowData } from "naive-ui/es/data-table/src/interface";
import {
  defineComponent,
  computed,
  onMounted,
  type ComputedRef,
  ref,
  type PropType,
  toRef,
  type Ref,
} from "vue";
import DatatableServerSide from "../Datatable/DatatableServerSide";
import { Button } from "../Functional/Button";
import DetailModal from "../Modal/DetailModal";
export default defineComponent({
  name: "StatisticIndex",
  setup() {
    const authStore = useAuthStore();
    // @ts-ignore
    const roles: ComputedRef<string> = computed(() => authStore.roles[0]);

    function renderer() {
      switch (roles.value) {
        case "superadmin":
          return <SuperadminSection />;
        case "employee":
          return <EmployeeSection />;
        default:
          return;
      }
    }

    onMounted(() => console.log(roles.value));
    return {
      renderer,
    };
  },
  render() {
    return <div class={["flex flex-col"]}>{this.renderer()}</div>;
  },
});

const SuperadminSection = defineComponent({
  name: "SuperadminSection",
  setup() {
    const BaseEndpointOne = ref<string>(
      "/utilities/dashboard/superadmin/employments_has_assessments"
    );
    const BaseEndpointTwo = ref<string>(
      "/utilities/dashboard/superadmin/employments_has_not_assessments"
    );
    const BaseExportEmploymentAssessment = ref<string>(
      "/utilities/dashboard/exports/superadmin/employments_has_assessments"
    );

    const { reactivePaginationProps } = useReactivePagination("");
    const { setPaginationMeta, pageSize } = reactivePaginationProps;
    const employeHasAssessements = ref<RowData[]>([]);
    const defineEmployeHasAssessements: DataTableColumns<EmploymentResource> = [
      {
        title: "ID",
        key: "id",
        width: 90,
      },
      {
        title: "Employee Name",
        key: "profile.profile_fullname",
      },
      {
        title: "Position Name",
        key: "position.position_name",
      },
      {
        title: "Report To",
        key: "parent.profile.profile_fullname",
      },
      {
        title: "Detail",
        key: "id",
        width: 110,
        render(rowData, rowIndex) {
          return <RenderModalDetailInspection employment={rowData} />;
        },
      },
    ];
    const isDataTabelOneLoading = ref<boolean>(false);
    const fetchUrlOne = ref(BaseEndpointOne.value + "?limit=" + pageSize);

    const initDatatableOne = async () => {
      isDataTabelOneLoading.value = true;
      const { statusCode, data } = await useApiService(fetchUrlOne)
        .get()
        .json();

      if (statusCode.value === 200) {
        employeHasAssessements.value = data.value.data;
        // @ts-ignore
        let paginationMeta: PaginationMeta = {};
        for (const [key, val] of Object.entries(data.value)) {
          if (key !== "data") {
            // @ts-ignore
            paginationMeta[key] = val;
          }
        }
        setPaginationMeta(paginationMeta as PaginationMeta);
        isDataTabelOneLoading.value = false;
      }
    };
    initDatatableOne();

    const onUpdatePageDatatableOneHandler = (page: number) => {
      fetchUrlOne.value =
        BaseEndpointOne.value + "?page=" + page + "&limit=" + pageSize;
      initDatatableOne();
    };
    const onUpdatePageSizeDatatableOneHandler = (perPageLimit: number) => {
      fetchUrlOne.value =
        BaseEndpointOne.value +
        "?page=" +
        reactivePaginationProps.page +
        "&limit=" +
        perPageLimit;
      initDatatableOne();
    };

    const { reactivePaginationProps: reactivePaginationPropsTwo } =
      useReactivePagination("");
    const { setPaginationMeta: setPaginationMetaTwo, pageSize: pageSizeTwo } =
      reactivePaginationPropsTwo;
    const employeDoesntHasAssessements = ref<RowData[]>([]);
    const defineEmployeDoesntHasAssessements: DataTableColumns<EmploymentResource> =
      [
        {
          title: "ID",
          key: "id",
          width: 90,
        },
        {
          title: "Employee Name",
          key: "profile.profile_fullname",
        },
        {
          title: "Position Name",
          key: "position.position_name",
        },
        {
          title: "Report To",
          key: "parent.profile.profile_fullname",
        },
      ];
    const isDataTabelTwoLoading = ref<boolean>(false);
    const fetchUrlTwo = ref(BaseEndpointTwo.value + "?limit=" + pageSize);

    const initDatatableTwo = async () => {
      isDataTabelTwoLoading.value = true;
      const { statusCode, data } = await useApiService(fetchUrlTwo)
        .get()
        .json();

      if (statusCode.value === 200) {
        employeDoesntHasAssessements.value = data.value.data;
        // @ts-ignore
        let paginationMetaTwo: PaginationMeta = {};
        for (const [key, val] of Object.entries(data.value)) {
          if (key !== "data") {
            // @ts-ignore
            paginationMetaTwo[key] = val;
          }
        }
        setPaginationMetaTwo(paginationMetaTwo as PaginationMeta);
        isDataTabelTwoLoading.value = false;
      }
    };
    initDatatableTwo();

    const onUpdatePageDatatableTwoHandler = (page: number) => {
      fetchUrlTwo.value =
        BaseEndpointTwo.value + "?page=" + page + "&limit=" + pageSize;
      initDatatableTwo();
    };
    const onUpdatePageSizeDatatableTwoHandler = (perPageLimit: number) => {
      fetchUrlTwo.value =
        BaseEndpointTwo.value +
        "?page=" +
        reactivePaginationPropsTwo.page +
        "&limit=" +
        perPageLimit;
      initDatatableTwo();
    };
    const exportEmploymentAssesmentStatisticExcel = async () => {
      try {
        const { data, statusCode, error } = await useApiService(
          BaseExportEmploymentAssessment.value
        )
          .get()
          .blob();
        if (error) {
          console.log(error.value);
        }
        if (statusCode.value === 200) {
          useFileSaver(data.value as Blob, "export_sub_empl_report.xlsx");
        }
      } catch (error) {
        console.log(error);
      }
    };
    return {
      employeHasAssessements,
      employeDoesntHasAssessements,
      reactivePaginationProps,
      reactivePaginationPropsTwo,
      defineEmployeHasAssessements,
      defineEmployeDoesntHasAssessements,
      isDataTabelOneLoading,
      isDataTabelTwoLoading,
      onUpdatePageDatatableOneHandler,
      onUpdatePageSizeDatatableOneHandler,
      onUpdatePageDatatableTwoHandler,
      onUpdatePageSizeDatatableTwoHandler,
      exportEmploymentAssesmentStatisticExcel,
    };
  },
  render() {
    return (
      <div class={["flex flex-col w-full"]}>
        <div class={["flex flex-row space-x-3 mt-8 w-full"]}>
          <div class={["w-1/2 space-y-3"]}>
            <NAlert type="success" class={[""]}>
              <div
                class={[
                  "font-semibold text-md flex flex-row justify-between items-center",
                ]}
              >
                <div>
                  List of employees that already have assessment records
                </div>
                <Button
                  type="green"
                  onClick={() => this.exportEmploymentAssesmentStatisticExcel()}
                  v-slots={{
                    default: () => "Export Data",
                  }}
                />
              </div>
            </NAlert>

            <NDataTable
              remote
              striped
              loading={this.isDataTabelOneLoading}
              columns={this.defineEmployeHasAssessements}
              data={this.employeHasAssessements}
              pagination={this.reactivePaginationProps}
              onUpdatePage={(page) => {
                this.onUpdatePageDatatableOneHandler(page);
              }}
              onUpdatePageSize={(pageSize: number) => {
                this.onUpdatePageSizeDatatableOneHandler(pageSize);
              }}
            />
          </div>
          <div class={["w-1/2 space-y-3"]}>
            <NAlert type="warning">
              <div class={["font-semibold text-md"]}>
                List of employees that doesn't have assessment records
              </div>
            </NAlert>
            <NDataTable
              remote
              striped
              loading={this.isDataTabelTwoLoading}
              columns={this.defineEmployeDoesntHasAssessements}
              data={this.employeDoesntHasAssessements}
              pagination={this.reactivePaginationPropsTwo}
              onUpdatePage={(page) => {
                this.onUpdatePageDatatableTwoHandler(page);
              }}
              onUpdatePageSize={(pageSize: number) => {
                this.onUpdatePageSizeDatatableTwoHandler(pageSize);
              }}
            />
          </div>
        </div>
      </div>
    );
  },
});

const EmployeeSection = defineComponent({
  name: "EmployeeSection",
  setup() {
    const BaseEndpointOne = ref<string>(
      "/utilities/dashboard/employee/sub_employments_has_assessments"
    );
    const BaseEndpointTwo = ref<string>(
      "/utilities/dashboard/employee/sub_employments_has_not_assessments"
    );
    const BaseExportSubEmploymentAssessment = ref<string>(
      "/utilities/dashboard/exports/employee/sub_employments_has_assessments"
    );

    const { reactivePaginationProps } = useReactivePagination("");
    const { setPaginationMeta, pageSize } = reactivePaginationProps;
    const employeHasAssessements = ref<RowData[]>([]);
    const defineEmployeHasAssessements: DataTableColumns<EmploymentResource> = [
      {
        title: "ID",
        key: "id",
        width: 90,
      },
      {
        title: "Employee Name",
        key: "profile.profile_fullname",
      },
      {
        title: "Position Name",
        key: "position.position_name",
      },
      {
        title: "Report To",
        key: "parent.profile.profile_fullname",
      },
      {
        title: "Detail",
        key: "id",
        width: 110,
        render(rowData, rowIndex) {
          return <RenderModalDetailInspection employment={rowData} />;
        },
      },
    ];
    const isDataTabelOneLoading = ref<boolean>(false);
    const fetchUrlOne = ref(BaseEndpointOne.value + "?limit=" + pageSize);

    const initDatatableOne = async () => {
      isDataTabelOneLoading.value = true;
      const { statusCode, data } = await useApiService(fetchUrlOne)
        .get()
        .json();

      if (statusCode.value === 200) {
        employeHasAssessements.value = data.value.data;
        // @ts-ignore
        let paginationMeta: PaginationMeta = {};
        for (const [key, val] of Object.entries(data.value)) {
          if (key !== "data") {
            // @ts-ignore
            paginationMeta[key] = val;
          }
        }
        setPaginationMeta(paginationMeta as PaginationMeta);
        isDataTabelOneLoading.value = false;
      }
    };
    initDatatableOne();

    const onUpdatePageDatatableOneHandler = (page: number) => {
      fetchUrlOne.value =
        BaseEndpointOne.value + "?page=" + page + "&limit=" + pageSize;
      initDatatableOne();
    };
    const onUpdatePageSizeDatatableOneHandler = (perPageLimit: number) => {
      fetchUrlOne.value =
        BaseEndpointOne.value +
        "?page=" +
        reactivePaginationProps.page +
        "&limit=" +
        perPageLimit;
      initDatatableOne();
    };

    const { reactivePaginationProps: reactivePaginationPropsTwo } =
      useReactivePagination("");
    const { setPaginationMeta: setPaginationMetaTwo, pageSize: pageSizeTwo } =
      reactivePaginationPropsTwo;
    const employeDoesntHasAssessements = ref<RowData[]>([]);
    const defineEmployeDoesntHasAssessements: DataTableColumns<EmploymentResource> =
      [
        {
          title: "ID",
          key: "id",
          width: 90,
        },
        {
          title: "Employee Name",
          key: "profile.profile_fullname",
        },
        {
          title: "Position Name",
          key: "position.position_name",
        },
        {
          title: "Report To",
          key: "parent.profile.profile_fullname",
        },
      ];
    const isDataTabelTwoLoading = ref<boolean>(false);
    const fetchUrlTwo = ref(BaseEndpointTwo.value + "?limit=" + pageSize);

    const initDatatableTwo = async () => {
      isDataTabelTwoLoading.value = true;
      const { statusCode, data } = await useApiService(fetchUrlTwo)
        .get()
        .json();

      if (statusCode.value === 200) {
        employeDoesntHasAssessements.value = data.value.data;
        // @ts-ignore
        let paginationMetaTwo: PaginationMeta = {};
        for (const [key, val] of Object.entries(data.value)) {
          if (key !== "data") {
            // @ts-ignore
            paginationMetaTwo[key] = val;
          }
        }
        setPaginationMetaTwo(paginationMetaTwo as PaginationMeta);
        isDataTabelTwoLoading.value = false;
      }
    };
    initDatatableTwo();

    const onUpdatePageDatatableTwoHandler = (page: number) => {
      fetchUrlTwo.value =
        BaseEndpointTwo.value + "?page=" + page + "&limit=" + pageSize;
      initDatatableTwo();
    };
    const onUpdatePageSizeDatatableTwoHandler = (perPageLimit: number) => {
      fetchUrlTwo.value =
        BaseEndpointTwo.value +
        "?page=" +
        reactivePaginationPropsTwo.page +
        "&limit=" +
        perPageLimit;
      initDatatableTwo();
    };

    const exportSubEmploymentAssesmentStatisticExcel = async () => {
      try {
        const { data, statusCode, error } = await useApiService(
          BaseExportSubEmploymentAssessment.value
        )
          .get()
          .blob();
        if (error) {
          console.log(error.value);
        }
        if (statusCode.value === 200) {
          useFileSaver(data.value as Blob, "export_sub_empl_report.xlsx");
        }
      } catch (error) {
        console.log(error);
      }
    };

    return {
      employeHasAssessements,
      employeDoesntHasAssessements,
      reactivePaginationProps,
      reactivePaginationPropsTwo,
      defineEmployeHasAssessements,
      defineEmployeDoesntHasAssessements,
      isDataTabelOneLoading,
      isDataTabelTwoLoading,
      onUpdatePageDatatableOneHandler,
      onUpdatePageSizeDatatableOneHandler,
      onUpdatePageDatatableTwoHandler,
      onUpdatePageSizeDatatableTwoHandler,
      exportSubEmploymentAssesmentStatisticExcel,
    };
  },
  render() {
    return (
      <div class={["flex flex-col w-full"]}>
        <div class={["flex flex-row space-x-3 mt-8 w-full"]}>
          <div class={["w-1/2 space-y-3"]}>
            <NAlert type="success" class={[""]}>
              <div
                class={[
                  "font-semibold text-md flex flex-row justify-between items-center",
                ]}
              >
                <div>
                  List of employees that already have assessment records
                </div>
                <Button
                  type="green"
                  onClick={() =>
                    this.exportSubEmploymentAssesmentStatisticExcel()
                  }
                  v-slots={{
                    default: () => "Export Data",
                  }}
                />
              </div>
            </NAlert>

            <NDataTable
              remote
              striped
              loading={this.isDataTabelOneLoading}
              columns={this.defineEmployeHasAssessements}
              data={this.employeHasAssessements}
              pagination={this.reactivePaginationProps}
              onUpdatePage={(page) => {
                this.onUpdatePageDatatableOneHandler(page);
              }}
              onUpdatePageSize={(pageSize: number) => {
                this.onUpdatePageSizeDatatableOneHandler(pageSize);
              }}
            />
          </div>
          <div class={["w-1/2 space-y-3"]}>
            <NAlert type="warning">
              <div class={["font-semibold text-md"]}>
                List of employees that doesn't have assessment records
              </div>
            </NAlert>
            <NDataTable
              remote
              striped
              loading={this.isDataTabelTwoLoading}
              columns={this.defineEmployeDoesntHasAssessements}
              data={this.employeDoesntHasAssessements}
              pagination={this.reactivePaginationPropsTwo}
              onUpdatePage={(page) => {
                this.onUpdatePageDatatableTwoHandler(page);
              }}
              onUpdatePageSize={(pageSize: number) => {
                this.onUpdatePageSizeDatatableTwoHandler(pageSize);
              }}
            />
          </div>
        </div>
      </div>
    );
  },
});

const RenderModalDetailInspection = defineComponent({
  name: "RenderModalDetailInspection",
  props: {
    employment: {
      required: true,
      type: Object as PropType<EmploymentResource>,
    },
  },
  setup(props, {}) {
    const isOpen = ref<boolean>(false);

    onMounted(() => {
      console.log(props.employment);
    });
    return {
      isOpen,
      employment: toRef(props, "employment"),
    };
  },
  render() {
    return (
      <div>
        <button
          onClick={() => {
            this.isOpen = !this.isOpen;
          }}
          class={[
            "inline-flex w-full justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none sm:w-auto sm:text-sm",
          ]}
        >
          Inspect
        </button>

        <DetailModal
          title={
            "Detail inspection for employee name : " +
            this.employment?.profile?.profile_fullname
          }
          spin={false}
          v-model:show={this.isOpen}
          onCancel={() => {
            this.isOpen = false;
          }}
          v-slots={{
            default: () => {
              return (
                <div class={["text-black"]}>
                  <div class={["flex flex-col"]}>
                    <div class={["md:grid md:grid-cols-3 md:gap-6 p-2"]}>
                      <div class={["md:col-span-12"]}>
                        {this.employment?.appliedAssessmentLogs?.length ? (
                          <NCollapse>
                            {this.employment?.appliedAssessmentLogs.map(
                              (item, index) => (
                                <NCollapseItem
                                  title={
                                    `Hystorycal Assements Logs Info : ${item.assessment_schedule_title} - ${item.assessment_schedule_year_period} - ${item.assessment_schedule_phase_period}` as string
                                  }
                                >
                                  <NTable striped>
                                    <thead>
                                      <tr>
                                        <th>Competency Name</th>
                                        <th>Min. Requirement Score</th>
                                        <th>Assessment Score</th>
                                        <th>Score Gap</th>
                                        <th>IDP Status</th>
                                        <th>Selected Training</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {this.employment?.position?.competency_by_level?.map(
                                        (element, index) => {
                                          // @ts-ignore
                                          const assessments =
                                            this.employment?.assessment_records?.filter(
                                              (el) =>
                                                el?.assessment_schedule_id ===
                                                item?.id
                                            );
                                          return (
                                            <tr
                                              key={
                                                element.competency_name as string
                                              }
                                            >
                                              <td>{element.competency_name}</td>
                                              <td>
                                                {
                                                  element.minimum_score_by_level
                                                    ?.minimum_score
                                                }
                                              </td>
                                              {/* @ts-ignore */}
                                              <td>
                                                {
                                                  // @ts-ignore 
                                                  assessments[index]
                                                    .assessment_score
                                                }
                                              </td>
                                              <td>
                                                {/* @ts-ignore */}
                                                {assessments[index]
                                                  ?.gap_score ?? (
                                                  <NTag
                                                    class={[""]}
                                                    type={"warning"}
                                                  >
                                                    Data Belum Tersedia / Belum
                                                    diisi
                                                  </NTag>
                                                )}
                                              </td>
                                              <td>
                                                {/* @ts-ignore */}
                                                {assessments[index] !==
                                                undefined ? (
                                                  assessments[index].idp_status
                                                ) : (
                                                  <NTag
                                                    class={[""]}
                                                    type={"warning"}
                                                  >
                                                    Data Belum Tersedia / Belum
                                                    diisi
                                                  </NTag>
                                                )}
                                              </td>
                                              <td>
                                                {/* @ts-ignore */}
                                                {(assessments[index] !==
                                                  undefined) &
                                                (assessments[index]
                                                  .training_id !==
                                                  null) ? (
                                                  this.employment?.position?.competency_by_level[
                                                    index
                                                  ]?.trainings.filter(
                                                    (e: TrainingResource) => {
                                                      // @ts-ignore
                                                      return (
                                                        e.id ===
                                                        assessments[index]
                                                          .training_id
                                                      );
                                                    }
                                                  )[0].training_title
                                                ) : (
                                                  <NTag
                                                    class={[""]}
                                                    type={"warning"}
                                                  >
                                                    Data Belum Tersedia / Belum
                                                    diisi
                                                  </NTag>
                                                )}
                                              </td>
                                            </tr>
                                          );
                                        }
                                      )}
                                    </tbody>
                                  </NTable>

                                  <NTable striped class={["w-full mt-2"]}>
                                    <thead>
                                      <tr>
                                        <th></th>
                                        <th>
                                          Individual Development Plan (IDP)
                                        </th>
                                        <th>IDP Status (Please Select)</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {
                                        // @ts-ignore
                                        (
                                          this.employment
                                            ?.periodical_general_assessments as []
                                        )
                                          .filter(
                                            (e) =>
                                              e.assessment_schedule_id ===
                                              item.id
                                          )
                                          .map((e) => {
                                            return (
                                              <tr>
                                                {/* @ts-ignore */}
                                                <td class={"w-64"}>
                                                  {e.parameters_name}
                                                </td>
                                                {/* @ts-ignore */}
                                                <td class={"w-64"}>
                                                  {e.parameters_value}
                                                </td>
                                                {/* @ts-ignore */}
                                                <td class={"w-64"}>
                                                  {e.status}
                                                </td>
                                              </tr>
                                            );
                                          })
                                      }
                                    </tbody>
                                  </NTable>
                                </NCollapseItem>
                              )
                            )}
                          </NCollapse>
                        ) : (
                          <NEmpty
                            description="No Assessment Record Founds here !"
                            class={["mt-4"]}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            },
          }}
        />
      </div>
    );
  },
});
