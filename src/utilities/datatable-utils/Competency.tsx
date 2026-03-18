import type { CompetencyResource } from "@/models/Competency";
import type { DataTableColumns } from "naive-ui";
import {
  ColumnCreator,
  type BuildInDatatableKeys,
} from "./DatatableColumnCreator";

export type CompetencyDatatable = CompetencyResource & BuildInDatatableKeys;
export const createCompetencyDatatableColumn =
  (): DataTableColumns<CompetencyDatatable> =>
    ColumnCreator([
      {
        title: "NAME OF COMPETENCY",
        key: "competency_name",
        minWidth: 200,
        maxWidth: 300,
      },
    ]);
