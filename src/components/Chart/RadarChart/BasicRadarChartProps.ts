import type { CSSProperties, PropType } from "vue";
import type { EChartsOption } from "echarts";

type EchartOption = EChartsOption;
const RadarChartProps = {
  style: Object as unknown as PropType<CSSProperties>,
  options: Object as unknown as PropType<EchartOption>,
};
export { RadarChartProps };
