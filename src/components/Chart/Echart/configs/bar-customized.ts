import type { ECBasicOption } from "echarts/types/dist/shared";
export default function defineConfig(): ECBasicOption {
  return {
    title: {
      text: "Average Employement Assessment Distribution",
    },
    legend: {
      data: ["Employee Average Competenies Ass Value"],
    },
    tooltip: {
      trigger: "axis",
    },
    toolbox: {
      show: true,
      feature: {
        dataView: { show: true, readOnly: false },
        magicType: { show: true, type: ["line", "bar"] },
        restore: { show: true },
        saveAsImage: { show: true },
      },
    },
    calculable: true,
    xAxis: [],
    yAxis: [],
    series: [],
  };
}
