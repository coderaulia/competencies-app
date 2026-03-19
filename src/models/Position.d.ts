import type { CompetencyResource } from "./Competency";

/**
 * Position resource.
 *
 * @date 12/5/2022 - 05:19:26
 *
 * @export
 * @typedef {PositionResource}
 */
export declare type PositionResource = {
  id?: number | null;
  position_name: string | null;
  attachedCompetenciesCount?: number | null;
  competency_by_level?: CompetencyResource[] | [];
};
export declare type PositionCollections = PositionResource[];
