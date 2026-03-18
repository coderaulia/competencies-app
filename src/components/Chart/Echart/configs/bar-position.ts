import type { ECBasicOption } from "echarts/types/dist/shared";

export default function defineBarPosition(): ECBasicOption {
  return {
    tooltip: {
      trigger: "item",
    },
    legend: {
      top: "5%",
      left: "center",
    },
    series: [],
  };
}

export function defineSeries(
  name: string = "",
  data: never[] | undefined = []
) {
  return {
    name: name,
    type: "pie",
    radius: ["40%", "70%"],
    avoidLabelOverlap: false,
    itemStyle: {
      borderRadius: 10,
      borderColor: "#fff",
      borderWidth: 2,
    },
    label: {
      show: false,
      position: "center",
    },
    emphasis: {
      label: {
        show: true,
        fontSize: 40,
        fontWeight: "bold",
      },
    },
    labelLine: {
      show: false,
    },
    data: data,
  };
}
