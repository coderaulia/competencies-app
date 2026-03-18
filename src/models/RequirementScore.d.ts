import type { CompetencyLevelResource } from "./CompetencyLevel";
import type { PositionResource } from "./Position";

export declare type RequirementScoreResource = {
  minimum_score: number | null;
  position_id: number | null;
  competency_id: number | null;
  competency_level_id: number | null;
  position: PositionResource | null;
  competency: CompetencyResource | null;
  level: CompetencyLevelResource | null;
};
export declare type RequirementScoreCollections = RequirementScoreResource[];
