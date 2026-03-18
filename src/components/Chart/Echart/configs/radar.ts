import type { RadarComponentOption, SeriesOption } from "echarts";

const base: echarts.EChartsOption = {
  title: {
    text: "",
  },
  tooltip: {
    trigger: "item",
  },
  legend: {
    bottom: 5,
    data: ["Min req. score", "Actual Score"],
    itemGap: 20,
    textStyle: {
      color: "#000000",
      fontSize: 14,
    },
    selectedMode: "multiple",
  },
  radar: [],
  series: [],
};
function getRadarConfig({ text = "", subtext = "" }) {
  base.title = {
    text: text,
    subtext: subtext,
  };
  return base;
}
function setSeries(series: any) {
  base.series = [...series];
  return base;
}
function setIndicator(radar: any) {
  base.radar = [...radar];
  return base;
}
export { setSeries, setIndicator, getRadarConfig };
