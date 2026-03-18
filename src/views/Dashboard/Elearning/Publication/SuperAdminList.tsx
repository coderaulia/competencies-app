import DatatableServerSide from '@/components/Datatable/DatatableServerSide';
import {
  defineComponent, ref, computed, onMounted, onBeforeMount, provide
} from 'vue';
import usePageLoader from "@/composables/usePageLoader";
import { createPublicationDataTableColumns } from '@/utilities/datatable-utils/Publication';
export default defineComponent({
  name: "SuperAdminList",
  setup(){
    const { loadingStart, loadingFinish } = usePageLoader();

    onBeforeMount(() => {
      loadingStart();
    });

    onMounted(() => {
      setTimeout(() => {
        loadingFinish();
      }, 500);
    });

    const backend = ref<string>("publications");
    provide("backend", backend);
    const datatableRefs = ref<InstanceType<typeof DatatableServerSide> | null>(
      null
    );
    return {
      columns: createPublicationDataTableColumns(),
      backend,
      datatableRefs
    }
  }, 
  render(){
    const {      
      columns,
      backend,
      datatableRefs
    } = this;
    return (
      <div class={["flex flex-col px-6"]}>
        <DatatableServerSide 
          ref="datatableRefs"
          path={backend}
          columns={columns}
          onTriggerUpdate={() => {}}/>
      </div>
    )
  }
})