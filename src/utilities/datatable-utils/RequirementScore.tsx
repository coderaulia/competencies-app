import type { RequirementScoreResource } from "@/models/RequirementScore";
import type { DataTableColumns } from "naive-ui";
import { defineComponent, toRefs, type PropType } from "vue";
import {
  ColumnCreator,
  type BuildInDatatableKeys,
} from "./DatatableColumnCreator";
export type RequirementScoreDatatable = RequirementScoreResource &
  BuildInDatatableKeys;
export const createRequirementScoreDatatableColumn =
  (): DataTableColumns<RequirementScoreDatatable> =>
    ColumnCreator([
      {
        title: "MIN. SCORE",
        key: "minimum_score",
        minWidth: 200,
        maxWidth: 300,
      },
      {
        title: "POSITION",
        key: "position.position_name",
        minWidth: 200,
        maxWidth: 300,
      },
      {
        title: "COMPETENCY",
        key: "competency.competency_name",
        minWidth: 200,
        maxWidth: 300,
      },
      {
        title: "COMPETENCY LEVEL",
        key: "level.competency_level_name",
        minWidth: 200,
        maxWidth: 300,
      },
      {
        title: "LEVEL CODE",
        key: "level.competency_level_title",
        minWidth: 200,
        maxWidth: 300,
      },
      {
        title: "EXPAND",
        type: "expand",
        minWidth: 200,
        maxWidth: 300,
        expandable: (rowData) => true,
        renderExpand: (rowData) => {
          return <RenderExpandableColumn data={rowData} />;
        },
      },
    ]);
export const RenderExpandableColumn = defineComponent({
  name: "renderExpandableColumn",
  props: {
    data: {
      type: Object as PropType<RequirementScoreDatatable>,
      required: true,
    },
  },
  setup(props, ctx) {
    const { data } = toRefs(props);
    return {
      data,
    };
  },
  render() {
    return (
      <div
        class={[
          "bg-white p-2 rounded-lg shadow-lg shadow-green-100 border border-green-400",
        ]}
      >
        <div class="md:grid md:grid-cols-3 md:gap-6 p-2">
          <div class="md:col-span-1">
            <div class="px-4 sm:px-0">
              <h3 class="text-lg font-medium leading-6 text-black">
                Detail of Related Competency
              </h3>
              <p class="mt-1 text-sm text-black">
                This information is displayed publicly that contains the
                resource detail about related competency context of selected
                score yet.
              </p>
            </div>
          </div>
          <div class="mt-5 md:col-span-2 md:mt-0">
            <div class="overflow-hidden shadow sm:rounded-md">
              <div class="bg-white px-4 py-5 sm:p-6">
                <div class="grid grid-cols-6 gap-6">
                  <div class="col-span-6 sm:col-span-3">
                    <pre>{JSON.stringify(this.data.competency, null, 4)}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="hidden sm:block p-2" aria-hidden="true">
          <div class="py-5">
            <div class="border-t border-gray-200"></div>
          </div>
        </div>

        <div class="md:grid md:grid-cols-3 md:gap-6 p-2">
          <div class="md:col-span-1">
            <div class="px-4 sm:px-0">
              <h3 class="text-lg font-medium leading-6 text-black">
                Detail of Related Competency Level
              </h3>
              <p class="mt-1 text-sm text-black">
                This information is displayed publicly that contains the
                resource detail about related competency level context of
                selected score yet.
              </p>
            </div>
          </div>
          <div class="mt-5 md:col-span-2 md:mt-0">
            <div class="overflow-hidden shadow sm:rounded-md">
              <div class="bg-white px-4 py-5 sm:p-6">
                <div class="grid grid-cols-6 gap-6">
                  <div class="col-span-6 sm:col-span-3">
                    <pre>{JSON.stringify(this.data.level, null, 4)}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="hidden sm:block p-2" aria-hidden="true">
          <div class="py-5">
            <div class="border-t border-gray-200"></div>
          </div>
        </div>

        <div class="md:grid md:grid-cols-3 md:gap-6 p-2">
          <div class="md:col-span-1">
            <div class="px-4 sm:px-0">
              <h3 class="text-lg font-medium leading-6 text-black">
                Detail of Related Position
              </h3>
              <p class="mt-1 text-sm text-black">
                This information is displayed publicly that contains the
                resource detail about related position context of selected score
                yet.
              </p>
            </div>
          </div>
          <div class="mt-5 md:col-span-2 md:mt-0">
            <div class="overflow-hidden shadow sm:rounded-md">
              <div class="bg-white px-4 py-5 sm:p-6">
                <div class="grid grid-cols-6 gap-6">
                  <div class="col-span-6 sm:col-span-3">
                    <pre>{JSON.stringify(this.data.position, null, 4)}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
});
