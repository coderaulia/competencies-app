import {
  NCard,
  NCol,
  NForm,
  NFormItemGi,
  NGrid,
  NGridItem,
  NIcon,
  NRow,
  NSpin,
  NStatistic,
  NSwitch,
} from "naive-ui";
import {
  defineComponent,
  onBeforeMount,
  ref,
  reactive,
  computed,
  onBeforeUnmount,
  toRefs,
  watch,
} from "vue";
import VueECharts from "@/components/Chart/Echart";
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
import { fetchData } from "@/composables/useApiService";
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

export type EmployeeAssessmentScore = {
  assessmentID: number;
  assessmentScheduleId: number;
  assessmentCompetencyId: number;
  assessmentMinimumScore: number;
  assessmentAssessmentScore: number;
  assessmentGap: number;
  assessmentForCompetencyName: string;
  assessmentGapRatio: number;
};
export type EmployeeParticipationOverview = {
  employeId: number;
  employeProfileId: number;
  employeUserId: number;
  employeProfileName: string;
  employeParentProfileName: string;
  employePositionName: string;
  employeGapAverageAssessmentScore: number;
  employeGapAssessmentScore:
    | Array<UnwrapCamelToSnake<EmployeeAssessmentScore>>
    | []
    | undefined;
};
export type EmployeeAssessmentSchedule = {
  assesmentScheduleId: number;
  assessmentScheduleTitle: string;
  assessmentScheduleDescription: string;
  assessmentScheduleYearPeriod: string;
  assessmentSchedulePhasePeriod: string;
  employmentTotal: number;
  employmentParticipated: number;
  employmentNotParticipated: number;
  employmentParticipationRatio: number;
  employmentAverageGapScorePerDepartment: number;
  employmentParticipatedOverview:
    | Array<UnwrapCamelToSnake<EmployeeParticipationOverview>>
    | []
    | undefined;
};
export type DepartementDetailOverview = {
  assessmentBySchedules:
    | Array<UnwrapCamelToSnake<EmployeeAssessmentSchedule>>
    | []
    | undefined;
};

export type DepartmentDetails = {
  departmentId: number;
  departmentName: string;
  employeeCompetenceRatio: number;
  department_overview: UnwrapCamelToSnake<DepartementDetailOverview>;
};
export type ResponseData = {
  data: UnwrapCamelToSnake<DepartmentDetails>;
};

export type CamelToSnake<
  T extends string,
  P extends string = ""
> = string extends T
  ? string
  : T extends `${infer C0}${infer R}`
  ? CamelToSnake<
      R,
      `${P}${C0 extends Lowercase<C0> ? "" : "_"}${Lowercase<C0>}`
    >
  : P;
export type UnwrapCamelToSnake<T> = {
  [Key in keyof T as CamelToSnake<Extract<Key, string>>]: T[Key];
};

export default defineComponent({
  name: "CompetentEmployeeVisualization",
  props: {
    departmentId: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    // chart e-charts configuration ges here !

    const chartRefs = ref<InstanceType<typeof VueECharts> | null>(null);
    const config = ref(null);
    const loading = ref(false);

    const { departmentId } = toRefs(props);

    const department = ref<ResponseData["data"] | null>(null);
    const queryStringArray = reactive({
      showParticipation: true,
    });
    const showParticipation_ = computed({
      get: () => queryStringArray.showParticipation,
      set: (value) => {
        queryStringArray["showParticipation"] = value;
      },
    });
    const computedPath_ = computed(() => {
      return (
        "/utilities/analytics/competence_employe/by_department/" +
        departmentId.value +
        `?showParticipation=${showParticipation_.value}`
      );
    });

    const showSpinner = ref(false);

    const init = async () => {
      showSpinner.value = true;
      const getData = await fetchData("GET", {
        path: computedPath_.value,
      });

      const { data, statusCode, error, isFetching } = await getData.json();

      if (statusCode.value === 200) {
        const SCHEDULE_INDEX_: number = 0;
        showSpinner.value = false;
        const response =
          typeof data.value === "string" ? JSON.parse(data.value) : data.value;
        department.value = response.data satisfies ResponseData["data"];
        const categories = buildCategories(response.data);
        const xAxis = categories?.map((e) => e?.map((o) => o.nameVal))[
          SCHEDULE_INDEX_
        ];
        const yAxis = categories?.map((e) => e?.map((o) => o.avgVal))[
          SCHEDULE_INDEX_
        ];
        const configs = defineConfig();
        (configs.xAxis = [
          {
            type: "category",
            data: [...(xAxis as string[])],
            axisLabel: { interval: 0, rotate: 45 },
          },
        ]),
          (configs.yAxis = [
            {
              type: "value",
            },
          ]);
        configs.series = [
          {
            name: "Employee AVG Competenies Assesment Value",
            type: "bar",
            data: [...(yAxis as number[])],
            markPoint: {
              data: [
                { type: "max", name: "Max" },
                { type: "min", name: "Min" },
              ],
            },
            markLine: {
              data: [{ type: "average", name: "Avg" }],
            },
          },
        ];
        // @ts-ignore
        config.value = { ...configs };
      }
    };

    function buildCategories(response: ResponseData["data"]) {
      return response.department_overview.assessment_by_schedules?.map((el) => {
        return el.employment_participated_overview?.map((o) => {
          return {
            nameVal: o.employe_profile_name,
            avgVal: o.employe_gap_average_assessment_score,
          };
        });
      });
    }

    onBeforeMount(async () => {
      await init();
    });

    onBeforeUnmount(() => {
      department.value = null;
    });

    watch(
      () => showParticipation_.value,
      async (nVal) => {
        await init();
      }
    );

    return {
      department,
      showSpinner,
      showParticipation_,
      chartRefs,
      config,
      loading,
    };
  },
  render() {
    const { department, showSpinner } = this;
    return (
      <NCard class={["flex felxx-col gap-x-5"]}>
        <NForm labelPlacement="top">
          <NGrid cols={1}>
            <NFormItemGi
              label="Show All Participated Employees"
              class={["flex flex-col gap-y-5"]}
            >
              <NSwitch v-model:value={this.showParticipation_} />
            </NFormItemGi>
          </NGrid>
        </NForm>
        <NGrid cols={1} yGap={"30px"}>
          {department?.department_overview.assessment_by_schedules?.map(
            (schedule) => {
              return (
                <NGridItem span={1} class={["w-full"]}>
                  <NCard class={["w-full"]}>
                    <div class={["w-full flex flex-col gap-y-5"]}>
                      <div
                        class={[
                          "w-full flex flex-row justify-start gap-x-3 items-center",
                        ]}
                      >
                        <span class={["text-3xl font-semibold"]}>
                          {" "}
                          {schedule.assessment_schedule_title} -{" "}
                          {schedule.assessment_schedule_description} (
                          {schedule.assessment_schedule_phase_period}{" "}
                          {schedule.assessment_schedule_year_period})
                        </span>
                      </div>
                      <div class={["w-full"]}>
                        <NGrid cols={4}>
                          <NGridItem
                            span={1}
                            class={["w-full flex flex-col items-start"]}
                          >
                            <span class={["text-xl font-semibold"]}>
                              Employees
                            </span>
                            <span
                              class={["text-5xl font-semibold text-orange-500"]}
                            >
                              {schedule.employment_total}
                            </span>
                          </NGridItem>
                          <NGridItem
                            span={1}
                            class={["w-full flex flex-col items-start"]}
                          >
                            <span class={["text-xl font-semibold"]}>
                              Participated
                            </span>
                            <span
                              class={["text-5xl font-semibold text-orange-500"]}
                            >
                              {schedule.employment_participated}
                            </span>
                          </NGridItem>
                          <NGridItem
                            span={1}
                            class={["w-full flex flex-col items-start"]}
                          >
                            <span class={["text-xl font-semibold"]}>
                              Non Participant
                            </span>
                            <span
                              class={["text-5xl font-semibold text-orange-500"]}
                            >
                              {schedule.employment_not_participated}
                            </span>
                          </NGridItem>
                          <NGridItem
                            span={1}
                            class={["w-full flex flex-col items-start"]}
                          >
                            <span class={["text-xl font-semibold"]}>
                              Average Employment Score / Department
                            </span>
                            <span
                              class={["text-5xl font-semibold text-orange-500"]}
                            >
                              {schedule.employment_average_gap_score_per_department +
                                " %"}
                            </span>
                          </NGridItem>
                        </NGrid>
                      </div>
                    </div>
                  </NCard>
                </NGridItem>
              );
            }
          )}
        </NGrid>
        <NCard class={["flex flex-row justify-items-center w-full h-full"]}>
          <VueECharts
            initOptions={{
              renderer: "svg",
            }}
            option={this.config as unknown as ECBasicOption}
            ref="chartRefs"
            autoresize
            class={["flex w-full h-[500px]"]}
            loading={this.loading}
          />
        </NCard>
      </NCard>
    );
  },
});
