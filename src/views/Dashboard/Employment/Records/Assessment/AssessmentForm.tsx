import useBasicNotification from "@/composables/notifications/useBasicNotification";
import useApiService from "@/composables/useApiService";
import type {
  AssessmentRecordCollections,
  AssessmentRecordResource,
} from "@/models/AssessmentRecord";
import type {
  AssessmentScheduleCollections,
  AssessmentScheduleResource,
} from "@/models/AssessmentSchedule";
import type { EmploymentResource } from "@/models/Employment";
import type { TrainingResource } from "@/models/Training";
import {
  NInput,
  NInputNumber,
  NSpin,
  NTable,
  NAlert,
  NSelect,
  NDivider,
} from "naive-ui";
import {
  defineComponent,
  onMounted,
  toRefs,
  type PropType,
  ref,
  computed,
  watch,
  reactive,
} from "vue";
export type FormType = "POST" | "PACTH";
export default defineComponent({
  name: "EmploymentRecordsAssessmentForm",
  props: {
    data: {
      type: Object as PropType<EmploymentResource>,
      default: null,
    },
  },
  emits: ["submit"],
  setup(props, { emit }) {
    const { data } = toRefs(props);
    const formRecords = ref<[]>([]);
    const schedule = ref<AssessmentScheduleResource | null>(null);
    const scheduleOptions = ref<[]>([]);

    const submitButtonRefs = ref<HTMLButtonElement | null>(null);

    const idpStatusOptions = reactive([
      {
        label: "NOT SELECTED THIS YEAR",
        value: "not-selected-this-year",
      },
      {
        label: "ON GOING",
        value: "on-going",
      },
      {
        label: "PENDING",
        value: "pending",
      },
      {
        label: "DONE",
        value: "done",
      },
    ]);

    const options = [
      {
        label: "NOT SELECTED THIS YEAR",
        value: "not-selected-this-year",
      },
      {
        label: "ON GOING",
        value: "on-going",
      },
      {
        label: "PENDING",
        value: "pending",
      },
      {
        label: "DONE",
        value: "done",
      },
    ];

    const formRecordPeriodical = reactive({
      assessmentSchedule: null,
      employmentId: null,
      parameters: [
        {
          name: "education",
          value: null,
          status: null,
        },
        {
          name: "exposure",
          value: null,
          status: null,
        },
        {
          name: "experience",
          value: null,
          status: null,
        },
      ],
    });

    const eduOptions = ref(options);
    const expoOptions = ref(options);
    const exprOptions = ref(options);

    const getQualifiedTrainingsFrom = (
      trainings: TrainingResource[],
      qualifiedLevelKey: number
    ): (TrainingResource | never)[] => {
      return trainings.filter((e, index) => {
        if (qualifiedLevelKey <= 2) {
          return e.training_competency_level_stack_key === 1;
        }
        if (qualifiedLevelKey > 2 && qualifiedLevelKey <= 4) {
          return e.training_competency_level_stack_key === 2;
        }
        return e.training_competency_level_stack_key === 3;
      });
    };

    const createFormRecordsFromEmployment = (
      employmentResource: EmploymentResource | null | undefined
    ) => {
      return (
        employmentResource?.position?.competency_by_level?.map((element) => {
          return {
            // @ts-ignore
            competencyId: element?.id,
            key: element.competency_name,
            level: element.minimum_score_by_level?.competency_level_id,
            requiredScore: element.minimum_score_by_level?.minimum_score,
            availableTrainings: element.trainings
              ? getQualifiedTrainingsFrom(
                  element.trainings as unknown as TrainingResource[],
                  element.minimum_score_by_level
                    ?.competency_level_id as unknown as number
                )
              : [],
            idpStatus: "",
            value: null,
            gapScore: 0,
            selectedTraining: null,
          };
        }) ?? []
      );
    };

    const computeGapScore = (score: number | null, requiredScore: number | null) => {
      if (score === null || score === undefined) {
        return 0;
      }

      const numericScore = Number(score);
      const numericRequiredScore = Number(requiredScore || 0);
      if (!Number.isFinite(numericScore) || numericScore <= 0) {
        return 0;
      }

      return numericScore <= numericRequiredScore
        ? numericRequiredScore - numericScore
        : 0;
    };

    const qualifiedTrainingOptions = (
      trainings: TrainingResource[]
    ): { label: string; value: number }[] => {
      return trainings.map((training) => {
        return {
          label: training.training_title as string,
          // @ts-ignore
          value: training?.id,
        };
      });
    };

    const formData = reactive({
      assessmentRecord: formRecords.value,
      periodicalAssessmentRecord: formRecordPeriodical,
      // @ts-ignore
      employmentId: data.value?.id,
      // @ts-ignore
      positionId: data.value.position?.id,
    });

    const showSpinner = ref<boolean>(false);

    const notification = useBasicNotification();

    const handlePostAction = async () => {
      showSpinner.value = true;
      const { data, statusCode, isFetching, isFinished, error } =
        await useApiService(
          "/transactions/assessment_record/" +
            computed(() => formData.employmentId).value
        )
          .post(computed(() => formData).value)
          .json();

      if (isFinished.value) {
        showSpinner.value = false;
      }

      if (statusCode.value === 200) {
        notification.notify("success", "SUCCESS", "Success Saved", "");
        emit("submit");
      }

      if (statusCode.value === 422) {
        notification.notify(
          "error",
          "Error " + statusCode.value,
          "Error occured",
          (error.value as string).toString()
        );
      }

      if (statusCode.value === 404) {
        notification.notify(
          "error",
          "Error " + statusCode.value,
          "Error occured",
          (error.value as string).toString()
        );
      }

      if (statusCode.value === 500) {
        notification.notify(
          "error",
          "Error " + statusCode.value,
          "Error occured",
          (error.value as string).toString()
        );
      }
    };

    const setupScheduleOptions = async () => {
      const { data } = await useApiService(
        "/utilities/select_options/assessment_schedules"
      ).json();

      // @ts-ignore
      scheduleOptions.value = (
        data.value.data as AssessmentScheduleCollections
      ).map((item) => {
        return {
          label: `${item.assessment_schedule_title} - ${item.assessment_schedule_year_period} - ${item.assessment_schedule_phase_period}`,
          // @ts-ignore
          value: item.id,
          disabled: !item.assessment_schedule_is_active,
        };
      });
    };

    const setupSelectedScheduleWithID = async (id: number) => {
      const { data } = await useApiService(
        "/assessment_schedules/" + id
      ).json();
      schedule.value = data.value.data as AssessmentScheduleResource;
    };

    const resetPeriodicalParameters = () => {
      formRecordPeriodical.parameters.forEach((parameter) => {
        parameter.value = null;
        parameter.status = null;
      });
    };

    const resetFormRecords = () => {
      formRecords.value.forEach((record: any) => {
        record.idpStatus = "";
        record.value = null;
        record.gapScore = 0;
        record.selectedTraining = null;
      });

      resetPeriodicalParameters();
    };

    const syncFormRecordsFromEmployment = (
      employmentResource: EmploymentResource | null | undefined
    ) => {
      formRecords.value = createFormRecordsFromEmployment(employmentResource) as [];
      formData.assessmentRecord = formRecords.value;
      // @ts-ignore
      formData.employmentId = employmentResource?.id ?? null;
      // @ts-ignore
      formData.positionId = employmentResource?.position?.id ?? null;
    };

    onMounted(() => {
      setupScheduleOptions();
    });

    watch(
      () => data.value,
      (nextEmployment) => {
        syncFormRecordsFromEmployment(nextEmployment);

        if (formRecordPeriodical.assessmentSchedule === null) {
          resetFormRecords();
        }
      },
      { immediate: true }
    );

    watch(
      () => formRecordPeriodical.assessmentSchedule,
      (n, o) => {
        if (n === null) {
          schedule.value = null;
          resetFormRecords();
          return;
        }
        setupSelectedScheduleWithID(n);

        const selectedAssessments = (
          (
            data.value?.assessmentRecords ??
            data.value?.assessment_records ??
            []
          ) as AssessmentRecordResource[]
        ).filter((assessment) => assessment?.assessment_schedule_id === n);

        const assessmentsByCompetencyId = new Map(
          selectedAssessments.map((assessment) => [
            Number(assessment.competency_id),
            assessment,
          ])
        );

        formRecords.value.forEach((record: any) => {
          const existingAssessment = assessmentsByCompetencyId.get(
            Number(record.competencyId)
          );

          record.value = existingAssessment?.assessment_score ?? null;
          record.gapScore =
            existingAssessment?.gap_score ??
            computeGapScore(
              existingAssessment?.assessment_score ?? null,
              record.requiredScore
            );
          record.idpStatus = existingAssessment?.idp_status ?? "";
          record.selectedTraining = existingAssessment?.training_id ?? null;
        });

        const selectedPeriodicalAssessments =
          (
            data.value?.periodicalGeneralAssessments ??
            data.value?.periodical_general_assessments ??
            []
          ) as any[];

        const periodicalByName = new Map(
          selectedPeriodicalAssessments
            .filter((periodicalData) => periodicalData.assessment_schedule_id === n)
            .map((periodicalData) => [
              String(periodicalData.parameters_name || "").toLowerCase(),
              periodicalData,
            ])
        );

        formRecordPeriodical.parameters.forEach((parameter) => {
          const existingParameter = periodicalByName.get(
            String(parameter.name || "").toLowerCase()
          );
          parameter.value = existingParameter?.parameters_value ?? null;
          parameter.status = existingParameter?.status ?? null;
        });
      },
      { immediate: false }
    );

    watch(() => schedule.value, () => undefined);

    return {
      data,
      formRecords,
      formData,
      showSpinner,
      handlePostAction,
      idpStatusOptions,
      qualifiedTrainingOptions,
      eduOptions,
      expoOptions,
      exprOptions,
      formRecordPeriodical,
      schedule,
      scheduleOptions,
      resetFormRecords,
      computeGapScore,
    };
  },
  render() {
    const {
      formRecords,
      formRecordPeriodical,
      formData,
      showSpinner,
      handlePostAction,
      schedule,
      scheduleOptions,
      resetFormRecords,
    } = this;
    return (
      <div>
        {this.data?.position?.competency_by_level?.length ? (
          <div>
            <NSpin show={showSpinner}>
              <NDivider
                v-slots={{
                  default: () => `${""}`,
                }}
              />
              <div class={"my-3"}>
                <NSelect
                  options={scheduleOptions}
                  v-model:value={formRecordPeriodical.assessmentSchedule}
                  clearable
                  filterable
                  remote
                  onClear={() => {
                    resetFormRecords();
                  }}
                />
              </div>
              <div class={["flex flex-row items-center justify-between"]}>
                <div
                  class={[
                    "flex flex-col text-left w-1/2  gap-y-2 font-semibold",
                  ]}
                >
                  <p>Assessment Title : </p>
                  <p>Assessment Description : </p>
                  <p>Assessment Year Period : </p>
                  <p>Assessment Phase Period : </p>
                </div>
                <div class={["flex flex-col text-right w-1/2 gap-y-2 "]}>
                  <p>
                    {schedule?.assessment_schedule_title
                      ? schedule?.assessment_schedule_title
                      : ""}
                  </p>
                  <p>
                    {schedule?.assessment_schedule_description
                      ? schedule?.assessment_schedule_description
                      : ""}
                  </p>
                  <p>
                    {schedule?.assessment_schedule_year_period
                      ? schedule?.assessment_schedule_year_period
                      : ""}
                  </p>
                  <p>
                    {schedule?.assessment_schedule_phase_period
                      ? schedule?.assessment_schedule_phase_period
                      : ""}
                  </p>
                </div>
              </div>
              <NDivider
                v-slots={{
                  default: () => `${""}`,
                }}
              />
              <NTable striped class={["w-full mt-2"]}>
                <thead>
                  <tr>
                    <th>Competency Name</th>
                    <th>Min. Requirement Score</th>
                    <th>Assessment Score</th>
                    <th>Score Gap</th>
                    {/* <th class={["w-24"]}>IDP Exposure & Experience</th> */}
                    <th class={["w-24"]}>Training Recommendation</th>
                    {/* <th class={["w-24"]}>IDP Status</th> */}
                  </tr>
                </thead>
                <tbody>
                  {this.data?.position?.competency_by_level?.map(
                    // @ts-ignore
                    (element, index) => (
                      <tr key={element.competency_name as string}>
                        <td class={["w-64"]}>{element.competency_name}</td>
                        <td class={["w-64"]}>
                          {element.minimum_score_by_level?.minimum_score}
                        </td>
                        <td class={["w-64"]}>
                          <NInputNumber
                            min={0}
                            // @ts-ignore
                            max={formRecords[index].requiredScore}
                            value={formRecords[index].value}
                            onUpdate:value={(value) => {
                              // @ts-ignore
                              formRecords[index].value = value;
                              // @ts-ignore
                              formRecords[index].gapScore = this.computeGapScore(
                                value as number | null,
                                formRecords[index].requiredScore
                              );
                            }}
                          />
                        </td>
                        <td class={["w-64"]}>
                          <NInputNumber
                            // @ts-ignore
                            v-model:value={formRecords[index].gapScore}
                            disabled
                          />
                        </td>
                        {/* <td class={["w-64"]}>
                            <NInput
                              type="text"
                              v-model:value={
                                // @ts-ignore
                                formRecords[index].idpExposureExperience
                              }
                            />
                          </td> */}
                        <td class={["w-64"]}>
                          {/* @ts-ignore */}
                          <NSelect
                            clearable
                            v-model:value={formRecords[index].selectedTraining}
                            options={this.qualifiedTrainingOptions(
                              formRecords[index].availableTrainings
                            )}
                          />
                        </td>
                        {/* @ts-ignore */}
                        {/* <td class={["w-64"]}>
                            <NSelect v-model:value={formRecords[index].idpStatus} options={this.idpStatusOptions} clearable/>
                          </td> */}
                      </tr>
                    )
                  )}
                </tbody>
              </NTable>
              <NDivider
                v-slots={{
                  default: () => `${""}`,
                }}
              />
              <NTable striped class={["w-full mt-2"]}>
                <thead>
                  <tr>
                    <th></th>
                    <th>Individual Development Plan (IDP)</th>
                    <th>IDP Status (Please Select)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class={"w-64"}>Education</td>
                    <td class={"w-64"}>
                      <NInput
                        v-model:value={formRecordPeriodical.parameters[0].value}
                      />
                    </td>
                    <td class={"w-64"}>
                      <NSelect
                        options={this.eduOptions}
                        v-model:value={
                          formRecordPeriodical.parameters[0].status
                        }
                      />
                    </td>
                  </tr>
                  <tr>
                    <td class={"w-64"}>Exposure</td>
                    <td class={"w-64"}>
                      <NInput
                        v-model:value={formRecordPeriodical.parameters[1].value}
                      />
                    </td>
                    <td class={"w-64"}>
                      <NSelect
                        options={this.expoOptions}
                        v-model:value={
                          formRecordPeriodical.parameters[1].status
                        }
                      />
                    </td>
                  </tr>
                  <tr>
                    <td class={"w-64"}>Experience</td>
                    <td class={"w-64"}>
                      <NInput
                        v-model:value={formRecordPeriodical.parameters[2].value}
                      />
                    </td>
                    <td class={"w-64"}>
                      <NSelect
                        options={this.exprOptions}
                        v-model:value={
                          formRecordPeriodical.parameters[2].status
                        }
                      />
                    </td>
                  </tr>
                </tbody>
              </NTable>
            </NSpin>

            <div class={["flex flex-row mt-3 -ml-3"]}>
              <button
                ref="submitButtonRefs"
                disabled={schedule === null}
                onClick={() => {
                  handlePostAction();
                }}
                class={
                  "inline-flex w-full justify-center rounded-md border border-transparent  px-4 py-2 text-base font-medium shadow-sm focus:outline-none sm:ml-3 sm:w-auto sm:text-sm " +
                  (schedule === null
                    ? " cursor-not-allowed opacity-75 bg-gray-100 text-black hover:bg-gray-200"
                    : " cursor-default bg-green-600 hover:bg-green-700 text-white opacity-100")
                }
              >
                Save Assessment Records
              </button>
            </div>
          </div>
        ) : (
          <NAlert title="Warning" type={"warning"} showIcon>
            <div class={["flex flex-row items-center justify-between"]}>
              <div class={["w-1/2"]}>
                Data kompetensi untuk posisi employe terpilih masih kosong !
                silahkan hubungi administrator
              </div>
            </div>
          </NAlert>
        )}
      </div>
    );
  },
});
