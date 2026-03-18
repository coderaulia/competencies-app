import type { EmploymentResource } from "./Employment";

export declare type CertificationResource = {
  id: number;
  certification_name: string | null;
  certification_status?: string | null;
  certification_description?: string | null;
  employment_id: number | null;
  employment?: EmploymentResource | null;
  created_at?: string;
  updated_at?: string;
};

export declare type CertificationCollections = CertificationResource[];
