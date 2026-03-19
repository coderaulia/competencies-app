"use strict";

const core = require("./mock-api-core");

function getPublicationBucketLists(store) {
  const publicBucket = store.collections.buckets.find(
    (bucket) => bucket.bucket_has_public_access
  );
  const myBuckets = store.collections.buckets.filter(
    (bucket) => !bucket.bucket_has_public_access
  );

  return {
    result: {
      publicBucket: core.bucketSummary(store, publicBucket, {
        includePublications: true,
      }),
      myBuckets: myBuckets.map((bucket) => core.bucketSummary(store, bucket)),
    },
  };
}

function getPublicationBucketDetail(store, bucketId) {
  const bucket = core.findById(store, "buckets", bucketId);
  if (!bucket) {
    return null;
  }

  return {
    result: core.bucketSummary(store, bucket, {
      includePublications: true,
    }),
  };
}

function getPublicationCategories(store) {
  return {
    result: store.collections.publication_categories.map((category) =>
      core.publicationCategorySummary(category)
    ),
  };
}

function approvePublication(store, publicationId, isVerified) {
  const publication = core.findById(store, "publications", publicationId);
  if (!publication) {
    return null;
  }

  publication.publication_is_verified = Boolean(isVerified);
  publication.updated_at = core.nowIso();

  return {
    message: `set to ${
      publication.publication_is_verified ? "verified" : "unverified"
    }`,
    data: core.publicationSummary(store, publication),
  };
}

function uploadPublication(store, payload = {}) {
  return core.createPublicationRecord(store, payload);
}

module.exports = {
  getPublicationBucketLists,
  getPublicationBucketDetail,
  getPublicationCategories,
  approvePublication,
  uploadPublication,
};
