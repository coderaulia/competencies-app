import type { BucketResource } from "@/models/Bucket";
import { NCard, NTabs, NTabPane } from "naive-ui";
import { defineComponent } from "vue";
import SystemBucket from "./tab-contents/SystemBucket";
import SharedBucket from "./tab-contents/SharedBucket";
import PrivateBucket from "./tab-contents/PrivateBucket";
export type Bucket = BucketResource & {
  id: number;
  created_at: string;
  updated_at: string;
};

export default defineComponent({
  name: "FileStorageIndex",
  setup(props) {
    return {};
  },
  render() {
    return (
      <div class={["flex flex-col px-6"]}>
        <NCard title="List of file storage buckets">
          <NTabs type="line" animated defaultValue={"system"}>
            <NTabPane name={"system"} tab={"System Buckets"}>
              <SystemBucket />
            </NTabPane>
            <NTabPane name={"shared"} tab={"Shared Buckets"}>
              <SharedBucket />
            </NTabPane>
            <NTabPane name={"private"} tab={"Private Buckets"}>
              <PrivateBucket />
            </NTabPane>
          </NTabs>
        </NCard>
      </div>
    );
  },
});
