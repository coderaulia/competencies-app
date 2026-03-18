import DatatableServerSide from "@/components/Datatable/DatatableServerSide";
import PageStatisticHeader from "@/components/Utils/PageStatisticHeader";
import useFormModalProcessor from "@/composables/useFormModalProcessor";
import usePageLoader from "@/composables/usePageLoader";
import {
  computed,
  defineComponent,
  onBeforeMount,
  onMounted,
  provide,
  reactive,
  ref,
  type Ref,
} from "vue";
import FormModal from "@/components/Modal/FormModal";
import CompetencyLevelForm from "@/components/Forms/CompetencyLevelForm";
import useApiService from "@/composables/useApiService";
import { createCompetencyLevelDatatableColumn } from "@/utilities/datatable-utils/CompetencyLevel";
import { NCard } from "naive-ui";
export type CompetencyLevelFromData = {
  competency_level_title: Ref<string>;
  competency_level_name: Ref<string>;
  competency_level_description: Ref<string>;
};
export default defineComponent({
  name: "CompetencylevelIndex",
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

    const backend = ref<string>("competency_levels");
    provide("backend", backend);

    const formData = reactive<CompetencyLevelFromData>({
      competency_level_title: ref<string>(""),
      competency_level_name: ref<string>(""),
      competency_level_description: ref<string>(""),
    });

    const competencyLevelFormRefs = ref<InstanceType<
      typeof CompetencyLevelForm
    > | null>(null);
    const competencyLevelFromCardRefs = ref<InstanceType<
      typeof FormModal
    > | null>(null);
    const datatableRefs = ref<InstanceType<typeof DatatableServerSide> | null>(
      null
    );

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

    const formActionHandler = async () => {
      if (formAction.method === "POST")
        await processPostRequest(
          {
            competency_level_name: formData.competency_level_name,
            competency_level_title: formData.competency_level_title,
            competency_level_description: formData.competency_level_description,
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
            competency_level_name: formData.competency_level_name,
            competency_level_title: formData.competency_level_title,
            competency_level_description: formData.competency_level_description,
          },
          () => {
            datatableRefs.value?.reload();
            flushFormData(formData);
          },
          () => {}
        );
    };

    return {
      columns: createCompetencyLevelDatatableColumn(),
      backend,
      formData,
      showFormModal,
      openModal,
      closeModal,
      competencyLevelFormRefs,
      competencyLevelFromCardRefs,
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
              const { data } = await useApiService(`/${backend}/${id}`)
                .get()
                .json();
              setupUpdateAction(id, data, () => {
                formData.competency_level_name =
                  data.value.data.competency_level_name;
                formData.competency_level_title =
                  data.value.data.competency_level_title;
                formData.competency_level_description =
                  data.value.data.competency_level_description;
              });
            })();
          }}
        />

        <FormModal
          ref="competencyLevelFormCardRefs"
          title={title}
          spin={showSpinner}
          v-model:show={showFormModal}
          onSubmit={formActionHandler}
          onCancel={() => {
            closeModal(),
              (formData.competency_level_name = ""),
              (formData.competency_level_title = ""),
              (formData.competency_level_description = "");
          }}
        >
          <NCard>
            <CompetencyLevelForm
              ref="competencylevelFormRefs"
              v-model:method={formAction.method}
              v-model:name={formData.competency_level_name}
              v-model:title={formData.competency_level_title}
              v-model:description={formData.competency_level_description}
            />
          </NCard>
        </FormModal>
      </div>
    );
  },
});
