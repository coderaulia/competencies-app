import {
  defineComponent,
  onBeforeMount,
  onMounted,
  ref,
  type PropType,
  toRefs,
  watch,
} from "vue";
import { NAlert, NDataTable, type DataTableColumns } from "naive-ui";
import useReactivePagination, {
  type PaginationMeta,
} from "@/composables/useReactivePagination";
import useApiService from "@/composables/useApiService";
import type { EmploymentResource } from "@/models/Employment";
import type { RowData } from "naive-ui/es/data-table/src/interface";
import { RouterLink, type RouteLocationRaw, useRoute } from "vue-router";
export default defineComponent({
  name: "EmployeeAssessmentRecordIndex",
  setup() {
    const BaseEndpoint = ref<string>("/utilities/analytics/employes/");
    const { reactivePaginationProps } = useReactivePagination("");
    const { setPaginationMeta, pageSize } = reactivePaginationProps;
    const isDataTabelLoading = ref<boolean>(false);

    const loadingStart = () => (isDataTabelLoading.value = true);
    const loadingStop = () => (isDataTabelLoading.value = false);

    const DataTableData = ref<RowData[]>([]);
    const DataTableColumns: DataTableColumns<EmploymentResource> = [
      {
        title: "ID",
        key: "employe_id",
        width: 90,
      },
      {
        title: "Employee Name",
        key: "employe_name",
      },
      {
        title: "Employee Position",
        key: "employe_position",
      },
      {
        title: "Employee Organization",
        key: "employe_organization",
      },
      {
        title: "Employee Organization Func.",
        key: "employe_organization_function",
      },
      {
        title: "Report To",
        key: "employe_report_to",
      },
      {
        title: "Action",
        key: "employe_id",
        render: (rowData, rowIndex) => {
          return (
            <RenderActionLink
              to={{
                name: "EmployeAssessmentAnalyticsDetails",
                params: {
                  // @ts-ignore
                  employeeID: rowData?.employe_id,
                },
              }}
            />
          );
        },
      },
    ];

    const reactiveURL = ref(BaseEndpoint.value + "?limit=" + pageSize);
    const initDatatable = async () => {
      loadingStart();

      const { data, statusCode, error } = await useApiService(reactiveURL)
        .get()
        .json();
      if (statusCode.value === 200) {
        DataTableData.value = data.value.data;
        // @ts-ignore
        let paginationMeta: PaginationMeta = {};
        for (const [key, val] of Object.entries(data.value.meta)) {
          if (key !== "data") {
            // @ts-ignore
            paginationMeta[key] = val;
          }
        }
        setPaginationMeta(paginationMeta as PaginationMeta);
        loadingStop();
      }
      // @ts-ignore
      if (statusCode.value > 300 && statusCode.value <= 500) {
        loadingStop();
      }
    };

    function onUpdatePageDatatable(page: number) {
      reactiveURL.value =
        BaseEndpoint.value + "?page=" + page + "&limit=" + pageSize;
      initDatatable();
    }
    function onUpdatePageSizeDatatable(pageSize: number) {
      reactiveURL.value =
        BaseEndpoint.value +
        "?page=" +
        reactivePaginationProps.page +
        "&limit=" +
        pageSize;
      initDatatable();
    }

    // Hooks

    onBeforeMount(async () => {
      initDatatable();
    });

    return {
      reactivePaginationProps,
      DataTableColumns,
      DataTableData,
      isDataTabelLoading,
      onUpdatePageDatatable,
      onUpdatePageSizeDatatable,
    };
  },
  render() {
    const {
      reactivePaginationProps,
      DataTableColumns,
      DataTableData,
      isDataTabelLoading,
      onUpdatePageDatatable,
      onUpdatePageSizeDatatable,
    } = this;

    return (
      <div class={["flex flex-col w-full"]}>
        <div class={["flex flex-row space-x-3 mt-8 w-full"]}>
          <div class={["w-full"]}>
            <NAlert type="success">
              <div class={["font-semibold text-md"]}>
                List of employees that already doesnt have assessment records
              </div>
            </NAlert>
            <NDataTable
              remote
              striped
              loading={isDataTabelLoading}
              columns={DataTableColumns}
              data={DataTableData}
              pagination={reactivePaginationProps}
              onUpdatePage={onUpdatePageDatatable}
              onUpdatePageSize={onUpdatePageSizeDatatable}
            />
          </div>
        </div>
      </div>
    );
  },
});

export const RenderActionLink = defineComponent({
  name: "ActionLink",
  props: {
    to: {
      type: Object as PropType<RouteLocationRaw>,
      required: true,
    },
  },
  setup(props) {
    const { to } = toRefs(props);
    return {
      to,
    };
  },
  render() {
    const { to } = this;
    return (
      <div>
        <RouterLink
          to={to}
          class={[
            "flex flex-row items-center w-full h-auto bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-all ease-in-out duration-300",
          ]}
        >
          Show Chart
        </RouterLink>
      </div>
    );
  },
});
