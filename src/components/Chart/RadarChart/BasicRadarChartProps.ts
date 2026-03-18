import * as Echart from "echarts";
import type { CSSProperties, PropType } from "vue";
type EchartOption = echarts.EChartsOption;
const RadarChartProps = {
  style: Object as unknown as PropType<CSSProperties>,
  options: Object as unknown as PropType<EchartOption>,
};
export { RadarChartProps };
