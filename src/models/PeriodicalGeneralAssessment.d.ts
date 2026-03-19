import type { AssessmentScheduleResource } from "./AssessmentSchedule";
import type { EmploymentResource } from "./Employment";

export type PeriodicalGeneralAssessmentResource = {
  id?: number | null;
  employment_id: number | null;
  assessment_schedule_id: number | null;
  parameters_name: string | null;
  parameters_value: string | null;
  status: string | null;
  employment?: EmploymentResource | null;
  assessment_schedule?: AssessmentScheduleResource | null;
};

export type PeriodicalGeneralAssessmentCollections =
  | PeriodicalGeneralAssessmentResource[]
  | [];
