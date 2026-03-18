import type { BucketResource } from "@/models/Bucket";
import type { Bucket } from "@/views/Dashboard/Elearning/FileStorage/Index";
import { NGridItem } from "naive-ui";
import { defineComponent, toRefs, type PropType } from "vue";
export default defineComponent({
  name: "BucketItem",
  props: {
    bucket: Object as PropType<Bucket>,
  },
  setup(props) {
    const { bucket } = toRefs(props);
    return {
      bucket,
    };
  },
  render() {
    return (
      <NGridItem>
        <div>
          {this.bucket?.bucket_name}
          {this.bucket?.bucket_description}
          {this.bucket?.bucket_has_public_access}
        </div>
      </NGridItem>
    );
  },
});
