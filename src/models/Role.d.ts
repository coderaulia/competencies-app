import type { PermissionCollections } from "./Permission";
import type { UserCollections } from "./User";

/**
 * Role resource.
 *
 * @date 12/5/2022 - 05:19:08
 *
 * @export
 * @typedef {RoleResource}
 */
export declare type RoleResource = {
  name: string | null;
  guard_name: string | null;
  users: Array<UserCollections> | [];
  permissions: Array<PermissionCollections> | [];
};
export declare type RoleCollections = RoleResource[];
