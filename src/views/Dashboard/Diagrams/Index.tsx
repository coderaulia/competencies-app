import { defineComponent, reactive } from "vue";
import type { EChartsOption } from "echarts";
import { RouterView } from "vue-router";
// todo render data should be automatically based on whic data is accessed to perform re-usability
// so we determine to use  composable function to genersate chart configuration

export default defineComponent({
  name: "DiagramIndex",
  setup() {
    const chartOptions: EChartsOption = reactive({
      title: {
        text: "Production Department | Production Manager", // should be reactive
      },
      legend: {
        data: ["Min req. score", "Actual score"],
        bottom: "1%",
      },
      radar: {
        // shape: 'circle',
        // should mapp competencies, with max props is a max of actual score achievemtn, min score is from current min score of employe competency assessment
        indicator: [
          { name: "Occupational Health & Safety Management", max: 5 },
          { name: "Cement Manufacturing Process", max: 5 },
          { name: "Product Management", max: 5 },
          { name: "Energy Management", max: 5 },
          { name: "Environtment Management System", max: 5 },
          { name: "Alternative Fuel & Raw Material Management", max: 5 },
          { name: "Pyroprocesing Management", max: 5 },
          { name: "Milling Operation", max: 5 },
          { name: "Dispatch Management", max: 5 },
          { name: "Cost & Budget anagement", max: 5 },
        ],
      },
      series: [
        {
          name: "Minimum Required Score  vs Actual Score Achieved",
          type: "radar",
          data: [
            {
              // the valu is providedd depend on minimum requirement value of current employe min req score of assessment
              value: [3, 4, 5, 3, 4, 2, 5, 5, 2, 3],
              name: "Min req. score",
            },
            {
              // the value is depend on employe actiual competenci assessmemt result
              value: [2, 4, 3, 2, 3, 1, 4, 5, 4, 2],
              name: "Actual score",
            },
          ],
        },
      ],
    });

    return {
      chartOptions,
    };
  },
  render() {
    const { chartOptions } = this;
    return (
      <div class={["flex flex-col px-6"]}>
        <div class={["w-full"]}>
          <RouterView />
        </div>
      </div>
    );
  },
});
