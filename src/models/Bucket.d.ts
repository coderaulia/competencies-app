import type { BucketCategoryResource } from "./BucketCategory";
import type { EmploymentResource } from "./Employment";
import type { PublicationResource } from "./Publication";

export declare type BucketResource = {
  bucket_name: string;
  bucket_description: string;
  bucket_created_by: string;
  bucket_category: BucketCategoryResource | null;
  publications?: PublicationResource[] | [];
  publication_counts?: number;
  bucket_author?: EmploymentResource
};
export declare type BucketCollections = BucketResource[] | [];
