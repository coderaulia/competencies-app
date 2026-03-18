import type { EmploymentResource } from "./Employment";
import type { UserResource } from "./User";

export declare type ProfileResource = {
  profile_fullname: string | null;
  profile_gender: string | null;
  profile_place_of_birth: string | null;
  profile_date_of_birth: string | null;
  profile_marital_status: string | null;
  profile_nationality: string | null;
  profile_religion: string | null;
  user_id: number | null;
  user: UserResource | null;
  employment: EmploymentResource | null;
};
export declare type ProfileCollections = ProfileResource[];
