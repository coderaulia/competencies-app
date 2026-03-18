import type { DataTableColumns } from "naive-ui";
import type { PermissionResource } from "@/models/Permission";
import {
  ColumnCreator,
  type BuildInDatatableKeys,
} from "./DatatableColumnCreator";
export type PermissionData = PermissionResource & BuildInDatatableKeys;
export const createPermissionDataTableColumns =
  (): DataTableColumns<PermissionData> =>
    ColumnCreator([
      {
        title: "PERMISSION NAME",
        key: "name",
        minWidth: 200,
        maxWidth: 300,
      },
      {
        title: "GUARD NAME",
        key: "guard_name",
        minWidth: 200,
        maxWidth: 300,
      },
      {
        title: "PERMISSION GROUP",
        key: "group",
        minWidth: 200,
        maxWidth: 300,
      },
    ]);
