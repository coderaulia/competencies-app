export type AssessmentScheduleResource = {
  assessment_schedule_title: string | null;
  assessment_schedule_description: string | null;
  assessment_schedule_year_period: string | null;
  assessment_schedule_phase_period: string | null;
  assessment_schedule_start_date: string | null;
  assessment_schedule_end_date: string | null;
  assessment_schedule_is_active: string | null;
};
export type AssessmentScheduleCollections = AssessmentScheduleResource[] | [];
