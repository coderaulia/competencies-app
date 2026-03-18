import { defineComponent, ref, toRefs, computed, onMounted, watch } from "vue";
import { RadarChartProps } from "./BasicRadarChartProps";
// @ts-ignore
import * as echarts from "echarts";
// You can use only the renderers you need
import { SVGRenderer, CanvasRenderer } from "echarts/renderers";

// echarts.use([SVGRenderer, CanvasRenderer]);

export type EchartInstanceType = echarts.ECharts;

export default defineComponent({
  name: "BasicRadarChart",
  props: RadarChartProps,
  setup(props) {
    const { options, style } = toRefs(props);
    const radarChartRefs = ref<Element | HTMLElement | HTMLDivElement | null>(
      null
    );
    const styleProps = computed(() => style.value);

    let chartInstance: echarts.ECharts | null = null;

    function refreshChart(instance: echarts.ECharts) {
      instance.setOption(options.value as echarts.EChartsOption);
    }

    onMounted(() => {
      let chart = echarts.init(radarChartRefs.value as HTMLElement);
      chartInstance = chart;
      refreshChart(chartInstance);
    });

    watch(
      () => options.value,
      (nVal) => {
        // console.log({nVal})
        chartInstance?.setOption(options.value as echarts.EChartsOption);
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
