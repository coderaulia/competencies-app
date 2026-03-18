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
import FormModal from "@/components/Modal/FormModal";
import useApiService from "@/composables/useApiService";
import useFormModalProcessor from "@/composables/useFormModalProcessor";
import PageStatisticHeader from "@/components/Utils/PageStatisticHeader";
import usePageLoader from "@/composables/usePageLoader";
import DatatableServerSide from "@/components/Datatable/DatatableServerSide";
import AssessmentScheduleForm from "@/components/Forms/AssessmentScheduleForm";
import { createAssessmentScheduleDatatableColumn } from "@/utilities/datatable-utils/Assessment";

export type AssessmentScheduleFormData = {
  assessmentScheduleTitle: Ref<string | null>;
  assessmentSchedulDescription: Ref<string | null>;
  assessmentScheduleYearPeriod: Ref<string | null>;
  assessmentSchedulePhasePeriod: Ref<string | null>;
  assessmentScheduleStartDate: Ref<string | null>;
  assessmentScheduleEndDate: Ref<string | null>;
  assessmentScheduleIsActive: Ref<boolean | number | null>;
};
export default defineComponent({
  name: "AssessmentScheduleIndex",
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

    const backend = ref<string>("assessment_schedules");
    provide("backend", backend);

    const formData = reactive<AssessmentScheduleFormData>({
      assessmentScheduleTitle: ref<string | null>(null),
      assessmentSchedulDescription: ref<string | null>(null),
      assessmentScheduleYearPeriod: ref<string | null>(null),
      assessmentSchedulePhasePeriod: ref<string | null>(null),
      assessmentScheduleStartDate: ref<string | null>(null),
      assessmentScheduleEndDate: ref<string | null>(null),
      assessmentScheduleIsActive: ref<boolean | number | null>(null),
    });

    const assessmentScheduleFormRefs = ref<InstanceType<
      typeof AssessmentScheduleForm
    > | null>(null);
    const assessmentScheduleFormCardRefs = ref<InstanceType<
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
            assessment_schedule_title: formData.assessmentScheduleTitle,
            assessment_schedule_description:
              formData.assessmentSchedulDescription,
            assessment_schedule_year_period:
              formData.assessmentScheduleYearPeriod,
            assessment_schedule_phase_period:
              formData.assessmentSchedulePhasePeriod,
            assessment_schedule_start_date: new Date(
              formData.assessmentScheduleStartDate as string
            ).toLocaleString(),
            assessment_schedule_end_date: new Date(
              formData.assessmentScheduleEndDate as string
            ).toLocaleString(),
            assessment_schedule_is_active: formData.assessmentScheduleIsActive,
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
            assessment_schedule_title: formData.assessmentScheduleTitle,
            assessment_schedule_description:
              formData.assessmentSchedulDescription,
            assessment_schedule_year_period:
              formData.assessmentScheduleYearPeriod,
            assessment_schedule_phase_period:
              formData.assessmentSchedulePhasePeriod,
            assessment_schedule_start_date: new Date(
              formData.assessmentScheduleStartDate as string
            ).toLocaleString(),
            assessment_schedule_end_date: new Date(
              formData.assessmentScheduleEndDate as string
            ).toLocaleString(),
            assessment_schedule_is_active: formData.assessmentScheduleIsActive,
          },
          () => {
            datatableRefs.value?.reload();
            flushFormData(formData);
          },
          () => {}
        );
    };

    return {
      columns: createAssessmentScheduleDatatableColumn(),
      backend,
      formData,
      showFormModal,
      openModal,
      closeModal,
      assessmentScheduleFormRefs,
      assessmentScheduleFormCardRefs,
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
                formData.assessmentScheduleTitle =
                  data.value.data.assessment_schedule_title;
                formData.assessmentSchedulDescription =
                  data.value.data.assessment_schedule_description;
                formData.assessmentScheduleYearPeriod =
                  data.value.data.assessment_schedule_year_period;
                formData.assessmentSchedulePhasePeriod =
                  data.value.data.assessment_schedule_phase_period;
                // @ts-ignore
                formData.assessmentScheduleStartDate = Date.parse(
                  data.value.data.assessment_schedule_start_date
                ) as string;
                // @ts-ignore
                formData.assessmentScheduleEndDate = Date.parse(
                  data.value.data.assessment_schedule_end_date
                ) as string;
                formData.assessmentScheduleIsActive =
                  data.value.data.assessment_schedule_is_active;
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
            formData.assessmentScheduleTitle = null;
            formData.assessmentSchedulDescription = null;
            formData.assessmentScheduleYearPeriod = null;
            formData.assessmentSchedulePhasePeriod = null;
            formData.assessmentScheduleStartDate = null;
            formData.assessmentScheduleEndDate = null;
            formData.assessmentScheduleIsActive = false;
          }}
        >
          <AssessmentScheduleForm
            ref="trainingFormRefs"
            v-model:method={formAction.method}
            v-model:assessmentScheduleTitle={formData.assessmentScheduleTitle}
            v-model:assessmentSchedulDescription={
              formData.assessmentSchedulDescription
            }
            v-model:assessmentScheduleYearPeriod={
              formData.assessmentScheduleYearPeriod
            }
            v-model:assessmentSchedulePhasePeriod={
              formData.assessmentSchedulePhasePeriod
            }
            v-model:assessmentScheduleStartDate={
              formData.assessmentScheduleStartDate
            }
            v-model:assessmentScheduleEndDate={
              formData.assessmentScheduleEndDate
            }
            v-model:assessmentScheduleIsActive={
              formData.assessmentScheduleIsActive
            }
          />
        </FormModal>
      </div>
    );
  },
});
