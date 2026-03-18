import type { PositionResource } from "@/models/Position";
import type { DataTableColumns } from "naive-ui";
import { NTag } from "naive-ui";
import { ref } from "vue";
import {
  ColumnCreator,
  type BuildInDatatableKeys,
} from "./DatatableColumnCreator";

export type PositionDatatable = PositionResource & BuildInDatatableKeys;
export const createPositionDatatableColumn =
  (): DataTableColumns<PositionDatatable> =>
    ColumnCreator([
      {
        title: "NAME OF POSITION",
        key: "position_name",
        minWidth: 200,
        maxWidth: 300,
        filterOptions: [{ label: "trere", value: "asskdbjhadbhj" }],
      },
      {
        title: "HAS COMPETENCIES",
        key: "attachedComptenciesCount",
        minWidth: 200,
        maxWidth: 300,
        filterMultiple: false,
        filterOptionValue: null,
        filterOptions: [
          {
            label: "Has Competencies",
            value: "true",
          },
          {
            label: "Has Competencies",
            value: "false",
          },
        ],
        render: (rowData) => {
          const type = ref<boolean>(false);
          // @ts-ignore
          if (rowData.attachedCompetenciesCount !== 0) {
            type.value = true;
          }
          return (
            <div>
              <NTag type={type.value ? "info" : "warning"}>
                {/* @ts-ignore */}
                {type.value ? "true" : "false"}
              </NTag>
            </div>
          );
        },
      },
      {
        title: "COUNT OF COMPETENCIES",
        key: "attachedCompetenciesCount",
        minWidth: 200,
        maxWidth: 300,
      },
    ]);
