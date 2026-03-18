import type { PermissionCollections } from "./Permission";
import type { ProfileResource } from "./Profile";

/**
 * User resource.
 * @date 12/5/2022 - 05:18:43
 *
 * @export
 * @typedef {UserResource}
 */
export declare type UserResource = {
  id?: string | number;
  name: string | null;
  email: string | null;
  email_verified_at: string | null;
  roles: Array<RoleCollections> | [];
  permissions: Array<PermissionCollections> | [];
  profile: ProfileResource | null;
  is_logged_in?: boolean;
  last_logged_in_at?: strig;
  last_logged_in_host?: string;
  last_logged_in_port?: string;
  last_logged_in_user_agent?: string;
  last_logged_in_device?: string | null;
  last_logged_in_browser?: string;
  last_logged_in_platform?: string;
  created_by?: string | null;
  updated_by?: string;
  registered_by?: string | null;
  verified_by?: string | null;
  created_at?: string;
  updated_at?: string;
  registered_at?: string | null;
};
export declare type UserCollections = UserResource[];
