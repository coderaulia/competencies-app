import type { CompetencyResource } from "./Competency";

export declare type TrainingResource = {
  // id: 4,
  training_job_competency_function: string | null;
  training_job_course_function: string | null;
  training_title: string | null;
  training_level: string | null;
  training_target_group: string | null;
  training_notes: string | null;
  training_delivery_method: string | null;
  training_program_duration: number | null;
  training_day_duration: number | null;
  training_hours_duration: number | null;
  training_objective: string | null;
  training_content: string | null;
  training_competency_level_stack_key: number | null;
  competency_id: number | null;
  competency?: CompetencyResource[] | unknown[];
  // created_at: "2023-01-23 01:18:44",
  // updated_at: "2023-01-23 01:18:44",
};
export declare type TrainingCollections = TrainingResource[];
