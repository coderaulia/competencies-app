import { UPDATE_OPTIONS_KEY } from "@/components/Chart/Echart";
import type { BucketResource } from "@/models/Bucket";
import { NCard, NTabs, NTabPane } from "naive-ui";
import { defineComponent } from "vue";
import { RouterView } from "vue-router";
// import SystemBucket from "./tab-contents/SystemBucket";
// import SharedBucket from "./tab-contents/SharedBucket";
// import PrivateBucket from "./tab-contents/PrivateBucket";
export type Bucket = BucketResource & {
  id: number;
  created_at: string;
  updated_at: string;
};

export default defineComponent({
  name: "PublicationIndex",
  setup(props) {
    return {};
  },
  render() {
    return (
      <div class={["flex flex-col px-6"]}>
        {/* <NCard title="E-Publications Document"> */}
        {/* <NTabs type="line" animated defaultValue={"upload"}>
          <NTabPane name={"upload"} tab={"Upload Publication Form"}>
            <UploadPublicationTab />
          </NTabPane>
          <NTabPane name={"list"} tab={"List Publication"}>
            <ListPublications />
          </NTabPane>
        </NTabs> */}
        {/* </NCard> */}
        <RouterView />
      </div>
    );
  },
});
