import type { RoleResource } from "@/models/Role";
import type { DataTableColumns } from "naive-ui";
import {
  ColumnCreator,
  type BuildInDatatableKeys,
} from "./DatatableColumnCreator";
export type RoleDataTable = RoleResource & BuildInDatatableKeys;
export const createRoleDataTableColumns = (): DataTableColumns<RoleDataTable> =>
  ColumnCreator([
    {
      title: "ROLE NAME",
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
  ]);
