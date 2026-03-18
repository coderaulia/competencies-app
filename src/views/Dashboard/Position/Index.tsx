import VueECharts from "@/components/Chart/Echart";
import defineBarPosition, {
  defineSeries,
} from "@/components/Chart/Echart/configs/bar-position";
import DatatableServerSide from "@/components/Datatable/DatatableServerSide";
import PositionForm from "@/components/Forms/PositionForm";
import FormModal from "@/components/Modal/FormModal";
import PageStatisticHeader from "@/components/Utils/PageStatisticHeader";
import useApiService, { fetchData } from "@/composables/useApiService";
import useFormModalProcessor from "@/composables/useFormModalProcessor";
import usePageLoader from "@/composables/usePageLoader";
import { createPositionDatatableColumn } from "@/utilities/datatable-utils/Positions";
import { CheckmarkCircle } from "@vicons/ionicons5";
import type { ECBasicOption } from "echarts/types/dist/shared";
import { CanvasRenderer, SVGRenderer } from "echarts/renderers";
import { use } from "echarts/core";
import {
  BarChart,
  LineChart,
  PieChart,
  MapChart,
  RadarChart,
  ScatterChart,
  EffectScatterChart,
  LinesChart,
  GaugeChart,
} from "echarts/charts";
import {
  GridComponent,
  PolarComponent,
  GeoComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  VisualMapComponent,
  DatasetComponent,
  ToolboxComponent,
  DataZoomComponent,
} from "echarts/components";
import defineConfig from "@/components/Chart/Echart/configs/bar-customized";
use([
  BarChart,
  LineChart,
  PieChart,
  MapChart,
  RadarChart,
  ScatterChart,
  EffectScatterChart,
  LinesChart,
  GaugeChart,
  GridComponent,
  PolarComponent,
  GeoComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  VisualMapComponent,
  DatasetComponent,
  CanvasRenderer,
  SVGRenderer,
  ToolboxComponent,
  DataZoomComponent,
]);
import { NCard, NIcon, NTag } from "naive-ui";
import {
  defineComponent,
  provide,
  ref,
  type Ref,
  reactive,
  computed,
  onBeforeMount,
  onMounted,
  watch,
} from "vue";
export type PositionFromData = {
  position_name: Ref<string>;
};
export default defineComponent({
  name: "PositionIndex",
  setup() {
    const { loadingStart, loadingFinish } = usePageLoader();

    onBeforeMount(() => {
      loadingStart();
    });

    onMounted(() => {
      setTimeout(() => {
        loadingFinish();
      }, 500);
    });

    const backend = ref<string>("positions");
    provide("backend", backend);
    const formData = reactive<PositionFromData>({
      position_name: ref<string>(""),
    });

    const positionFormRefs = ref<InstanceType<typeof PositionForm> | null>(
      null
    );
    const positionFromCardRefs = ref<InstanceType<typeof FormModal> | null>(
      null
    );
    const datatableRefs = ref<InstanceType<typeof DatatableServerSide> | null>(
      null
    );

    const {
      showFormModal,
      openModal,
      closeModal,
      setupPostAction,
      setupUpdateAction,
      processPostRequest,
      processPatchRequest,
      showSpinner,
      startSpinner,
      stopSpinner,
      formAction,
      flushFormData,
      formElement,
    } = useFormModalProcessor(backend.value);

    const formActionHandler = async () => {
      if (formAction.method === "POST")
        await processPostRequest(
          {
            position_name: formData.position_name,
          },
          () => {
            datatableRefs.value?.reload();
            flushFormData(formData);
          },
          () => {}
        );

      if (formAction.method === "PATCH")
        await processPatchRequest(
          {
            position_name: formData.position_name,
          },
          () => {
            datatableRefs.value?.reload();
            flushFormData(formData);
          },
          () => {}
        );
    };

    const filters = reactive({
      name: "",
    });
    const filterState = reactive([
      {
        name: "Has Competencies",
        scopeName: "hasCompetencyThroughLevels",
        isActive: false,
      },
      {
        name: "Has Not Competencies",
        scopeName: "doesntHaveCompetencyThroughLevels",
        isActive: false,
      },
    ]);

    const filterHasCompetencies = (e: Event | MouseEvent) => {
      e.preventDefault();
      resetFilters(e);
      filterState[0].isActive = true;
      filters.name = filterState[0].scopeName;
    };
    const filterHasntCompetencies = (e: Event | MouseEvent) => {
      e.preventDefault();
      resetFilters(e);
      filterState[1].isActive = true;
      filters.name = filterState[1].scopeName;
    };
    // const resetFilters = () => void;
    const resetFilters = (e?: Event | MouseEvent) => {
      // filters.operator = "";
      filterState.forEach((state) => {
        state.isActive = false;
      });
      (
        datatableRefs.value as unknown as InstanceType<
          typeof DatatableServerSide
        >
      ).reload();
    };

    const getActiveFilters = computed(() =>
      filterState.filter((state) => state.isActive === true)
    );

    // @ts-ignore
    const customPath = ref<string | null>(null);
    const performFilter = async (path: string) => {
      // @ts-ignore
      // @ts-ignore
      (
        datatableRefs.value as unknown as InstanceType<
          typeof DatatableServerSide
        >
      ).startLoadingIndicator();
      try {
        const { data } = await useApiService(path)
          .post({ scopes: [filters] })
          .json();
        // console.log(filters, data.value);
        // @ts-ignore
        (
          datatableRefs.value as unknown as InstanceType<
            typeof DatatableServerSide
          >
        ).transformHttpResponse(data);
        // @ts-ignore
        (
          datatableRefs.value as unknown as InstanceType<
            typeof DatatableServerSide
          >
        ).stopLoadingIndicator();
      } catch (error) {
        // @ts-ignore
        (
          datatableRefs.value as unknown as InstanceType<
            typeof DatatableServerSide
          >
        ).stopLoadingIndicator();
      }
    };

    watch(
      () => filterState,
      (newVal, oldVal) => {
        // @ts-ignore
        customPath.value = (
          datatableRefs.value as unknown as InstanceType<
            typeof DatatableServerSide
          >
        ).fetchBaseSearchUrl;
        newVal.forEach((e) => {
          if (e.isActive === true) {
            performFilter(customPath.value as string);
            console.log(customPath.value);
          }
        });
      },
      { deep: true }
    );

    const onSearchPageChangeHandler = (page: number) => {
      console.log({ page }, customPath.value);
      customPath.value = customPath.value + `&page=${page}`;
      performFilter(customPath.value as string);
    };
    const onSearchPageSizeChangeHandler = (pageSize: number) => {
      console.log({ pageSize }, customPath.value);
      // customPath =
    };

    const chartOptions = ref(null);

    const loading = ref(false);

    const initChart = async () => {
      loading.value = true;
      const getData = await fetchData("GET", {
        path: "/utilities/analytics/positions/statistics",
      });

      const { data, statusCode } = await getData.json();

      if (statusCode.value === 200) {
        loading.value = false;
        const response =
          typeof data.value === "string" ? JSON.parse(data.value) : data.value;
        // console.log({response});
        const seriesName = "State Of Positions";
        const seriesData: never[] | undefined = [
          // @ts-ignore
          {
            value: response.data.hasCompetency.count,
            name: "Position Has Competencies",
          },
          // @ts-ignore
          {
            value: response.data.hasNotCompetency.count,
            name: "Position Doesnt Has Competencies",
          },
        ];
        const configs = defineBarPosition();
        (configs.series = [defineSeries(seriesName, seriesData)]),
          // @ts-ignore
          (chartOptions.value = { ...configs });
      } else {
        loading.value = false;
      }
    };

    onMounted(async () => {
      await initChart();
    });

    return {
      columns: createPositionDatatableColumn(),
      backend,
      formData,
      showFormModal,
      openModal,
      closeModal,
      positionFormRefs,
      positionFromCardRefs,
      datatableRefs,
      formAction,
      setupPostAction,
      setupUpdateAction,
      processPostRequest,
      processPatchRequest,
      formActionHandler,
      flushFormData,
      showSpinner,
      startSpinner,
      stopSpinner,
      formElement,
      filterHasCompetencies,
      filterHasntCompetencies,
      resetFilters,
      getActiveFilters,
      performFilter,
      customPath,
      onSearchPageChangeHandler,
      onSearchPageSizeChangeHandler,
      chartOptions,
      loading,
    };
  },
  render() {
    const {
      columns,
      backend,
      formData,
      showFormModal,
      closeModal,
      formAction,
      setupPostAction,
      setupUpdateAction,
      formActionHandler,
      showSpinner,
      formElement,
      filterHasCompetencies,
      filterHasntCompetencies,
      resetFilters,
      getActiveFilters,
      performFilter,
      customPath,
      onSearchPageChangeHandler,
      onSearchPageSizeChangeHandler,
    } = this;

    const title = computed(() => {
      return formElement.title;
    }).value;

    return (
      <div class={["flex flex-col px-6"]}>
        <PageStatisticHeader
          onClick:buttonCreate={() => {
            setupPostAction();
          }}
        />

        <div>
          <NCard class={["flex flex-row justify-items-center w-full h-full"]}>
            <VueECharts
              initOptions={{
                renderer: "svg",
              }}
              theme={"dark"}
              option={this.chartOptions as unknown as ECBasicOption}
              ref="chartRefs"
              autoresize
              class={["flex w-full h-[500px]"]}
              loading={this.loading}
            />
          </NCard>
        </div>

        <div
          id="filter-button-groups"
          class={["-mx-3 my-3 flex flex-row items-center justify-start"]}
        >
          <button
            onClick={(e) => filterHasCompetencies(e)}
            class={[
              "inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm",
            ]}
          >
            Filter Has Competencies
          </button>
          <button
            onClick={(e) => filterHasntCompetencies(e)}
            class={[
              "inline-flex w-full justify-center rounded-md border border-transparent bg-orange-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm",
            ]}
          >
            Filter Hasnt Competencies
          </button>
          <button
            onClick={(e) => resetFilters(e)}
            class={[
              "inline-flex w-full justify-center rounded-md border border-transparent bg-white px-4 py-2 text-base font-medium text-gray-900 shadow-sm hover:bg-gray-200 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm",
            ]}
          >
            Clear filters
          </button>
        </div>
        <div
          id="active-filter-tags"
          class={[
            "-mx-3 my-3 px-3 flex flex-row w-full space-x-3 items-center justify-start",
          ]}
        >
          {getActiveFilters &&
            getActiveFilters.map((filter) => {
              return (
                <NTag
                  round
                  bordered
                  type="success"
                  v-slots={{
                    icon: () => <NIcon component={CheckmarkCircle} />,
                  }}
                >
                  {filter.name}
                </NTag>
              );
            })}
        </div>

        <DatatableServerSide
          ref="datatableRefs"
          path={backend}
          columns={columns}
          onTriggerUpdate={(id) => {
            (async () => {
              const { data, isFinished, statusCode } = await useApiService(
                `/${backend}/${id}`
              )
                .get()
                .json();
              setupUpdateAction(id, data, () => {
                formData.position_name = data.value.data.position_name;
              });
            })();
          }}
          onUpdatePaginationPage={(page) => onSearchPageChangeHandler(page)}
          onUpdatePaginationPageSize={(pageSize) =>
            onSearchPageSizeChangeHandler(pageSize)
          }
        />

        <FormModal
          ref="positionFormCardRefs"
          title={title}
          spin={showSpinner}
          v-model:show={showFormModal}
          onSubmit={formActionHandler}
          onCancel={() => {
            closeModal();
            formData.position_name = "";
          }}
        >
          <PositionForm
            ref="positionFormRefs"
            v-model:method={formAction.method}
            v-model:name={formData.position_name}
          />
        </FormModal>
      </div>
    );
  },
});
