import type { BucketResource } from "@/models/Bucket";
import { NSpace, type DataTableColumns, NTag } from "naive-ui";
import {
  ColumnCreator,
  type BuildInDatatableKeys,
} from "./DatatableColumnCreator";
import { computed, defineComponent, toRef, toRefs } from "vue";
export type BucketDatatable = BucketResource & BuildInDatatableKeys;

import { CheckmarkCircle } from "@vicons/ionicons5";

export const createBucketDatatableColumn =
  (): DataTableColumns<BucketDatatable> =>
    ColumnCreator([
      {
        title: "BUCKETNAME",
        key: "bucket_name",
        minWidth: 200,
        maxWidth: 300,
      },
      {
        title: "BUCKET DESC.",
        key: "bucket_description",
        minWidth: 200,
        maxWidth: 300,
      },
      {
        title: "BUCKET TYPE",
        key: "bucket_type",
        minWidth: 200,
        maxWidth: 300,
        render(rowData, rowIndex) {
          return <NTag>{rowData.bucket_category?.bucket_category_name}</NTag>;
        },
      },
      {
        title: "CREATOR/OWNER",
        key: "bucket_author.profile.user.email",
        minWidth: 200,
        maxWidth: 300,
        // render(rowData, rowIndex){
        //   // return <RenderBooleanColumn boolValue={rowData.bucket_has_public_access}/>
        // }
      },
    ]);

export const RenderBooleanColumn = defineComponent({
  name: "RenderBooleanColumn",
  props: {
    boolValue: {
      type: Boolean,
      required: true,
    },
  },
  setup(props) {
    const tagType = computed<
      | "success"
      | "error"
      | "warning"
      | "default"
      | "info"
      | "primary"
      | undefined
    >(() => {
      switch (props.boolValue) {
        case true:
          return "success";
          break;
        case false:
          return "error";
          break;
        default:
          break;
      }
    });
    const boolVal = computed(() => props.boolValue);
    return {
      boolVal,
      tagType,
    };
  },
  render() {
    return (
      <NSpace>
        <NTag type={this.tagType}>
          {this.boolVal ? "Public" : "Private / Scoped"}
        </NTag>
      </NSpace>
    );
  },
});
