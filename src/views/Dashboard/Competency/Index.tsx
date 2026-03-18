import DatatableServerSide from "@/components/Datatable/DatatableServerSide";
import CompetencyForm from "@/components/Forms/CompetencyForm";
import FormModal from "@/components/Modal/FormModal";
import PageStatisticHeader from "@/components/Utils/PageStatisticHeader";
import useApiService from "@/composables/useApiService";
import useFormModalProcessor from "@/composables/useFormModalProcessor";
import { createCompetencyDatatableColumn } from "@/utilities/datatable-utils/Competency";
import {
  defineComponent,
  provide,
  ref,
  type Ref,
  reactive,
  computed,
  onMounted,
  onBeforeMount,
} from "vue";
import usePageLoader from "@/composables/usePageLoader";
export type CompetencyFromData = {
  competency_name: Ref<string>;
};
export default defineComponent({
  name: "CompetencyIndex",
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

    const backend = ref<string>("competencies");
    provide("backend", backend);

    const formData = reactive<CompetencyFromData>({
      competency_name: ref<string>(""),
    });

    const positionFormRefs = ref<InstanceType<typeof CompetencyForm> | null>(
      null
    );
    const positionFromCardRefs = ref<InstanceType<typeof FormModal> | null>(
      null
    );
    const datatableRefs = ref<InstanceType<typeof DatatableServerSide> | null>(
      null
    );

    const formActionHandler = async () => {
      if (formAction.method === "POST")
        await processPostRequest(
          {
            competency_name: formData.competency_name,
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
            competency_name: formData.competency_name,
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
      columns: createCompetencyDatatableColumn(),
      backend,
      formData,
      showFormModal,
      openModal,
      closeModal,
      positionFormRefs,
      positionFromCardRefs,
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
      openModal,
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
                formData.competency_name = data.value.data.competency_name;
              });
            })();
          }}
        />

        <FormModal
          ref="userFormCardRefs"
          title={title}
          spin={showSpinner}
          v-model:show={showFormModal}
          onSubmit={formActionHandler}
          onCancel={() => {
            closeModal();
            formData.competency_name = "";
          }}
        >
          <CompetencyForm
            ref="positionFormRefs"
            v-model:method={formAction.method}
            v-model:name={formData.competency_name}
          />
        </FormModal>
      </div>
    );
  },
});
