import { defineComponent, type PropType, toRefs } from "vue";
import { NCard, NGrid, NGridItem } from "naive-ui";
import { useRouter } from "vue-router";
import type { BucketResource } from "@/models/Bucket";
export type Bucket = BucketResource & {
  id: number;
  created_at: string;
  updated_at: string;
};
/**
 * Render Bucket Items
 */
export const RenderBucketsItems = defineComponent({
  name: "BucketItems",
  props: {
    buckets: {
      type: Array as unknown as PropType<Bucket[]>,
    },
    gridColumns: {
      type: Number,
      default: 4,
    },
  },
  setup(props) {
    const router = useRouter();
    const { buckets, gridColumns } = toRefs(props);
    function handleClick(e: Event | MouseEvent, index: number, bucket: Bucket) {
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
      buckets,
      gridColumns,
      handleClick,
    };
  },
  render() {
    const { handleClick } = this;
    return (
      <div class={["flex w-full"]}>
        <NGrid cols={this.gridColumns} xGap={10}>
          {this.buckets?.map((bucket, index) => {
            return (
              <NGridItem
                class={[
                  "scale-95 hover:scale-100 transition-all ease-in-out duration-300",
                ]}
              >
                <NCard
                  v-slots={{
                    cover: () => (
                      <img
                        onClick={(event) => handleClick(event, index, bucket)}
                        title={bucket?.bucket_name}
                        src="https://cdn1.iconfinder.com/data/icons/essentials-41/32/17_Folder-1024.png"
                        class={["cursor-pointer"]}
                      ></img>
                    ),
                  }}
                >
                  <div class={["max-w-[240px] text-lg font-semibold mb-5 truncate"]}>
                    {bucket?.bucket_name}
                  </div>
                  <div class={["flex flex-col space-y-3"]}>
                    <p class={["max-w-[240px] text-sm line-clamp-1"]}>
                      {bucket?.bucket_description}
                    </p>
                    <span>
                      Type : {bucket?.bucket_category?.bucket_category_name}
                    </span>
                  </div>
                </NCard>
              </NGridItem>
            );
          })}
        </NGrid>
      </div>
    );
  },
});
