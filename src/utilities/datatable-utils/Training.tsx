import type DatatableServerSide from "@/components/Datatable/DatatableServerSide";
import type { TrainingResource } from "@/models/Training";
import type { DataTableColumns } from "naive-ui";
import {
  ColumnCreator,
  type BuildInDatatableKeys,
} from "./DatatableColumnCreator";
export type TrainingDatatable = TrainingResource & BuildInDatatableKeys;
export const createTrainingDatatableColumn =
  (): DataTableColumns<TrainingDatatable> =>
    ColumnCreator([
      {
        title: "Title Of Training",
        key: "training_title",
        minWidth: 200,
        maxWidth: 300,
      },
      {
        title: "Related Competency",
        key: "competency.competency_name",
        minWidth: 200,
        maxWidth: 300,
      },
      {
        title: "Level Of Training",
        key: "training_level",
        minWidth: 200,
        maxWidth: 300,
      },
      {
        title: "Target Group",
        key: "training_target_group",
        minWidth: 200,
        maxWidth: 300,
      },
      {
        title: "Delivery Method",
        key: "training_delivery_method",
        minWidth: 200,
        maxWidth: 300,
      },
      {
        title: "Day of Duration",
        key: "training_day_duration",
        minWidth: 200,
        maxWidth: 300,
      },
      {
        title: "Hours of Duration",
        key: "training_day_duration",
        minWidth: 200,
        maxWidth: 300,
      },
    ]);
