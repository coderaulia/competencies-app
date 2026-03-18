import { NSwitch, type DataTableColumns } from "naive-ui";
import {
  ColumnCreator,
  type BuildInDatatableKeys,
} from "./DatatableColumnCreator";
import {defineComponent, computed,ref, type PropType, toRef, reactive, onBeforeMount, getCurrentInstance} from "vue";
import type { PublicationResource } from "@/models/Publication";
import useApiService from "@/composables/useApiService";
import type DatatableServerSide from "@/components/Datatable/DatatableServerSide";
import useBasicNotification from "@/composables/notifications/useBasicNotification";
export type Publication = PublicationResource & BuildInDatatableKeys;
export const createPublicationDataTableColumns =
  (): DataTableColumns<Publication> =>
    ColumnCreator([
      {
        title: "PUBLICATION TITLE",
        key: "publication_title",
        minWidth: 200,
        maxWidth: 300,
      },
      {
        title: "PUBLICATION CATEGORY",
        key: "publication_category.publication_category_name",
        minWidth: 200,
        maxWidth: 300,
      },
      {
        title: "SUMMARIES",
        key: "bucket",
        minWidth: 200,
        maxWidth: 300,
        render(rowData, rowIndex){
          const wrapperClassess   = "text-gray-500";
          const classess          = "text-xs text-gray-500 border py-1 px-2 rounded-lg shadow-md";
          return (
            <div class={["flex h-full flex-row justify-normal gap-3"]}>
              <div class={["mr-3 text-xs"]}>
                <div class={[wrapperClassess, "py-2"]}>BucketName : </div>
                <div class={[wrapperClassess, "py-2"]}>Type : </div>
                <div class={[wrapperClassess, "py-2"]}>Author : </div>                
              </div>
              <div class={["flex flex-col gap-y-2"]}>
                <div class={[wrapperClassess]}>
                  <span class={[classess]}>
                    { rowData.bucket ? rowData.bucket?.bucket_name : "N/A"}
                  </span>
                </div>
                <div class={[wrapperClassess]}>
                  <span class={[classess]}>
                    { rowData.bucket ? rowData.bucket?.bucket_category?.bucket_category_name : "N/A"}
                  </span>
                </div>
                <div class={[wrapperClassess]}>
                  <span class={[classess]}>
                    { rowData.bucket && rowData.bucket?.bucket_author?.profile?.user?.name  ? rowData.bucket.bucket_author.profile.user.name : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          )
        }
      },
      {
        title: "APPROVAL",
        key: "bucket",
        minWidth: 200,
        maxWidth: 300,
        render(rowData, rowIndex){
          return <RenderApprovalSwitch publication={rowData}/>
        }
      },
    ]);
export const RenderApprovalSwitch = defineComponent({
  name: "ApprovallSwitchComponent",
  props: {
    publication: {
      type: Object as PropType<Publication>,
      required: true
    }
  },
  setup(props){
    const publication_ = toRef(props.publication);
    const model = reactive({
      approvedValue: publication_.value.publication_is_verified,
      form: {
        isVerified: null
      }
    })

    const instance = getCurrentInstance()
    const datatable = instance?.parent?.parent?.parent?.parent?.parent?.parent?.parent?.parent as unknown as typeof DatatableServerSide;
    const notification = useBasicNotification();

    const resetForm = () => {
      model.form.isVerified = null;
    }
    async function handleUpdateValue(val: any){
      model.form.isVerified = val;
      approvePublication()
        .then((data) => {
          console.log(data);
          datatable?.proxy.reload();
          notification.notify("success", "Approval Notification", "Publication [" + props.publication.publication_title +  "] successfulyy " + data.data.value.message, "")
        })
        .catch((e) => console.log(e))
    }
    
    async function approvePublication(){
      return await useApiService("utilities/uploads/libraries/publication-approval/" + props.publication.id).post({
        isVerified: model.form.isVerified
      }).json();
    }
    
    onBeforeMount(() => {
      resetForm();
    })
    return {
      model, handleUpdateValue
    }
  }, 
  render(){
    const {model, handleUpdateValue} = this;
    return (
      <div class={["flex h-full flex-row justify-normal gap-3"]}>
        <NSwitch 
          round={false} 
          v-model:value={model.approvedValue} 
          onUpdate:value={handleUpdateValue}
        />
      </div>
    )
  }
})
