import type { AssessmentRecordResource } from "@/models/AssessmentRecord";
import type { EmploymentResource } from "@/models/Employment";
import type { PeriodicalGeneralAssessmentResource } from "@/models/PeriodicalGeneralAssessment";
import type { TrainingResource } from "@/models/Training";
import {
  NCollapse,
  NCollapseItem,
  NEmpty,
  NTable,
  NTag,
} from "naive-ui";
import { computed, defineComponent, toRefs, type PropType } from "vue";

function asArray<T>(value: T[] | [] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

export default defineComponent({
  name: "AssessmentHistorySection",
  props: {
    employment: {
      type: Object as PropType<EmploymentResource | null>,
      default: null,
    },
  },
  setup(props) {
    const { employment } = toRefs(props);

    const schedules = computed(() =>
      asArray(employment.value?.appliedAssessmentLogs)
    );

    const assessmentRecords = computed(() =>
      asArray(
        employment.value?.assessmentRecords ??
          employment.value?.assessment_records
      ) as AssessmentRecordResource[]
    );

    const periodicalAssessments = computed(() =>
      asArray(
        employment.value?.periodicalGeneralAssessments ??
          employment.value?.periodical_general_assessments
      ) as PeriodicalGeneralAssessmentResource[]
    );

    const competencyRows = computed(() =>
      asArray(employment.value?.position?.competency_by_level)
    );

    const findAssessmentRecord = (
      scheduleId: number | null | undefined,
      competencyId: number | null | undefined
    ) => {
      return assessmentRecords.value.find(
        (record) =>
          Number(record.assessment_schedule_id) === Number(scheduleId) &&
          Number(record.competency_id) === Number(competencyId)
      );
    };

    const findTrainingTitle = (
      trainings: TrainingResource[] | [] | null | undefined,
      trainingId: number | null | undefined
    ) => {
      if (!trainingId) {
        return null;
      }

      return (
        asArray(trainings).find(
          (training) => Number(training.id) === Number(trainingId)
        )?.training_title ?? null
      );
    };

    const getSchedulePeriodicalAssessments = (scheduleId: number | null | undefined) => {
      return periodicalAssessments.value.filter(
        (record) => Number(record.assessment_schedule_id) === Number(scheduleId)
      );
    };

    return {
      competencyRows,
      findAssessmentRecord,
      findTrainingTitle,
      getSchedulePeriodicalAssessments,
      schedules,
    };
  },
  render() {
    if (!this.schedules.length) {
      return (
        <NEmpty
          description="No assessment history is available yet."
          class={["mt-4"]}
        />
      );
    }

    return (
      <NCollapse>
        {this.schedules.map((schedule) => (
          <NCollapseItem
            key={schedule.id}
            title={`Assessment History: ${schedule.assessment_schedule_title} - ${schedule.assessment_schedule_year_period} - ${schedule.assessment_schedule_phase_period}`}
          >
            <NTable striped>
              <thead>
                <tr>
                  <th>Competency Name</th>
                  <th>Min. Requirement Score</th>
                  <th>Assessment Score</th>
                  <th>Score Gap</th>
                  <th>IDP Status</th>
                  <th>Selected Training</th>
                </tr>
              </thead>
              <tbody>
                {this.competencyRows.map((competency) => {
                  const assessment = this.findAssessmentRecord(
                    schedule.id,
                    competency.id
                  );
                  const trainingTitle = this.findTrainingTitle(
                    competency.trainings,
                    assessment?.training_id
                  );

                  return (
                    <tr key={`${schedule.id}-${competency.id}`}>
                      <td>{competency.competency_name}</td>
                      <td>{competency.minimum_score_by_level?.minimum_score ?? "-"}</td>
                      <td>
                        {assessment?.assessment_score ?? (
                          <NTag type="warning">Not filled</NTag>
                        )}
                      </td>
                      <td>
                        {assessment?.gap_score ?? (
                          <NTag type="warning">Not filled</NTag>
                        )}
                      </td>
                      <td>
                        {assessment?.idp_status ?? (
                          <NTag type="warning">Not filled</NTag>
                        )}
                      </td>
                      <td>
                        {trainingTitle ?? (
                          <NTag type="warning">Not selected</NTag>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </NTable>

            <NTable striped class={["w-full mt-4"]}>
              <thead>
                <tr>
                  <th>Parameter</th>
                  <th>Individual Development Plan (IDP)</th>
                  <th>IDP Status</th>
                </tr>
              </thead>
              <tbody>
                {this.getSchedulePeriodicalAssessments(schedule.id).length ? (
                  this.getSchedulePeriodicalAssessments(schedule.id).map(
                    (parameter) => (
                      <tr key={`${schedule.id}-${parameter.id}`}>
                        <td>{parameter.parameters_name}</td>
                        <td>{parameter.parameters_value ?? "-"}</td>
                        <td>{parameter.status ?? "-"}</td>
                      </tr>
                    )
                  )
                ) : (
                  <tr>
                    <td colSpan={3}>
                      <div class={["py-2 text-sm text-slate-500"]}>
                        No IDP records were saved for this schedule.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </NTable>
          </NCollapseItem>
        ))}
      </NCollapse>
    );
  },
});
