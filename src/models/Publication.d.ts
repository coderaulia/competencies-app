import type { BucketResource } from "./Bucket";
import type { PublicationCategoryResource } from "./PublicationCategory";
import type { PublicationStorageCollections } from "./PublicationStorage";

export type PublicationResource = {
  publication_title: string;
  publication_slug: string;
  publication_description: string;
  publication_is_verified: boolean;
  publication_category_id: number | null;
  publication_category?: PublicationCategoryResource | null;
  bucket_id: number | null;
  bucket?: BucketResource | null;
  storages?: PublicationStorageCollections;
};
