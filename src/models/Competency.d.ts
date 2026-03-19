import type { RequirementScoreResource } from "./RequirementScore";
import type { TrainingResource } from "./Training";

/**
 * Competency resource.
 * @date 12/5/2022 - 05:20:06
 *
 * @export
 * @typedef {CompetencyResource}
 */
export declare type CompetencyResource = {
  id?: number | null;
  competency_name: string | null;
  minimum_score_by_level: RequirementScoreResource | null;
  trainings: TrainingResource[] | unknown[];
};
export declare type CompetencyCollections = CompetencyResource[];
