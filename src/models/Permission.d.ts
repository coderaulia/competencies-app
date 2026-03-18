import type { RoleCollections } from "./Role";
import type { UserCollections } from "./User";

/**
 * Permission resource.
 * @date 12/5/2022 - 05:19:45
 *
 * @export
 * @typedef {PermissionResource}
 */
export declare type PermissionResource = {
  name: string | null;
  group: string | null;
  guard_name: string | null;
  users: Array<UserCollections> | [];
  roles: Array<RoleCollections> | [];
};
export declare type PermissionCollections = PermissionResource[];
