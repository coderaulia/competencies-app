import { defineComponent, ref, toRefs, computed, onMounted, watch } from "vue";
import { RadarChartProps } from "./BasicRadarChartProps";
import {
  init as initEchart,
  use,
  type EChartsType,
  type EChartsOption,
} from "echarts/core";
import { RadarChart } from "echarts/charts";
import {
  RadarComponent,
  TitleComponent,
  LegendComponent,
  TooltipComponent,
} from "echarts/components";
import { SVGRenderer, CanvasRenderer } from "echarts/renderers";

use([
  RadarChart,
  RadarComponent,
  TitleComponent,
  LegendComponent,
  TooltipComponent,
  SVGRenderer,
  CanvasRenderer,
]);

export type EchartInstanceType = EChartsType;

export default defineComponent({
  name: "BasicRadarChart",
  props: RadarChartProps,
  setup(props) {
    const { options, style } = toRefs(props);
    const radarChartRefs = ref<Element | HTMLElement | HTMLDivElement | null>(
      null
    );
    const styleProps = computed(() => style.value);

    let chartInstance: EChartsType | null = null;

    function refreshChart(instance: EChartsType) {
      instance.setOption(options.value as EChartsOption);
    }

    onMounted(() => {
      const chart = initEchart(radarChartRefs.value as HTMLElement);
      chartInstance = chart;
      refreshChart(chartInstance);
    });

    watch(
      () => options.value,
      () => {
        chartInstance?.setOption(options.value as EChartsOption);
      },
      {
        deep: true,
      }
    );

    return {
      styleProps,
      radarChartRefs,
    };
  },
  render() {
    const { styleProps } = this;
    return <div ref="radarChartRefs" style={styleProps} />;
  },
});
