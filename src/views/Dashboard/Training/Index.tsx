import { onBeforeRouteLeave, onBeforeRouteUpdate } from "vue-router";
import {
  defineComponent,
  ref,
  provide,
  reactive,
  onMounted,
  computed,
  watch,
  onBeforeUnmount,
  onBeforeMount,
  type Ref,
} from "vue";
import { NSpace, NGi, NPageHeader, NGrid, NStatistic, NCard } from "naive-ui";
import DatatableServerSide from "@/components/Datatable/DatatableServerSide";
import { createUserDataTableColumns } from "@/utilities/datatable-utils/User";
// import UserForm from "@/components/Forms/UserForm";
import FormModal from "@/components/Modal/FormModal";
import useApiService from "@/composables/useApiService";
import useFormModalProcessor from "@/composables/useFormModalProcessor";
import PageStatisticHeader from "@/components/Utils/PageStatisticHeader";
import usePageLoader from "@/composables/usePageLoader";
import { createTrainingDatatableColumn } from "@/utilities/datatable-utils/Training";
import TrainingForm from "@/components/Forms/TrainingForm";
export type TrainingFormData = {
  trainingJobCompetencyFunction: Ref<string | number | null>;
  trainingJobCourseFunction: Ref<string | number | null>;
  trainingTitle: Ref<string | number | null>;
  trainingLevel: Ref<string | number | null>;
  trainingTargetGroup: Ref<string | number | null>;
  trainingNotes: Ref<string | number | null>;
  trainingDeliveryMethod: Ref<string | number | null>;
  trainingProgramDuration: Ref<string | number | null>;
  trainingDayDuration: Ref<string | number | null>;
  trainingHoursDuration: Ref<string | number | null>;
  trainingObjective: Ref<string | number | null>;
  trainingContent: Ref<string | number | null>;
  trainingCompetencyLevelStackKey: Ref<string | number | null>;
  competencyId: Ref<string | number | null>;
};
export default defineComponent({
  name: "TrainingIndex",
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

    const backend = ref<string>("trainings");
    provide("backend", backend);

    const formData = reactive<TrainingFormData>({
      trainingJobCompetencyFunction: ref<string | number | null>(null),
      trainingJobCourseFunction: ref<string | number | null>(null),
      trainingTitle: ref<string | number | null>(null),
      trainingLevel: ref<string | number | null>(null),
      trainingTargetGroup: ref<string | number | null>(null),
      trainingNotes: ref<string | number | null>(null),
      trainingDeliveryMethod: ref<string | number | null>(null),
      trainingProgramDuration: ref<string | number | null>(null),
      trainingDayDuration: ref<string | number | null>(null),
      trainingHoursDuration: ref<string | number | null>(null),
      trainingObjective: ref<string | number | null>(null),
      trainingContent: ref<string | number | null>(null),
      trainingCompetencyLevelStackKey: ref<string | number | null>(null),
      competencyId: ref<string | number | null>(null),
    });

    const trainingFormRefs = ref<InstanceType<typeof TrainingForm> | null>(
      null
    );
    const trainingFromCardRefs = ref<InstanceType<typeof FormModal> | null>(
      null
    );
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
            training_job_competency_function:
              formData.trainingJobCompetencyFunction,
            training_job_course_function: formData.trainingJobCourseFunction,
            training_title: formData.trainingTitle,
            training_level: formData.trainingLevel,
            training_target_group: formData.trainingTargetGroup,
            training_notes: formData.trainingNotes,
            training_delivery_method: formData.trainingDeliveryMethod,
            training_program_duration: formData.trainingProgramDuration,
            training_day_duration: formData.trainingDayDuration,
            training_hours_duration: formData.trainingHoursDuration,
            training_objective: formData.trainingObjective,
            training_content: formData.trainingContent,
            training_competency_level_stack_key:
              formData.trainingCompetencyLevelStackKey,
            competency_id: formData.competencyId,
            // competency?: CompetencyResource[] | unknown[],
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
            training_job_competency_function:
              formData.trainingJobCompetencyFunction,
            training_job_course_function: formData.trainingJobCourseFunction,
            training_title: formData.trainingTitle,
            training_level: formData.trainingLevel,
            training_target_group: formData.trainingTargetGroup,
            training_notes: formData.trainingNotes,
            training_delivery_method: formData.trainingDeliveryMethod,
            training_program_duration: formData.trainingProgramDuration,
            training_day_duration: formData.trainingDayDuration,
            training_hours_duration: formData.trainingHoursDuration,
            training_objective: formData.trainingObjective,
            training_content: formData.trainingContent,
            training_competency_level_stack_key:
              formData.trainingCompetencyLevelStackKey,
            competency_id: formData.competencyId,
            // competency?: CompetencyResource[] | unknown[],
          },
          () => {
            datatableRefs.value?.reload();
            flushFormData(formData);
          },
          () => {}
        );
    };

    return {
      columns: createTrainingDatatableColumn(),
      backend,
      formData,
      showFormModal,
      openModal,
      closeModal,
      trainingFormRefs,
      trainingFromCardRefs,
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
          onTriggerUpdate={(id: any) => {
            (async () => {
              const { data } = await useApiService(`/${backend}/${id}`)
                .get()
                .json();
              // console.log(data.value)
              setupUpdateAction(id, data, () => {
                (formData.trainingJobCompetencyFunction =
                  data.value.data.training_job_competency_function),
                  (formData.trainingJobCourseFunction =
                    data.value.data.training_job_course_function),
                  (formData.trainingTitle = data.value.data.training_title),
                  (formData.trainingLevel = data.value.data.training_level),
                  (formData.trainingTargetGroup =
                    data.value.data.training_target_group),
                  (formData.trainingNotes = data.value.data.training_notes),
                  (formData.trainingDeliveryMethod =
                    data.value.data.training_delivery_method),
                  (formData.trainingProgramDuration =
                    data.value.data.training_program_duration),
                  (formData.trainingDayDuration =
                    data.value.data.training_day_duration),
                  (formData.trainingHoursDuration =
                    data.value.data.training_hours_duration),
                  (formData.trainingObjective =
                    data.value.data.training_objective),
                  (formData.trainingContent = data.value.data.training_content),
                  (formData.trainingCompetencyLevelStackKey =
                    data.value.data.training_competency_level_stack_key),
                  (formData.competencyId = data.value.data.competency_id);
              });
            })();
          }}
        />

        <FormModal
          ref="trainingFormCardRefs"
          title={title}
          spin={showSpinner}
          v-model:show={showFormModal}
          onSubmit={formActionHandler}
          onCancel={() => {
            closeModal();
            (formData.trainingJobCompetencyFunction = null),
              (formData.trainingJobCourseFunction = null),
              (formData.trainingTitle = null),
              (formData.trainingLevel = null),
              (formData.trainingTargetGroup = null),
              (formData.trainingNotes = null),
              (formData.trainingDeliveryMethod = null),
              (formData.trainingProgramDuration = null),
              (formData.trainingDayDuration = null),
              (formData.trainingHoursDuration = null),
              (formData.trainingObjective = null),
              (formData.trainingContent = null),
              (formData.trainingCompetencyLevelStackKey = null),
              (formData.competencyId = null);
          }}
        >
          <TrainingForm
            ref="trainingFormRefs"
            v-model:method={formAction.method}
            v-model:trainingJobCompetencyFunction={
              formData.trainingJobCompetencyFunction
            }
            v-model:trainingJobCourseFunction={
              formData.trainingJobCourseFunction
            }
            v-model:trainingTitle={formData.trainingTitle}
            v-model:trainingLevel={formData.trainingLevel}
            v-model:trainingTargetGroup={formData.trainingTargetGroup}
            v-model:trainingNotes={formData.trainingNotes}
            v-model:trainingDeliveryMethod={formData.trainingDeliveryMethod}
            v-model:trainingProgramDuration={formData.trainingProgramDuration}
            v-model:trainingDayDuration={formData.trainingDayDuration}
            v-model:trainingHoursDuration={formData.trainingHoursDuration}
            v-model:trainingObjective={formData.trainingObjective}
            v-model:trainingContent={formData.trainingContent}
            v-model:trainingCompetencyLevelStackKey={
              formData.trainingCompetencyLevelStackKey
            }
            v-model:competencyId={formData.competencyId}
          />
        </FormModal>
      </div>
    );
  },
});
