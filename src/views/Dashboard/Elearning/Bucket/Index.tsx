import PageStatisticHeader from "@/components/Utils/PageStatisticHeader";
import DatatableServerSide from "@/components/Datatable/DatatableServerSide";
import { createBucketDatatableColumn } from "@/utilities/datatable-utils/Bucket";
import usePageLoader from "@/composables/usePageLoader";
import useApiService from "@/composables/useApiService";
import useFormModalProcessor from "@/composables/useFormModalProcessor";
import {
  defineComponent,
  ref,
  reactive,
  onMounted,
  onBeforeMount,
  provide,
  computed,
} from "vue";
import type { Ref } from "vue";
import FormModal from "@/components/Modal/FormModal";
import BucketForm from "@/components/Forms/BucketForm";
export type BucketFormData = {
  bucket_name: Ref<string | null>;
  bucket_description: Ref<string | null>;
  bucket_has_public_access: Ref<boolean | null>;
};
export default defineComponent({
  name: "BucketIndex",
  setup(props) {
    const { loadingStart, loadingFinish } = usePageLoader();

    onBeforeMount(() => {
      loadingStart();
    });
    onMounted(() => {
      setTimeout(() => {
        loadingFinish();
      }, 500);
    });

    const backend = ref<string>("buckets");
    provide("backend", backend);
    const formData = reactive<BucketFormData>({
      bucket_name: ref<string>(""),
      bucket_description: ref<string>(""),
      bucket_has_public_access: ref<boolean>(false),
    });
    const bucketFormRefs = ref<InstanceType<typeof BucketForm> | null>(null);
    const bucketFromCardRefs = ref<InstanceType<typeof FormModal> | null>(null);
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
            bucket_name: formData.bucket_name,
            bucket_description: formData.bucket_description,
            bucket_has_public_access: formData.bucket_has_public_access,
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
            bucket_name: formData.bucket_name,
            bucket_description: formData.bucket_description,
            bucket_has_public_access: formData.bucket_has_public_access,
          },
          () => {
            datatableRefs.value?.reload();
            flushFormData(formData);
          },
          () => {}
        );
    };

    return {
      columns: createBucketDatatableColumn(),
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
            (async () => {
              const { data, isFinished, statusCode } = await useApiService(
                `/${backend}/${id}`
              )
                .get()
                .json();
              setupUpdateAction(id, data, () => {
                formData.bucket_name = data.value.data.bucket_name;
                formData.bucket_description =
                  data.value.data.bucket_description;
                formData.bucket_has_public_access =
                  data.value.data.bucket_has_public_access;
              });
            })();
          }}
        />
        <FormModal
          ref="bucektFormCardRefs"
          title={title}
          spin={showSpinner}
          v-model:show={showFormModal}
          onSubmit={formActionHandler}
          onCancel={() => {
            closeModal(), (formData.bucket_name = null);
            formData.bucket_description = null;
            formData.bucket_description = null;
          }}
        >
          <BucketForm
            v-model:method={formAction.method}
            v-model:bucketName={formData.bucket_name}
            v-model:bucketDescription={formData.bucket_description}
            v-model:bucketHasPublicAccess={formData.bucket_has_public_access}
          />
        </FormModal>
      </div>
    );
  },
});
