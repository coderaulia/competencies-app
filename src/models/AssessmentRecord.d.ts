import type { AssessmentScheduleResource } from "./AssessmentSchedule";
import type { TrainingResource } from "./Training";

export type AssessmentRecordResource = {
  assessment_score: number | null;
  competency_id: number | null;
  competency_level_id: number | null;
  employment_id: number | null;
  gap_score: number | null;
  minimum_score: number | null;
  parent_employment_id: number | null;
  position_id: number | null;
  training_id: number | null;
  idp_exposure_experience: string | null;
  idp_status: string | null;
  training: TrainingResource;
  assessment_schedule_id?: number | null;
  assessmentSchedule?: AssessmentScheduleResource | null;
};
export type AssessmentRecordCollections = AssessmentRecordResource[] | [];
