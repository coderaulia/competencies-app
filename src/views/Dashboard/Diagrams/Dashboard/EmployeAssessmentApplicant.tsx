import { fetchData } from "@/composables/useApiService";
import type { ECBasicOption } from "echarts/types/dist/shared";
import { defineComponent, onBeforeMount, reactive } from "vue";
import { NAlert } from "naive-ui";
import VueECharts from "@/components/Chart/Echart";
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

export default defineComponent({
  name: "EmployeAssessmentApplicant",
  setup() {
    const dataset: echarts.EChartsOption["dataset"] = reactive({
      dimension: ["schedule_info", "applied_employee", "not_applied_employee"],
      source: [],
    });

    const baseConfigs = reactive({
      dataset: dataset,
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
          label: {
            show: true,
          },
        },
      },
      toolbox: {
        show: true,
        feature: {
          mark: { show: true },
          dataView: { show: true, readOnly: false },
          magicType: { show: true, type: ["line", "bar"] },
          restore: { show: true },
          saveAsImage: { show: true },
        },
      },
      calculable: true,
      // legend: {
      //   data: ['Growth', 'Budget 2011', 'Budget 2012'],
      //   itemGap: 5
      // },
      grid: {
        top: "12%",
        left: "1%",
        right: "10%",
        containLabel: true,
      },
      dataZoom: [
        {
          show: true,
          start: 94,
          end: 100,
        },
        {
          type: "inside",
          start: 94,
          end: 100,
        },
        {
          show: true,
          yAxisIndex: 0,
          filterMode: "empty",
          width: 30,
          height: "80%",
          showDataShadow: false,
          left: "93%",
        },
      ],
      xAxis: { type: "category" },
      yAxis: {},
      // Declare several 'bar' series,
      // every series will auto-map to each column by default.
      series: [{ type: "bar" }, { type: "bar" }],
    });

    const init = async () => {
      const fetch = fetchData("GET", {
        path: "/utilities/analytics/aplied_employes",
      });

      const { data, statusCode } = (await fetch).json();
      if (statusCode.value === 200) {
        const response =
          typeof data.value === "string" ? JSON.parse(data.value) : data.value;
        const { statistics } = response;
        // @ts-ignore
        dataset.source = statistics.map((e, ndex) => {
          return {
            // @ts-ignore
            schedule_info: `${e.schedule_meta.assessment_schedule_title} ${e.schedule_meta.assessment_schedule_description} ${e.schedule_meta.assessment_schedule_phase_period} ${e.schedule_meta.assessment_schedule_year_period}`,
            applied_employee: e.schedule_applied_employe,
            not_applied_employee: e.schedule_not_applied_employee,
          };
        });
      }
    };

    onBeforeMount(async () => {
      await init();
    });

    return {
      dataset,
      baseConfigs,
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
                  Applied vs Non-Applied Employe on currennt past assessment by
                  schedule
                </div>
                {/* <Button type="green"/> */}
              </div>
            </NAlert>
            <VueECharts
              initOptions={{
                renderer: "svg",
              }}
              option={this.baseConfigs as unknown as ECBasicOption}
              ref="chartRefs"
              autoresize
              class={["flex w-full h-[500px]"]}
            />
          </div>
          <div class={["w-1/2 space-y-3"]}>
            <NAlert type="warning">
              <div class={["font-semibold text-md"]}>Upcoming Chart</div>
            </NAlert>
          </div>
        </div>
      </div>
    );
  },
});
