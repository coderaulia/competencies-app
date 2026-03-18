import type { AssessmentScheduleCollections } from "@/models/AssessmentSchedule";
import type { DataTableColumns } from "naive-ui";
import {
  ColumnCreator,
  type BuildInDatatableKeys,
} from "./DatatableColumnCreator";
export type AssessmentScheduleDatatable = AssessmentScheduleCollections &
  BuildInDatatableKeys;
export const createAssessmentScheduleDatatableColumn =
  (): DataTableColumns<AssessmentScheduleDatatable> =>
    ColumnCreator([
      {
        title: "TITLE",
        key: "assessment_schedule_title",
        minWidth: 200,
        maxWidth: 300,
      },
      {
        title: "DESCRIPTION",
        key: "assessment_schedule_description",
        minWidth: 200,
        maxWidth: 300,
      },
      {
        title: "YEAR PERIOD",
        key: "assessment_schedule_year_period",
        minWidth: 200,
        maxWidth: 300,
      },
      {
        title: "PHASE",
        key: "assessment_schedule_phase_period",
        minWidth: 200,
        maxWidth: 300,
      },
      {
        title: "IS ACTIVE",
        key: "assessment_schedule_title",
        minWidth: 200,
        maxWidth: 300,
      },
    ]);
