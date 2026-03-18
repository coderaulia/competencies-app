import {
  defineComponent,
  ref,
  type Ref,
  reactive,
  provide,
  computed,
  onBeforeMount,
  onMounted,
} from "vue";
import DatatableServerSide from "@/components/Datatable/DatatableServerSide";
import { createPermissionDataTableColumns } from "@/utilities/datatable-utils/Permission";
import FormModal from "@/components/Modal/FormModal";
import PermissionForm from "@/components/Forms/PermissionForm";
import useApiService from "@/composables/useApiService";
import useFormModalProcessor from "@/composables/useFormModalProcessor";
import PageStatisticHeader from "@/components/Utils/PageStatisticHeader";
import usePageLoader from "@/composables/usePageLoader";
export type PermissionFromData = {
  name: Ref<string>;
  group: Ref<string>;
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

    const backend = ref<string>("permissions");
    provide("backend", backend);
    const formData = reactive<PermissionFromData>({
      name: ref<string>(""),
      group: ref<string>(""),
      guard_name: ref<string>(""),
    });

    const permissionFormRefs = ref<InstanceType<typeof PermissionForm> | null>(
      null
    );
    const permissionFromCardRefs = ref<InstanceType<typeof FormModal> | null>(
      null
    );
    const datatableRefs = ref<InstanceType<typeof DatatableServerSide> | null>(
      null
    );

    const formActionHandler = async () => {
      if (formAction.method === "POST")
        await processPostRequest(
          {
            name: formData.name,
            group: formData.group,
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

    const {
      showFormModal,
      openModal,
      closeModal,
      setupPostAction,
      setupUpdateAction,
      processPostRequest,
      processPatchRequest,
      showSpinner,
      startSpinner,
      stopSpinner,
      formAction,
      flushFormData,
      formElement,
    } = useFormModalProcessor(backend.value);

    return {
      columns: createPermissionDataTableColumns(),
      backend,
      formData,
      showFormModal,
      openModal,
      closeModal,
      permissionFormRefs,
      permissionFromCardRefs,
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
            (async () => {
              const { data, isFinished, statusCode } = await useApiService(
                `/${backend}/${id}`
              )
                .get()
                .json();
              setupUpdateAction(id, data, () => {
                formData.name = data.value.data.name;
                formData.group = data.value.data.group;
              });
            })();
          }}
        />

        <FormModal
          ref="permissionFormCardRefs"
          title={title}
          spin={showSpinner}
          v-model:show={showFormModal}
          onSubmit={formActionHandler}
          onCancel={() => {
            closeModal();
            formData.name = "";
            formData.group = "";
            formData.guard_name = "";
          }}
        >
          <PermissionForm
            ref="permissionFormRefs"
            v-model:method={formAction.method}
            v-model:name={formData.name}
            v-model:group={formData.group}
            v-model:guard={formData.guard_name}
          />
        </FormModal>
      </div>
    );
  },
});
