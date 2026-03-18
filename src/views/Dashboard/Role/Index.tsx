import {
  defineComponent,
  ref,
  type Ref,
  provide,
  reactive,
  computed,
  onBeforeMount,
  onMounted,
} from "vue";
import DatatableServerSide from "@/components/Datatable/DatatableServerSide";
import { createRoleDataTableColumns } from "@/utilities/datatable-utils/Role";
import FormModal from "@/components/Modal/FormModal";
import RoleForm from "@/components/Forms/RoleForm";
import useApiService from "@/composables/useApiService";
import useFormModalProcessor from "@/composables/useFormModalProcessor";
import PageStatisticHeader from "@/components/Utils/PageStatisticHeader";
import usePageLoader from "@/composables/usePageLoader";
export type RoleFromData = {
  name: Ref<string>;
  guard_name: Ref<string>;
};
export default defineComponent({
  name: "RoleIndex",
  setup() {
    const { loadingStart, loadingFinish } = usePageLoader();

    onBeforeMount(() => {
      loadingStart();
    });
    onMounted(() => {
      setTimeout(() => {
        loadingFinish();
      }, 500);
    });

    const backend = ref<string>("roles");
    provide("backend", backend);
    const formData = reactive<RoleFromData>({
      name: ref<string>(""),
      guard_name: ref<string>(""),
    });
    const datatableRefs = ref<InstanceType<typeof DatatableServerSide> | null>(
      null
    );

    const {
      showFormModal,
      openModal,
      closeModal,
      formAction,
      setupPostAction,
      setupUpdateAction,
      processPostRequest,
      processPatchRequest,
      showSpinner,
      startSpinner,
      stopSpinner,
      flushFormData,
      formElement,
    } = useFormModalProcessor(backend.value);

    const formActionHandler = async () => {
      if (formAction.method === "POST")
        await processPostRequest(
          {
            name: formData.name,
            guard_name: formData.guard_name,
          },
          () => {
            datatableRefs.value?.reload();
            flushFormData(formData);
          },
          () => {}
        );

      if (formAction.method === "PATCH")
        await processPatchRequest(
          {
            name: formData.name,
          },
          () => {
            datatableRefs.value?.reload();
            flushFormData(formData);
          },
          () => {}
        );
    };

    return {
      columns: createRoleDataTableColumns(),
      backend,
      formData,
      showFormModal,
      openModal,
      closeModal,
      datatableRefs,
      formAction,
      setupPostAction,
      setupUpdateAction,
      processPostRequest,
      processPatchRequest,
      formActionHandler,
      flushFormData,
      showSpinner,
      startSpinner,
      stopSpinner,
      formElement,
    };
  },
  render() {
    const {
      columns,
      backend,
      formData,
      showFormModal,
      closeModal,
      formAction,
      setupPostAction,
      setupUpdateAction,
      formActionHandler,
      showSpinner,
      formElement,
    } = this;

    const title = computed(() => {
      return formElement.title;
    }).value;

    return (
      <div class={["flex flex-col px-6"]}>
        <PageStatisticHeader
          onClick:buttonCreate={() => {
            setupPostAction();
          }}
        />

        <DatatableServerSide
          ref="datatableRefs"
          path={backend}
          columns={columns}
          onTriggerUpdate={(id) => {
            console.log({
              resource: backend,
              id: id,
            });
            (async () => {
              const { data, isFinished, statusCode } = await useApiService(
                `/${backend}/${id}`
              )
                .get()
                .json();
              setupUpdateAction(id, data, () => {
                formData.name = data.value.data.name;
              });
            })();
          }}
        />

        <FormModal
          title={title}
          spin={showSpinner}
          v-model:show={showFormModal}
          onSubmit={formActionHandler}
          onCancel={() => {
            closeModal();
            formData.name = "";
            formData.guard_name = "";
          }}
        >
          <RoleForm
            v-model:method={formAction.method}
            v-model:name={formData.name}
            v-model:guard={formData.guard_name}
          />
        </FormModal>
      </div>
    );
  },
});
