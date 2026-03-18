import useApiService from "@/composables/useApiService";
import { defineComponent, onBeforeMount, ref } from "vue";
import BucketListHeader from "@/components/FileStorageBuckets/BucketUtilities/BucketListHeader";
import { RenderEmptyBucket } from "@/components/FileStorageBuckets/BucketUtilities/EmptyBucket";
import type { BucketCollections, BucketResource } from "@/models/Bucket";
import { RenderBucketsItems } from "@/components/FileStorageBuckets/BucketUtilities/BucketItems";
import { NCard, NGrid, NGridItem } from "naive-ui";
import { useRouter } from "vue-router";
export type Bucket = BucketResource & {
  id: number;
  created_at: string;
  updated_at: string;
};
export default defineComponent({
  name: "ListUploadPublication",
  setup() {
    const myBuckets_ = ref<Bucket[] | []>([]);
    const globalBucket_ = ref<Bucket|null>(null);
    const router = useRouter();

    async function fetchBucketAndPublication() {
      const { data, statusCode } = await useApiService(
        "/utilities/uploads/libraries/publication-bucket-lists"
      )
        .get()
        .json();
        if (statusCode.value === 200) {
        const result = data.value.result;
        myBuckets_.value = [...result.myBuckets];
        // @ts-ignore
        globalBucket_.value = result.publicBucket;
      }
    }

    onBeforeMount(async () => {
      fetchBucketAndPublication();
    });

    function handleClick(e: Event | MouseEvent, bucket: Bucket) {
      e.preventDefault();
      e.stopPropagation();
      router.push({
        name: "FileStorageBucket",
        query: {
          type: bucket?.bucket_category?.bucket_category_name,
          id: bucket?.id,
        },
      });
      // console.log(e, index, bucketname);
    }
    return {
      myBuckets: myBuckets_,
      globalBucket: globalBucket_,
      handleClick
    };
  },
  render() {
    const { myBuckets, globalBucket, handleClick } = this;
    return (
      <div class={["flex flex-col w-full space-y-6"]}>
        <div class={["flex flex-col gap-y-3 w-full"]}>
          <NCard>
            <BucketListHeader
              title="Public Buckets"
              subTitle="Public bucket for all employe"
              v-slots={{
                default: () => {
                  return (
                    <div class={["flex w-full"]}>
                      <NGrid cols={4} xGap={10}>
                      <NGridItem
                        class={[
                          "scale-95 hover:scale-100 transition-all ease-in-out duration-300",
                        ]}
                      >
                        <NCard
                          v-slots={{
                            cover: () => (
                              <img
                                onClick={(event) => handleClick(event, globalBucket as Bucket)}
                                title={globalBucket?.bucket_name}
                                src="https://cdn1.iconfinder.com/data/icons/essentials-41/32/17_Folder-1024.png"
                                class={["cursor-pointer"]}
                              ></img>
                            ),
                          }}
                        >
                          <div
                            class={["max-w-[240px] text-lg font-semibold mb-5 truncate"]}
                          >
                            {globalBucket?.bucket_name}
                          </div>
                          <div class={["flex flex-col space-y-3"]}>
                            <p class={["max-w-[240px] text-sm line-clamp-1"]}>
                              {globalBucket?.bucket_description}
                            </p>
                            <span>
                              Type : {globalBucket?.bucket_category?.bucket_category_name}
                            </span>
                          </div>
                        </NCard>
                      </NGridItem>
                      </NGrid>
                    </div>
                  )
                },
              }}
            />
          </NCard>
          <NCard>
            <BucketListHeader
              title="My Buckets"
              subTitle="Private bucket for individual storage only"
              v-slots={{
                default: () => {
                  return myBuckets.length !== 0 ? (
                    <div class={["flex w-full flex-col items-center"]}>
                      <RenderBucketsItems buckets={myBuckets} />
                    </div>
                  ) : (
                    <RenderEmptyBucket />
                  );
                },
              }}
            />
          </NCard>
        </div>
      </div>
    );
  },
});
