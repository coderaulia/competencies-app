import type { CompetencyLevelResource } from "@/models/CompetencyLevel";
import type { DataTableColumns } from "naive-ui";
import {
  ColumnCreator,
  type BuildInDatatableKeys,
} from "./DatatableColumnCreator";

export type CompetencyLevelDatatable = CompetencyLevelResource &
  BuildInDatatableKeys;
export const createCompetencyLevelDatatableColumn =
  (): DataTableColumns<CompetencyLevelDatatable> =>
    ColumnCreator([
      {
        title: "LEVEL NAME OF COMP",
        key: "competency_level_name",
        minWidth: 200,
        maxWidth: 300,
      },
      {
        title: "LEVEL TITLE OF COMP",
        key: "competency_level_title",
        minWidth: 200,
        maxWidth: 300,
      },
      {
        title: "LEVEL DESC. OF COMP",
        key: "competency_level_description",
        minWidth: 200,
        maxWidth: 300,
      },
    ]);
