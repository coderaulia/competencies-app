import VueECharts from "@/components/Chart/Echart";
import useApiService from "@/composables/useApiService";
import { defineComponent, ref, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
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
import {
  getRadarConfig,
  setIndicator,
  setSeries,
} from "@/components/Chart/Echart/configs/radar";
import type { EChartsOption } from "echarts";
import { NCard } from "naive-ui";
import type { ECBasicOption } from "echarts/types/dist/shared";

use([
  BarChart,
  LineChart,
  PieChart,
  MapChart,
  RadarChart,
  ScatterChart,
  EffectScatterChart,
  LinesChart,
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
export type IAssessmentRecord = {
  competency_name: string;
  minimum_score: number;
  assessment_score: number;
  gap_score: number;
  ratio: number;
};
export type IAssessmentChart = {
  schedule_id: number;
  assessment_records: IAssessmentRecord[];
};
export type ISuccessData = {
  employe_id: number;
  employe_name: string;
  employe_position: string;
  employe_report_to: string;
  employe_asssessment_chart_data: IAssessmentChart[];
};
export type SuccessResponse = {
  data: ISuccessData;
};

export default defineComponent({
  name: "EmployeeRecordsShowDetail",
  components: {
    VueECharts,
  },
  props: {
    employeID: {
      required: true,
    },
  },
  setup() {
    const route = useRoute();
    const chartRefs = ref<InstanceType<typeof VueECharts> | null>(null);
    const config = ref(null);
    const loading = ref(false);
    const init = async (id: any) => {
      loading.value = true;
      const { data, statusCode } = await useApiService(
        "/utilities/analytics/employes/" + id
      )
        .get()
        .json();
      if (statusCode.value === 200 && data.value !== null) {
        const { data: employement } = data.value as SuccessResponse;
        const indicator = buildIndicator(
          employement.employe_asssessment_chart_data
        );
        const series = buildSeries(employement.employe_asssessment_chart_data);
        // buildIndicator(employement.employe_asssessment_chart_data);
        const options_ = getRadarConfig({
          text: employement.employe_name as string,
          subtext: employement.employe_position as string,
        });
        setIndicator(indicator);
        setSeries(series);
        // @ts-ignore
        config.value = options_;
        loading.value = false;
      }
    };

    onMounted(async () => {
      await init(route.params.employeeID);
    });

    function buildIndicator(data: IAssessmentChart[] | []) {
      return data
        ? data.map((item) => {
            const records = Object.entries(item.assessment_records)
              .map((entry) => {
                return { ...entry[1] };
              })
              .map((indicator) => {
                return {
                  name: indicator.competency_name,
                  max: 5,
                  ratio: indicator.ratio,
                };
              });
            return {
              indicator: [...records],
              shape: "circle",
              splitNumber: 5,
              axisName: {
                formatter: function (value: any, indicator: any) {
                  return `
              ${value}

              (${(indicator.ratio * 100).toFixed(2)}% Gap Passed)
              `;
                },
                color: "#000000",
              },
              splitLine: {
                lineStyle: {
                  color: [
                    "rgba(238, 197, 102, 0.1)",
                    "rgba(238, 197, 102, 0.2)",
                    "rgba(238, 197, 102, 0.4)",
                    "rgba(238, 197, 102, 0.6)",
                    "rgba(238, 197, 102, 0.8)",
                    "rgba(238, 197, 102, 1)",
                  ].reverse(),
                },
              },
              splitArea: {
                show: true,
              },
              axisLine: {
                lineStyle: {
                  color: "#F00",
                },
              },
            };
          })
        : [];
    }

    function buildSeries(data: IAssessmentChart[] | []) {
      return data
        ? data.map((item) => {
            const series = Object.entries(item.assessment_records).map(
              (entry) => {
                return {
                  assessment_score: entry[1].assessment_score,
                  minimum_score: entry[1].minimum_score,
                };
              }
            );

            return {
              name: "Minimum Required Score vs Actual Score Achieved",
              type: "radar",
              radarIndex: 0,
              data: [
                {
                  name: "Min req. score",
                  value: series.map(({ minimum_score }) => minimum_score),
                  itemStyle: {
                    color: "#fc0318",
                  },
                  areaStyle: {
                    opacity: 0.2,
                  },
                  label: {
                    show: false,
                  },
                  tooltip: {
                    trigger: "item",
                    position: ["50%", "50%"],
                  },
                },
                {
                  name: "Actual Score",
                  value: series.map(({ assessment_score }) => assessment_score),
                  itemStyle: {
                    color: "#0328fc",
                  },
                  areaStyle: {
                    opacity: 0.1,
                  },
                  lineStyle: {
                    type: "dashed",
                  },
                  symbol: "rect",
                  symbolSize: 12,
                  label: {
                    show: true,
                    formatter: function (params: { value: any }) {
                      return params.value;
                    },
                  },
                  tooltip: {
                    trigger: "item",
                    position: ["50%", "50%"],
                  },
                },
              ],
            };
          })
        : [];
    }

    watch(
      () => route.params.employeeID,
      async (nVal) => {
        if (nVal) {
          await init(nVal);
        }
      },
      {
        immediate: true,
      }
    );

    return {
      chartRefs,
      config,
      loading,
    };
  },
  render() {
    return (
      <div class={["flex flex-row w-full min-h-[1000px]"]}>
        <NCard class={["flex flex-row justify-items-center w-full h-full"]}>
          <VueECharts
            initOptions={{
              renderer: "svg",
            }}
            option={this.config as unknown as ECBasicOption}
            ref="chartRefs"
            autoresize
            class={["flex w-full h-[1000px]"]}
            loading={this.loading}
          />
        </NCard>
      </div>
    );
  },
});
