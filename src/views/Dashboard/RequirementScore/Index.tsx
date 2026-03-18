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
import useApiService from "@/composables/useApiService";
import RequirementScoreForm from "@/components/Forms/RequirementScoreForm";
import DatatableServerSide from "@/components/Datatable/DatatableServerSide";
import FormModal from "@/components/Modal/FormModal";
import { createRequirementScoreDatatableColumn } from "@/utilities/datatable-utils/RequirementScore";
import { NCard } from "naive-ui";
export type RequirementScoreFormData = {
  minimum_score: Ref<number | null>;
  position_id: Ref<number | null>;
  competency_id: Ref<number | null>;
  competency_level_id: Ref<number | null>;
};
export default defineComponent({
  name: "Index",
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

    const backend = ref<string>("requirement_scores");
    provide("backend", backend);

    const formData = reactive<RequirementScoreFormData>({
      minimum_score: ref<number | null>(null),
      position_id: ref<number | null>(null),
      competency_id: ref<number | null>(null),
      competency_level_id: ref<number | null>(null),
    });

    const requirementScoreFormRefs = ref<InstanceType<
      typeof RequirementScoreForm
    > | null>(null);
    const requirementScoreFromCardRefs = ref<InstanceType<
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
            minimum_score: formData.minimum_score,
            competency_id: formData.competency_id,
            competency_level_id: formData.competency_level_id,
            position_id: formData.position_id,
          },
          () => {
            datatableRefs.value?.reload();
            flushFormData(formData, null);
          },
          () => {}
        );

      if (formAction.method === "PATCH")
        await processPatchRequest(
          {
            minimum_score: formData.minimum_score,
            // DONT ALLOW TO MODIFY foreiign key, !
            competency_id: formData.competency_id,
            competency_level_id: formData.competency_level_id,
            position_id: formData.position_id,
          },
          () => {
            datatableRefs.value?.reload();
            flushFormData(formData);
          },
          () => {}
        );
    };

    return {
      columns: createRequirementScoreDatatableColumn(),
      backend,
      formData,
      showFormModal,
      openModal,
      closeModal,
      requirementScoreFormRefs,
      requirementScoreFromCardRefs,
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
                formData.minimum_score = data.value.data.minimum_score;
                formData.competency_id = data.value.data.competency_id;
                formData.competency_level_id =
                  data.value.data.competency_level_id;
                formData.position_id = data.value.data.position_id;
              });
            })();
          }}
        />

        <FormModal
          ref="requirementScoreFormCardRefs"
          title={title}
          spin={showSpinner}
          v-model:show={showFormModal}
          onSubmit={formActionHandler}
          onCancel={() => {
            closeModal(), (formData.minimum_score = 0);
            formData.competency_id = null;
            formData.competency_level_id = null;
            formData.position_id = null;
          }}
        >
          <RequirementScoreForm
            ref="requirementScoreFormRefs"
            v-model:method={formAction.method}
            v-model:minimumScore={formData.minimum_score}
            v-model:competencyId={formData.competency_id}
            v-model:competencyLevelId={formData.competency_level_id}
            v-model:positionId={formData.position_id}
          />
        </FormModal>
      </div>
    );
  },
});
