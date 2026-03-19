"use strict";

const crypto = require("node:crypto");
const { createSeedState } = require("./data");
const { hashPassword } = require("./security");

const clone = (value) => JSON.parse(JSON.stringify(value));

const RESOURCE_COLLECTION_ALIASES = {
  assessments: "assessment_records",
  assessment_records: "assessment_records",
  periodical_general_assessments: "periodical_general_assessments",
};

const GENERIC_RESOURCES = new Set([
  "users",
  "roles",
  "permissions",
  "profiles",
  "companies",
  "directorats",
  "personel_areas",
  "personel_sub_areas",
  "plant_areas",
  "organizations",
  "departments",
  "organization_functions",
  "positions",
  "competencies",
  "competency_levels",
  "trainings",
  "certifications",
  "requirement_scores",
  "assessment_schedules",
  "assessments",
  "assessment_records",
  "periodical_general_assessments",
  "employments",
  "buckets",
  "publications",
  "publication_storages",
  "publication_categories",
  "bucket_categories",
]);

function createStore(initialCollections = null) {
  const seedState = createSeedState();
  const collections = clone(initialCollections || seedState);
  const counters = {};

  Object.entries(seedState).forEach(([key, value]) => {
    if (collections[key] === undefined) {
      collections[key] = clone(value);
    }
  });

  for (const [key, records] of Object.entries(collections)) {
    if (!Array.isArray(records)) {
      continue;
    }

    const highestId = records.reduce((maxId, record) => {
      const candidate = Number(record.id) || 0;
      return candidate > maxId ? candidate : maxId;
    }, 0);

    counters[key] = highestId + 1;
  }

  return {
    collections,
    counters,
  };
}

function nowIso() {
  return new Date().toISOString();
}

function nextId(store, collectionName) {
  if (!store.counters[collectionName]) {
    store.counters[collectionName] = 1;
  }

  const id = store.counters[collectionName];
  store.counters[collectionName] += 1;
  return id;
}

function isGenericResource(resource) {
  return GENERIC_RESOURCES.has(resource);
}

function resolveCollectionName(collectionName) {
  return RESOURCE_COLLECTION_ALIASES[collectionName] || collectionName;
}

function getCollection(store, collectionName) {
  return store.collections[resolveCollectionName(collectionName)] || null;
}

function findById(store, collectionName, id) {
  const collection = getCollection(store, collectionName);
  if (!Array.isArray(collection)) {
    return null;
  }

  return (
    collection.find((record) => Number(record.id) === Number(id)) || null
  );
}

function findProfileForUser(store, userId) {
  return (
    store.collections.profiles.find(
      (profile) => Number(profile.user_id) === Number(userId)
    ) || null
  );
}

function findUserForProfile(store, profileId) {
  const profile = findById(store, "profiles", profileId);
  if (!profile) {
    return null;
  }

  return findById(store, "users", profile.user_id);
}

function findEmploymentForProfile(store, profileId) {
  return (
    store.collections.employments.find(
      (employment) => Number(employment.profile_id) === Number(profileId)
    ) || null
  );
}

function timestamps(record) {
  return {
    created_at: record.created_at || nowIso(),
    updated_at: record.updated_at || record.created_at || nowIso(),
  };
}

function toInteger(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function paginate(items, query = {}) {
  const page = toInteger(query.page, 1);
  const limit = toInteger(query.limit, 10);
  const total = items.length;
  const lastPage = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.min(page, lastPage);
  const offset = (currentPage - 1) * limit;
  const sliced = items.slice(offset, offset + limit);
  const from = total === 0 ? 0 : offset + 1;
  const to = total === 0 ? 0 : offset + sliced.length;

  return {
    data: sliced,
    meta: {
      current_page: currentPage,
      from,
      to,
      last_page: lastPage,
      links: [],
      per_page: limit,
      total,
    },
  };
}

function toRootPagination(payload) {
  return {
    data: payload.data,
    ...payload.meta,
  };
}

function collectPrimitiveValues(value, bucket = []) {
  if (value === null || value === undefined) {
    return bucket;
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    bucket.push(String(value));
    return bucket;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectPrimitiveValues(item, bucket));
    return bucket;
  }

  if (typeof value === "object") {
    Object.values(value).forEach((item) => collectPrimitiveValues(item, bucket));
  }

  return bucket;
}

function matchesSearch(record, keyword) {
  if (!keyword) {
    return true;
  }

  const haystack = collectPrimitiveValues(record).join(" ").toLowerCase();
  return haystack.includes(String(keyword).trim().toLowerCase());
}

function applyScopes(store, resource, records, scopes = []) {
  if (!Array.isArray(scopes) || scopes.length === 0) {
    return records;
  }

  return records.filter((record) => {
    return scopes.every((scope) => {
      const scopeName = scope?.name;
      if (!scopeName) {
        return true;
      }

      if (resource === "positions") {
        const hasRequirements = store.collections.requirement_scores.some(
          (item) => Number(item.position_id) === Number(record.id)
        );

        if (scopeName === "hasCompetencyThroughLevels") {
          return hasRequirements;
        }

        if (scopeName === "doesntHaveCompetencyThroughLevels") {
          return !hasRequirements;
        }
      }

      return true;
    });
  });
}

function simpleSummary(record, fields) {
  if (!record) {
    return null;
  }

  const summary = { id: record.id };
  fields.forEach((field) => {
    summary[field] = record[field] ?? null;
  });

  return {
    ...summary,
    ...timestamps(record),
  };
}

function normalizeNullableId(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function normalizeNullableNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeIdList(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(value.map((item) => normalizeNullableId(item)).filter(Boolean))
  );
}

function normalizeDateValue(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const timestamp = value > 1e12 ? value : value * 1000;
    return new Date(timestamp).toISOString();
  }

  const text = String(value).trim();
  if (!text) {
    return null;
  }

  if (/^\d+$/.test(text)) {
    const numeric = Number(text);
    const timestamp = numeric > 1e12 ? numeric : numeric * 1000;
    return new Date(timestamp).toISOString();
  }

  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? text : parsed.toISOString();
}

function normalizeEmploymentPayload(payload = {}) {
  const normalizedPayload = { ...payload };
  delete normalizedPayload.department_function_id;

  const organizationFunctionValue = Object.prototype.hasOwnProperty.call(
    payload,
    "organization_function_id"
  )
    ? payload.organization_function_id
    : payload.department_function_id;

  return {
    ...normalizedPayload,
    employment_hiring_date: Object.prototype.hasOwnProperty.call(
      payload,
      "employment_hiring_date"
    )
      ? normalizeDateValue(payload.employment_hiring_date)
      : payload.employment_hiring_date,
    employment_end_date: Object.prototype.hasOwnProperty.call(
      payload,
      "employment_end_date"
    )
      ? normalizeDateValue(payload.employment_end_date)
      : payload.employment_end_date,
    parent_employment_id: Object.prototype.hasOwnProperty.call(
      payload,
      "parent_employment_id"
    )
      ? normalizeNullableId(payload.parent_employment_id)
      : payload.parent_employment_id,
    profile_id: Object.prototype.hasOwnProperty.call(payload, "profile_id")
      ? normalizeNullableId(payload.profile_id)
      : payload.profile_id,
    position_id: Object.prototype.hasOwnProperty.call(payload, "position_id")
      ? normalizeNullableId(payload.position_id)
      : payload.position_id,
    company_id: Object.prototype.hasOwnProperty.call(payload, "company_id")
      ? normalizeNullableId(payload.company_id)
      : payload.company_id,
    directorat_id: Object.prototype.hasOwnProperty.call(payload, "directorat_id")
      ? normalizeNullableId(payload.directorat_id)
      : payload.directorat_id,
    personel_area_id: Object.prototype.hasOwnProperty.call(
      payload,
      "personel_area_id"
    )
      ? normalizeNullableId(payload.personel_area_id)
      : payload.personel_area_id,
    personel_sub_area_id: Object.prototype.hasOwnProperty.call(
      payload,
      "personel_sub_area_id"
    )
      ? normalizeNullableId(payload.personel_sub_area_id)
      : payload.personel_sub_area_id,
    plant_area_id: Object.prototype.hasOwnProperty.call(payload, "plant_area_id")
      ? normalizeNullableId(payload.plant_area_id)
      : payload.plant_area_id,
    organization_id: Object.prototype.hasOwnProperty.call(
      payload,
      "organization_id"
    )
      ? normalizeNullableId(payload.organization_id)
      : payload.organization_id,
    department_id: Object.prototype.hasOwnProperty.call(payload, "department_id")
      ? normalizeNullableId(payload.department_id)
      : payload.department_id,
    organization_function_id:
      organizationFunctionValue !== undefined
        ? normalizeNullableId(organizationFunctionValue)
        : payload.organization_function_id,
  };
}

function normalizeBucketPayload(payload = {}) {
  return {
    ...payload,
    bucket_category_id: Object.prototype.hasOwnProperty.call(
      payload,
      "bucket_category_id"
    )
      ? normalizeNullableId(payload.bucket_category_id)
      : payload.bucket_category_id,
    bucket_author_employment_id: Object.prototype.hasOwnProperty.call(
      payload,
      "bucket_author_employment_id"
    )
      ? normalizeNullableId(payload.bucket_author_employment_id)
      : payload.bucket_author_employment_id,
    bucket_has_public_access: Object.prototype.hasOwnProperty.call(
      payload,
      "bucket_has_public_access"
    )
      ? Boolean(payload.bucket_has_public_access)
      : payload.bucket_has_public_access,
  };
}

function normalizeTrainingPayload(payload = {}) {
  return {
    ...payload,
    training_program_duration: Object.prototype.hasOwnProperty.call(
      payload,
      "training_program_duration"
    )
      ? normalizeNullableNumber(payload.training_program_duration)
      : payload.training_program_duration,
    training_day_duration: Object.prototype.hasOwnProperty.call(
      payload,
      "training_day_duration"
    )
      ? normalizeNullableNumber(payload.training_day_duration)
      : payload.training_day_duration,
    training_hours_duration: Object.prototype.hasOwnProperty.call(
      payload,
      "training_hours_duration"
    )
      ? normalizeNullableNumber(payload.training_hours_duration)
      : payload.training_hours_duration,
    training_competency_level_stack_key: Object.prototype.hasOwnProperty.call(
      payload,
      "training_competency_level_stack_key"
    )
      ? normalizeNullableId(payload.training_competency_level_stack_key)
      : payload.training_competency_level_stack_key,
    competency_id: Object.prototype.hasOwnProperty.call(payload, "competency_id")
      ? normalizeNullableId(payload.competency_id)
      : payload.competency_id,
  };
}

function normalizeRequirementScorePayload(payload = {}) {
  return {
    ...payload,
    minimum_score: Object.prototype.hasOwnProperty.call(payload, "minimum_score")
      ? normalizeNullableNumber(payload.minimum_score)
      : payload.minimum_score,
    position_id: Object.prototype.hasOwnProperty.call(payload, "position_id")
      ? normalizeNullableId(payload.position_id)
      : payload.position_id,
    competency_id: Object.prototype.hasOwnProperty.call(payload, "competency_id")
      ? normalizeNullableId(payload.competency_id)
      : payload.competency_id,
    competency_level_id: Object.prototype.hasOwnProperty.call(
      payload,
      "competency_level_id"
    )
      ? normalizeNullableId(payload.competency_level_id)
      : payload.competency_level_id,
  };
}

function normalizeAssessmentRecordPayload(payload = {}) {
  return {
    ...payload,
    assessment_score: Object.prototype.hasOwnProperty.call(
      payload,
      "assessment_score"
    )
      ? normalizeNullableNumber(payload.assessment_score)
      : payload.assessment_score,
    competency_id: Object.prototype.hasOwnProperty.call(payload, "competency_id")
      ? normalizeNullableId(payload.competency_id)
      : payload.competency_id,
    competency_level_id: Object.prototype.hasOwnProperty.call(
      payload,
      "competency_level_id"
    )
      ? normalizeNullableId(payload.competency_level_id)
      : payload.competency_level_id,
    employment_id: Object.prototype.hasOwnProperty.call(payload, "employment_id")
      ? normalizeNullableId(payload.employment_id)
      : payload.employment_id,
    gap_score: Object.prototype.hasOwnProperty.call(payload, "gap_score")
      ? normalizeNullableNumber(payload.gap_score)
      : payload.gap_score,
    minimum_score: Object.prototype.hasOwnProperty.call(payload, "minimum_score")
      ? normalizeNullableNumber(payload.minimum_score)
      : payload.minimum_score,
    parent_employment_id: Object.prototype.hasOwnProperty.call(
      payload,
      "parent_employment_id"
    )
      ? normalizeNullableId(payload.parent_employment_id)
      : payload.parent_employment_id,
    position_id: Object.prototype.hasOwnProperty.call(payload, "position_id")
      ? normalizeNullableId(payload.position_id)
      : payload.position_id,
    training_id: Object.prototype.hasOwnProperty.call(payload, "training_id")
      ? normalizeNullableId(payload.training_id)
      : payload.training_id,
    assessment_schedule_id: Object.prototype.hasOwnProperty.call(
      payload,
      "assessment_schedule_id"
    )
      ? normalizeNullableId(payload.assessment_schedule_id)
      : payload.assessment_schedule_id,
  };
}

function normalizePeriodicalAssessmentPayload(payload = {}) {
  return {
    ...payload,
    employment_id: Object.prototype.hasOwnProperty.call(payload, "employment_id")
      ? normalizeNullableId(payload.employment_id)
      : payload.employment_id,
    assessment_schedule_id: Object.prototype.hasOwnProperty.call(
      payload,
      "assessment_schedule_id"
    )
      ? normalizeNullableId(payload.assessment_schedule_id)
      : payload.assessment_schedule_id,
  };
}

function normalizePublicationStoragePayload(payload = {}) {
  return {
    ...payload,
    publication_id: Object.prototype.hasOwnProperty.call(payload, "publication_id")
      ? normalizeNullableId(payload.publication_id)
      : payload.publication_id,
    storageable_id: Object.prototype.hasOwnProperty.call(payload, "storageable_id")
      ? normalizeNullableId(payload.storageable_id)
      : payload.storageable_id,
  };
}

function getPermissionNamesForUser(store, user) {
  const directPermissionNames = (user.permission_ids || [])
    .map((id) => findById(store, "permissions", id))
    .filter(Boolean)
    .map((permission) => permission.name);

  const rolePermissionNames = (user.role_ids || [])
    .map((id) => findById(store, "roles", id))
    .filter(Boolean)
    .flatMap((role) => role.permission_ids || [])
    .map((id) => findById(store, "permissions", id))
    .filter(Boolean)
    .map((permission) => permission.name);

  return Array.from(new Set([...directPermissionNames, ...rolePermissionNames]));
}

function userBasic(store, user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
      email: user.email,
      email_verified_at: user.email_verified_at,
    ...timestamps(user),
  };
}

function permissionSummary(store, permission, options = {}) {
  if (!permission) {
    return null;
  }

  const includeUsers = options.includeUsers !== false;
  const includeRoles = options.includeRoles !== false;

  const relatedRoles = store.collections.roles.filter((role) =>
    (role.permission_ids || []).includes(permission.id)
  );

  const relatedUsers = store.collections.users.filter((user) => {
    const hasDirectPermission = (user.permission_ids || []).includes(permission.id);
    const hasPermissionThroughRole = (user.role_ids || []).some((roleId) =>
      relatedRoles.some((role) => Number(role.id) === Number(roleId))
    );
    return hasDirectPermission || hasPermissionThroughRole;
  });

  return {
    id: permission.id,
    name: permission.name,
    group: permission.group,
    guard_name: permission.guard_name,
    users: includeUsers
      ? relatedUsers.map((user) =>
          userSummary(store, user, {
            includeRoles: false,
            includePermissions: false,
            includeProfileEmployment: false,
          })
        )
      : [],
    roles: includeRoles
      ? relatedRoles.map((role) =>
          roleSummary(store, role, {
            includeUsers: false,
            includePermissions: false,
          })
        )
      : [],
    ...timestamps(permission),
  };
}

function roleSummary(store, role, options = {}) {
  if (!role) {
    return null;
  }

  const includeUsers = options.includeUsers !== false;
  const includePermissions = options.includePermissions !== false;

  return {
    id: role.id,
    name: role.name,
    guard_name: role.guard_name,
    permissions: includePermissions
      ? (role.permission_ids || [])
          .map((id) => findById(store, "permissions", id))
          .filter(Boolean)
          .map((permission) =>
            permissionSummary(store, permission, {
              includeUsers: false,
              includeRoles: false,
            })
          )
      : [],
    users: includeUsers
      ? store.collections.users
          .filter((user) => (user.role_ids || []).includes(role.id))
          .map((user) =>
            userSummary(store, user, {
              includeRoles: false,
              includePermissions: false,
              includeProfileEmployment: false,
            })
          )
      : [],
    ...timestamps(role),
  };
}

function companySummary(record) {
  return simpleSummary(record, ["company_name"]);
}

function directoratSummary(record) {
  return simpleSummary(record, ["directorat_name"]);
}

function personelAreaSummary(record) {
  return simpleSummary(record, ["personel_area_text"]);
}

function personelSubAreaSummary(record) {
  return simpleSummary(record, ["personel_sub_area_text"]);
}

function plantAreaSummary(record) {
  return simpleSummary(record, ["plant_area_name"]);
}

function organizationSummary(record) {
  return simpleSummary(record, ["organization_name"]);
}

function departmentSummary(record) {
  return simpleSummary(record, ["department_name"]);
}

function organizationFunctionSummary(record) {
  return simpleSummary(record, ["organization_function_name"]);
}

function competencyLevelSummary(record) {
  return simpleSummary(record, [
    "competency_level_title",
    "competency_level_name",
    "competency_level_description",
  ]);
}

function bucketCategorySummary(record) {
  return simpleSummary(record, [
    "bucket_category_name",
    "bucket_category_description",
  ]);
}

function publicationCategorySummary(record) {
  return simpleSummary(record, [
    "publication_category_name",
    "publication_category_description",
  ]);
}

function profileSummary(store, profile, options = {}) {
  if (!profile) {
    return null;
  }

  const includeUser = options.includeUser !== false;
  const includeEmployment = options.includeEmployment === true;

  return {
    id: profile.id,
    profile_fullname: profile.profile_fullname,
    profile_gender: profile.profile_gender,
    profile_place_of_birth: profile.profile_place_of_birth,
    profile_date_of_birth: profile.profile_date_of_birth,
    profile_marital_status: profile.profile_marital_status,
    profile_nationality: profile.profile_nationality,
    profile_religion: profile.profile_religion,
    user_id: profile.user_id,
    user: includeUser ? userBasic(store, findById(store, "users", profile.user_id)) : null,
    employment: includeEmployment
      ? employmentSummary(
          store,
          findEmploymentForProfile(store, profile.id),
          {
            includeProfile: false,
          }
        )
      : null,
    ...timestamps(profile),
  };
}

function requirementScoreSummary(store, requirementScore, options = {}) {
  if (!requirementScore) {
    return null;
  }

  return {
    id: requirementScore.id,
    minimum_score: requirementScore.minimum_score,
    position_id: requirementScore.position_id,
    competency_id: requirementScore.competency_id,
    competency_level_id: requirementScore.competency_level_id,
    position:
      options.includePosition === false
        ? null
        : positionSummary(store, findById(store, "positions", requirementScore.position_id), {
            includeCompetencies: false,
          }),
    competency:
      options.includeCompetency === false
        ? null
        : competencySummary(
            store,
            findById(store, "competencies", requirementScore.competency_id),
            { includeTrainings: false, includeRequirement: false }
          ),
    level:
      options.includeLevel === false
        ? null
        : competencyLevelSummary(
            findById(store, "competency_levels", requirementScore.competency_level_id)
          ),
    ...timestamps(requirementScore),
  };
}

function trainingSummary(store, training, options = {}) {
  if (!training) {
    return null;
  }

  return {
    id: training.id,
    training_job_competency_function: training.training_job_competency_function,
    training_job_course_function: training.training_job_course_function,
    training_title: training.training_title,
    training_level: training.training_level,
    training_target_group: training.training_target_group,
    training_notes: training.training_notes,
    training_delivery_method: training.training_delivery_method,
    training_program_duration: training.training_program_duration,
    training_day_duration: training.training_day_duration,
    training_hours_duration: training.training_hours_duration,
    training_objective: training.training_objective,
    training_content: training.training_content,
    training_competency_level_stack_key:
      training.training_competency_level_stack_key,
    competency_id: training.competency_id,
    competency:
      options.includeCompetency === false
        ? null
        : competencySummary(
            store,
            findById(store, "competencies", training.competency_id),
            { includeTrainings: false, includeRequirement: false }
          ),
    ...timestamps(training),
  };
}

function competencySummary(store, competency, options = {}) {
  if (!competency) {
    return null;
  }

  const includeTrainings = options.includeTrainings !== false;
  const includeRequirement = options.includeRequirement !== false;

  let minimumScoreByLevel = null;

  if (includeRequirement && options.positionId) {
    minimumScoreByLevel = requirementScoreSummary(
      store,
      store.collections.requirement_scores.find(
        (item) =>
          Number(item.position_id) === Number(options.positionId) &&
          Number(item.competency_id) === Number(competency.id)
      ),
      {
        includePosition: false,
        includeCompetency: false,
        includeLevel: true,
      }
    );
  }

  return {
    id: competency.id,
    competency_name: competency.competency_name,
    minimum_score_by_level: minimumScoreByLevel,
    trainings: includeTrainings
      ? store.collections.trainings
          .filter(
            (training) => Number(training.competency_id) === Number(competency.id)
          )
          .map((training) =>
            trainingSummary(store, training, {
              includeCompetency: false,
            })
          )
      : [],
    ...timestamps(competency),
  };
}

function positionSummary(store, position, options = {}) {
  if (!position) {
    return null;
  }

  const includeCompetencies = options.includeCompetencies !== false;
  const attachedCompetenciesCount = store.collections.requirement_scores.filter(
    (item) => Number(item.position_id) === Number(position.id)
  ).length;

  return {
    id: position.id,
    position_name: position.position_name,
    attachedCompetenciesCount,
    attachedComptenciesCount: attachedCompetenciesCount,
    competency_by_level: includeCompetencies
      ? store.collections.requirement_scores
          .filter((item) => Number(item.position_id) === Number(position.id))
          .map((item) =>
            competencySummary(
              store,
              findById(store, "competencies", item.competency_id),
              {
                positionId: position.id,
              }
            )
          )
      : [],
    ...timestamps(position),
  };
}

function assessmentScheduleSummary(record) {
  if (!record) {
    return null;
  }

  return {
    id: record.id,
    assessment_schedule_title: record.assessment_schedule_title,
    assessment_schedule_description: record.assessment_schedule_description,
    assessment_schedule_year_period: record.assessment_schedule_year_period,
    assessment_schedule_phase_period: record.assessment_schedule_phase_period,
    assessment_schedule_start_date: record.assessment_schedule_start_date,
    assessment_schedule_end_date: record.assessment_schedule_end_date,
    assessment_schedule_is_active: record.assessment_schedule_is_active,
    ...timestamps(record),
  };
}

function assessmentRecordSummary(store, record) {
  if (!record) {
    return null;
  }

  return {
    id: record.id,
    assessment_score: record.assessment_score,
    competency_id: record.competency_id,
    competency_level_id: record.competency_level_id,
    employment_id: record.employment_id,
    gap_score: record.gap_score,
    minimum_score: record.minimum_score,
    parent_employment_id: record.parent_employment_id,
    position_id: record.position_id,
    training_id: record.training_id,
    idp_exposure_experience: record.idp_exposure_experience,
    idp_status: record.idp_status,
    assessment_schedule_id: record.assessment_schedule_id,
    employment: employmentSummary(
      store,
      findById(store, "employments", record.employment_id),
      {
        includeHierarchy: false,
        includeAssessments: false,
      }
    ),
    position: positionSummary(store, findById(store, "positions", record.position_id), {
      includeCompetencies: false,
    }),
    competency: competencySummary(
      store,
      findById(store, "competencies", record.competency_id),
      {
        includeTrainings: false,
        includeRequirement: false,
      }
    ),
    competency_level: competencyLevelSummary(
      findById(store, "competency_levels", record.competency_level_id)
    ),
    training: trainingSummary(store, findById(store, "trainings", record.training_id)),
    assessment_schedule: assessmentScheduleSummary(
      findById(store, "assessment_schedules", record.assessment_schedule_id)
    ),
    assessmentSchedule: assessmentScheduleSummary(
      findById(store, "assessment_schedules", record.assessment_schedule_id)
    ),
    ...timestamps(record),
  };
}

function periodicalAssessmentSummary(store, record) {
  if (!record) {
    return null;
  }

  return {
    id: record.id,
    employment_id: record.employment_id,
    assessment_schedule_id: record.assessment_schedule_id,
    parameters_name: record.parameters_name,
    parameters_value: record.parameters_value,
    status: record.status,
    employment: employmentSummary(
      store,
      findById(store, "employments", record.employment_id),
      {
        includeHierarchy: false,
        includeAssessments: false,
      }
    ),
    assessment_schedule: assessmentScheduleSummary(
      findById(store, "assessment_schedules", record.assessment_schedule_id)
    ),
    ...timestamps(record),
  };
}

function certificationSummary(store, record) {
  if (!record) {
    return null;
  }

  return {
    ...clone(record),
    employment:
      record.employment_id !== undefined
        ? employmentSummary(store, findById(store, "employments", record.employment_id), {
            includeHierarchy: false,
            includeAssessments: false,
          })
        : null,
    ...timestamps(record),
  };
}

function employmentSummary(store, employment, options = {}) {
  if (!employment) {
    return null;
  }

  const includeProfile = options.includeProfile !== false;
  const includeHierarchy = options.includeHierarchy !== false;
  const includeAssessments = options.includeAssessments !== false;

  const records = includeAssessments
    ? store.collections.assessment_records
        .filter((item) => Number(item.employment_id) === Number(employment.id))
        .map((item) => assessmentRecordSummary(store, item))
    : [];

  const schedules = includeAssessments
    ? Array.from(
        new Set(
          [
            ...records.map((item) => item.assessment_schedule_id),
            ...store.collections.periodical_general_assessments
              .filter((item) => Number(item.employment_id) === Number(employment.id))
              .map((item) => item.assessment_schedule_id),
          ].filter(Boolean)
        )
      )
        .map((scheduleId) => findById(store, "assessment_schedules", scheduleId))
        .filter(Boolean)
        .map((schedule) => assessmentScheduleSummary(schedule))
    : [];

  const periodicalAssessments = includeAssessments
    ? store.collections.periodical_general_assessments
        .filter((item) => Number(item.employment_id) === Number(employment.id))
        .map((item) => periodicalAssessmentSummary(store, item))
    : [];
  const certifications = includeAssessments
    ? store.collections.certifications
        .filter((item) => Number(item.employment_id) === Number(employment.id))
        .map((item) => certificationSummary(store, item))
    : [];

  return {
    id: employment.id,
    employment_hiring_date: employment.employment_hiring_date,
    employment_end_date: employment.employment_end_date,
    employment_group_type_name: employment.employment_group_type_name,
    employment_group_age: employment.employment_group_age,
    employment_status: employment.employment_status,
    employment_position_status: employment.employment_position_status,
    employment_wsr: employment.employment_wsr,
    parent_employment_id: employment.parent_employment_id,
    profile_id: employment.profile_id,
    position_id: employment.position_id,
    company_id: employment.company_id,
    directorat_id: employment.directorat_id,
    personel_area_id: employment.personel_area_id,
    personel_sub_area_id: employment.personel_sub_area_id,
    plant_area_id: employment.plant_area_id,
    organization_id: employment.organization_id ?? null,
    department_id: employment.department_id ?? null,
    organization_function_id: employment.organization_function_id ?? null,
    profile: includeProfile
      ? profileSummary(store, findById(store, "profiles", employment.profile_id))
      : null,
    position: positionSummary(store, findById(store, "positions", employment.position_id)),
    company: companySummary(findById(store, "companies", employment.company_id)),
    directorat: directoratSummary(findById(store, "directorats", employment.directorat_id)),
    personel_area: personelAreaSummary(
      findById(store, "personel_areas", employment.personel_area_id)
    ),
    personel_sub_area: personelSubAreaSummary(
      findById(store, "personel_sub_areas", employment.personel_sub_area_id)
    ),
    plant_area: plantAreaSummary(
      findById(store, "plant_areas", employment.plant_area_id)
    ),
    organization: organizationSummary(
      findById(store, "organizations", employment.organization_id)
    ),
    department: departmentSummary(
      findById(store, "departments", employment.department_id)
    ),
    organization_function: organizationFunctionSummary(
      findById(
        store,
        "organization_functions",
        employment.organization_function_id
      )
    ),
    parent:
      includeHierarchy && employment.parent_employment_id
        ? employmentSummary(
            store,
            findById(store, "employments", employment.parent_employment_id),
            {
              includeHierarchy: false,
              includeAssessments: false,
            }
          )
        : null,
    children: includeHierarchy
      ? store.collections.employments
          .filter(
            (item) => Number(item.parent_employment_id) === Number(employment.id)
          )
          .map((item) =>
            employmentSummary(store, item, {
              includeHierarchy: false,
              includeAssessments: false,
            })
          )
      : [],
    assessmentRecords: includeAssessments ? records : [],
    assessment_records: includeAssessments ? records : [],
    appliedAssessmentLogs: includeAssessments ? schedules : [],
    certifications: includeAssessments ? certifications : [],
    periodicalGeneralAssessments: includeAssessments ? periodicalAssessments : [],
    periodical_general_assessments: includeAssessments ? periodicalAssessments : [],
    ...timestamps(employment),
  };
}

function employeeSummary(store, employment, options = {}) {
  if (!employment) {
    return null;
  }

  const includeNested = options.includeNested !== false;
  const employmentOptions = options.employmentOptions || {};
  const profile = findById(store, "profiles", employment.profile_id);
  const user = profile ? findUserForProfile(store, profile.id) : null;
  const userResource = user
    ? userSummary(store, user, {
        includeProfile: false,
      })
    : null;
  const profileResource = profile
    ? profileSummary(store, profile, {
        includeUser: false,
        includeEmployment: false,
      })
    : null;
  const employmentResource = employmentSummary(store, employment, {
    includeProfile: false,
    ...employmentOptions,
  });

  return {
    id: employment.id,
    employee_id: employment.id,
    employment_id: employment.id,
    profile_id: profile?.id ?? null,
    user_id: user?.id ?? null,
    name: user?.name ?? profile?.profile_fullname ?? null,
    email: user?.email ?? null,
    profile_fullname: profile?.profile_fullname ?? null,
    profile_gender: profile?.profile_gender ?? null,
    employment_status: employment.employment_status ?? null,
    employment_position_status: employment.employment_position_status ?? null,
    employment_group_type_name: employment.employment_group_type_name ?? null,
    employment_wsr: employment.employment_wsr ?? null,
    position_id: employment.position_id ?? null,
    position_name: employmentResource?.position?.position_name ?? null,
    company_id: employment.company_id ?? null,
    company_name: employmentResource?.company?.company_name ?? null,
    directorat_id: employment.directorat_id ?? null,
    directorat_name: employmentResource?.directorat?.directorat_name ?? null,
    organization_id: employment.organization_id ?? null,
    organization_name: employmentResource?.organization?.organization_name ?? null,
    department_id: employment.department_id ?? null,
    department_name: employmentResource?.department?.department_name ?? null,
    organization_function_id: employment.organization_function_id ?? null,
    organization_function_name:
      employmentResource?.organization_function?.organization_function_name ?? null,
    parent_employment_id: employment.parent_employment_id ?? null,
    parent_profile_fullname:
      employmentResource?.parent?.profile?.profile_fullname ?? null,
    role_names: userResource ? userResource.roles.map((role) => role.name) : [],
    permission_names: userResource
      ? userResource.permissions.map((permission) => permission.name)
      : [],
    user: includeNested ? userResource : null,
    profile: includeNested ? profileResource : null,
    employment: includeNested ? employmentResource : null,
    ...timestamps(employment),
  };
}

function bucketSummary(store, bucket, options = {}) {
  if (!bucket) {
    return null;
  }

  const includePublications = options.includePublications === true;

  return {
    id: bucket.id,
    bucket_name: bucket.bucket_name,
    bucket_description: bucket.bucket_description,
    bucket_created_by: bucket.bucket_created_by,
    bucket_category_id: bucket.bucket_category_id,
    bucket_has_public_access: bucket.bucket_has_public_access,
    bucket_category: bucketCategorySummary(
      findById(store, "bucket_categories", bucket.bucket_category_id)
    ),
    publication_counts: store.collections.publications.filter(
      (publication) => Number(publication.bucket_id) === Number(bucket.id)
    ).length,
    bucket_author: employmentSummary(
      store,
      findById(store, "employments", bucket.bucket_author_employment_id),
      {
        includeHierarchy: false,
        includeAssessments: false,
      }
    ),
    publications: includePublications
      ? store.collections.publications
          .filter((publication) => Number(publication.bucket_id) === Number(bucket.id))
          .map((publication) =>
            publicationSummary(store, publication, {
              includeBucket: false,
            })
          )
      : [],
    ...timestamps(bucket),
  };
}

function publicationStorageSummary(store, storage, options = {}) {
  if (!storage) {
    return null;
  }

  const fileName = storage.document_hash_name
    ? `${storage.document_hash_name}.${storage.document_extension || "pdf"}`
    : null;
  const documentUrl = storage.id
    ? `/api/publication_storages/${storage.id}/document`
    : null;
  const documentType =
    storage.document_type ||
    (storage.document_extension === "pdf" ? "application/pdf" : null);

  return {
    id: storage.id,
    publication_id: storage.publication_id,
    document_extension: storage.document_extension,
    document_type: documentType,
    document_name: storage.document_name,
    document_hash_name: storage.document_hash_name,
    document_path: storage.document_path,
    document_storage_path:
      storage.document_storage_path || documentUrl,
    document_size: storage.document_size,
    document_uuid: storage.document_uuid,
    document_description: storage.document_description ?? null,
    storageable_id: storage.storageable_id,
    storageable_type: storage.storageable_type,
    document_url: documentUrl,
    publication:
      options.includePublication === false
        ? null
        : publicationSummary(
            store,
            findById(store, "publications", storage.publication_id),
            { includeBucket: false, includeStorages: false }
          ),
    ...timestamps(storage),
  };
}

function createPublicationRecord(store, payload = {}) {
  const publicationId = nextId(store, "publications");
  const timestamp = nowIso();
  const bucketId =
    Number(payload.bucket_id) ||
    store.collections.buckets.find((bucket) => bucket.bucket_has_public_access)?.id ||
    1;
  const categoryId =
    Number(payload.publication_category_id) ||
    store.collections.publication_categories[0]?.id ||
    1;
  const title = payload.publication_title || `Uploaded Publication ${publicationId}`;
  const slug = String(payload.publication_slug || title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const document = payload.document || {};
  const documentHashName =
    document.hashName || slug || `publication-${publicationId}`;
  const documentName = document.name || documentHashName;
  const documentExtension = document.extension || "pdf";
  const documentPath = document.path || "mock-publications";
  const documentSize = document.sizeLabel || "128 KB";
  const documentStoragePath =
    document.storagePath || `${documentPath}/${documentHashName}.${documentExtension}`;
  const documentType = document.type || "application/pdf";
  const documentDescription =
    document.description ||
    payload.publication_description ||
    `Seeded document for ${title}`;

  const publication = {
    id: publicationId,
    publication_title: title,
    publication_slug: slug,
    publication_description:
      payload.publication_description || "Uploaded from the mock backend",
    publication_is_verified: Boolean(payload.publication_is_verified),
    publication_category_id: categoryId,
    bucket_id: bucketId,
    created_at: timestamp,
    updated_at: timestamp,
  };

  const storageId = nextId(store, "publication_storages");
  store.collections.publication_storages.push({
    id: storageId,
    publication_id: publicationId,
    document_extension: documentExtension,
    document_name: documentName,
    document_hash_name: documentHashName,
    document_path: documentPath,
    document_storage_path: documentStoragePath,
    document_type: documentType,
    document_description: documentDescription,
    document_size: documentSize,
    document_uuid: document.uuid || crypto.randomUUID(),
    storageable_id: publicationId,
    storageable_type: "Publication",
    created_at: timestamp,
    updated_at: timestamp,
  });

  store.collections.publications.push(publication);
  return publicationSummary(store, publication);
}

function publicationSummary(store, publication, options = {}) {
  if (!publication) {
    return null;
  }

  const includeBucket = options.includeBucket !== false;
  const includeStorages = options.includeStorages !== false;

  return {
    id: publication.id,
    publication_title: publication.publication_title,
    publication_slug: publication.publication_slug,
    publication_description: publication.publication_description,
    publication_is_verified: publication.publication_is_verified,
    publication_category_id: publication.publication_category_id,
    publication_category: publicationCategorySummary(
      findById(store, "publication_categories", publication.publication_category_id)
    ),
    bucket_id: publication.bucket_id,
    bucket: includeBucket
      ? bucketSummary(store, findById(store, "buckets", publication.bucket_id), {
          includePublications: false,
        })
      : null,
    storages: includeStorages
      ? store.collections.publication_storages
          .filter(
            (storage) => Number(storage.publication_id) === Number(publication.id)
          )
          .map((storage) =>
            publicationStorageSummary(store, storage, {
              includePublication: false,
            })
          )
      : [],
    ...timestamps(publication),
  };
}

function userSummary(store, user, options = {}) {
  if (!user) {
    return null;
  }

  const includeProfileEmployment = options.includeProfileEmployment === true;
  const includeRoles = options.includeRoles !== false;
  const includePermissions = options.includePermissions !== false;
  const includeProfile = options.includeProfile !== false;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    email_verified_at: user.email_verified_at,
    roles: includeRoles
      ? (user.role_ids || [])
          .map((id) => findById(store, "roles", id))
          .filter(Boolean)
          .map((role) =>
            roleSummary(store, role, {
              includeUsers: false,
              includePermissions: false,
            })
          )
      : [],
    permissions: includePermissions
      ? getPermissionNamesForUser(store, user)
          .map((name) =>
            store.collections.permissions.find(
              (permission) => permission.name === name
            )
          )
          .filter(Boolean)
          .map((permission) =>
            permissionSummary(store, permission, {
              includeUsers: false,
              includeRoles: false,
            })
          )
      : [],
    profile: includeProfile
      ? profileSummary(store, findById(store, "profiles", user.profile_id), {
          includeEmployment: includeProfileEmployment,
        })
      : null,
    is_logged_in: Boolean(user.is_logged_in),
    last_logged_in_at: user.last_logged_in_at ?? null,
    last_logged_in_host: user.last_logged_in_host ?? null,
    last_logged_in_port: user.last_logged_in_port ?? null,
    last_logged_in_user_agent: user.last_logged_in_user_agent ?? null,
    last_logged_in_device: user.last_logged_in_device ?? null,
    last_logged_in_browser: user.last_logged_in_browser ?? null,
    last_logged_in_platform: user.last_logged_in_platform ?? null,
    ...timestamps(user),
  };
}

function hydrateResource(store, resource, record) {
  const resourceKind = resolveCollectionName(resource);

  switch (resourceKind) {
    case "permissions":
      return permissionSummary(store, record);
    case "roles":
      return roleSummary(store, record);
    case "users":
      return userSummary(store, record, { includeProfileEmployment: true });
    case "profiles":
      return profileSummary(store, record, { includeEmployment: true });
    case "companies":
      return companySummary(record);
    case "directorats":
      return directoratSummary(record);
    case "personel_areas":
      return personelAreaSummary(record);
    case "personel_sub_areas":
      return personelSubAreaSummary(record);
    case "plant_areas":
      return plantAreaSummary(record);
    case "organizations":
      return organizationSummary(record);
    case "departments":
      return departmentSummary(record);
    case "organization_functions":
      return organizationFunctionSummary(record);
    case "positions":
      return positionSummary(store, record);
    case "competencies":
      return competencySummary(store, record);
    case "competency_levels":
      return competencyLevelSummary(record);
    case "trainings":
      return trainingSummary(store, record);
    case "requirement_scores":
      return requirementScoreSummary(store, record);
    case "assessment_schedules":
      return assessmentScheduleSummary(record);
    case "assessment_records":
      return assessmentRecordSummary(store, record);
    case "periodical_general_assessments":
      return periodicalAssessmentSummary(store, record);
    case "employments":
      return employmentSummary(store, record);
    case "certifications":
      return certificationSummary(store, record);
    case "buckets":
      return bucketSummary(store, record);
    case "publications":
      return publicationSummary(store, record);
    case "publication_storages":
      return publicationStorageSummary(store, record);
    case "publication_categories":
      return publicationCategorySummary(record);
    case "bucket_categories":
      return bucketCategorySummary(record);
    default:
      return clone(record);
  }
}

function listResources(store, resource, query = {}) {
  const collection = getCollection(store, resource);

  if (!Array.isArray(collection)) {
    return null;
  }

  const hydrated = collection
    .slice()
    .sort((left, right) => Number(left.id) - Number(right.id))
    .map((record) => hydrateResource(store, resource, record));

  return paginate(hydrated, query);
}

function searchResources(store, resource, query = {}, body = {}) {
  const collection = getCollection(store, resource);

  if (!Array.isArray(collection)) {
    return null;
  }

  const keyword = body?.search?.value || "";
  const scopes = body?.scopes || [];

  const hydrated = collection
    .slice()
    .sort((left, right) => Number(left.id) - Number(right.id))
    .map((record) => hydrateResource(store, resource, record));

  const scoped = applyScopes(store, resource, hydrated, scopes);
  const filtered = scoped.filter((record) => matchesSearch(record, keyword));

  return paginate(filtered, query);
}

function showResource(store, resource, id) {
  const record = findById(store, resource, id);
  if (!record) {
    return null;
  }

  return hydrateResource(store, resource, record);
}

function listEmployees(store, query = {}) {
  const employees = store.collections.employments
    .slice()
    .sort((left, right) => Number(left.id) - Number(right.id))
    .map((employment) =>
      employeeSummary(store, employment, {
        employmentOptions: {
          includeHierarchy: false,
          includeAssessments: false,
        },
      })
    );

  return paginate(employees, query);
}

function searchEmployees(store, query = {}, body = {}) {
  const keyword = body?.search?.value || "";
  const employees = store.collections.employments
    .slice()
    .sort((left, right) => Number(left.id) - Number(right.id))
    .map((employment) =>
      employeeSummary(store, employment, {
        employmentOptions: {
          includeHierarchy: false,
          includeAssessments: false,
        },
      })
    )
    .filter((employee) => matchesSearch(employee, keyword));

  return paginate(employees, query);
}

function showEmployee(store, id) {
  const employment = findById(store, "employments", id);
  if (!employment) {
    return null;
  }

  return employeeSummary(store, employment, {
    employmentOptions: {
      includeHierarchy: true,
      includeAssessments: true,
    },
  });
}

function mutateRecord(record, payload = {}) {
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) {
      continue;
    }

    record[key] = value;
  }

  record.updated_at = nowIso();
  return record;
}

function deleteEmploymentCascade(store, employmentId) {
  const employment = findById(store, "employments", employmentId);
  if (!employment) {
    return false;
  }

  store.collections.assessment_records = store.collections.assessment_records.filter(
    (record) => Number(record.employment_id) !== Number(employmentId)
  );
  store.collections.periodical_general_assessments =
    store.collections.periodical_general_assessments.filter(
      (record) => Number(record.employment_id) !== Number(employmentId)
    );
  store.collections.certifications = store.collections.certifications.filter(
    (record) => Number(record.employment_id) !== Number(employmentId)
  );

  store.collections.employments.forEach((item) => {
    if (Number(item.parent_employment_id) === Number(employmentId)) {
      item.parent_employment_id = null;
      item.updated_at = nowIso();
    }
  });

  store.collections.buckets.forEach((bucket) => {
    if (Number(bucket.bucket_author_employment_id) === Number(employmentId)) {
      bucket.bucket_author_employment_id = null;
      bucket.updated_at = nowIso();
    }
  });

  const index = store.collections.employments.findIndex(
    (item) => Number(item.id) === Number(employmentId)
  );

  if (index === -1) {
    return false;
  }

  store.collections.employments.splice(index, 1);
  return true;
}

function deleteProfileCascade(store, profileId) {
  const profile = findById(store, "profiles", profileId);
  if (!profile) {
    return false;
  }

  store.collections.users.forEach((user) => {
    if (Number(user.profile_id) === Number(profileId)) {
      user.profile_id = null;
      user.updated_at = nowIso();
    }
  });

  store.collections.employments
    .filter((employment) => Number(employment.profile_id) === Number(profileId))
    .forEach((employment) => {
      deleteEmploymentCascade(store, employment.id);
    });

  const index = store.collections.profiles.findIndex(
    (item) => Number(item.id) === Number(profileId)
  );

  if (index === -1) {
    return false;
  }

  store.collections.profiles.splice(index, 1);
  return true;
}

function deletePublicationCascade(store, publicationId) {
  const index = store.collections.publications.findIndex(
    (item) => Number(item.id) === Number(publicationId)
  );

  if (index === -1) {
    return false;
  }

  store.collections.publication_storages =
    store.collections.publication_storages.filter(
      (storage) => Number(storage.publication_id) !== Number(publicationId)
    );
  store.collections.publications.splice(index, 1);
  return true;
}

function createGenericRecord(store, resource, payload = {}) {
  const collectionName = resolveCollectionName(resource);
  const collection = getCollection(store, collectionName);
  const resourceKind = collectionName;
  if (!Array.isArray(collection)) {
    return null;
  }

  const timestamp = nowIso();

  if (resourceKind === "users") {
    const employeeRole = store.collections.roles.find(
      (role) => role.name === "employee"
    );
    const userId = nextId(store, "users");
    const profileId = nextId(store, "profiles");
    const name = payload.name || `User ${userId}`;
    const profilePayload = payload.profile || {};
    const roleIds = normalizeIdList(payload.role_ids);
    const permissionIds = normalizeIdList(payload.permission_ids);

    const user = {
      id: userId,
      name,
      email: payload.email || `user${userId}@example.com`,
      password: hashPassword(payload.password || "password"),
      email_verified_at: null,
      role_ids: roleIds.length > 0 ? roleIds : employeeRole ? [employeeRole.id] : [],
      permission_ids: permissionIds,
      profile_id: profileId,
      is_logged_in: false,
      last_logged_in_at: null,
      last_logged_in_host: null,
      last_logged_in_port: null,
      last_logged_in_user_agent: null,
      last_logged_in_device: null,
      last_logged_in_browser: null,
      last_logged_in_platform: null,
      created_at: timestamp,
      updated_at: timestamp,
    };

    const profile = {
      id: profileId,
      profile_fullname:
        profilePayload.profile_fullname || payload.profile_fullname || name,
      profile_gender:
        profilePayload.profile_gender || payload.profile_gender || "Unknown",
      profile_place_of_birth:
        profilePayload.profile_place_of_birth ||
        payload.profile_place_of_birth ||
        "Unknown",
      profile_date_of_birth:
        normalizeDateValue(
          profilePayload.profile_date_of_birth || payload.profile_date_of_birth
        ) || "1995-01-01T00:00:00.000Z",
      profile_marital_status:
        profilePayload.profile_marital_status ||
        payload.profile_marital_status ||
        "Single",
      profile_nationality:
        profilePayload.profile_nationality ||
        payload.profile_nationality ||
        "Indonesia",
      profile_religion:
        profilePayload.profile_religion || payload.profile_religion || "Unknown",
      user_id: userId,
      created_at: timestamp,
      updated_at: timestamp,
    };

    store.collections.profiles.push(profile);
    store.collections.users.push(user);
    return hydrateResource(store, resource, user);
  }

  if (resourceKind === "publications") {
    return createPublicationRecord(store, payload);
  }

  const record = {
    id: nextId(store, collectionName),
    ...payload,
    created_at: timestamp,
    updated_at: timestamp,
  };

  if (resourceKind === "roles") {
    record.permission_ids = normalizeIdList(payload.permission_ids);
    record.guard_name = payload.guard_name || "web";
  }

  if (resourceKind === "permissions") {
    record.guard_name = payload.guard_name || "web";
  }

  if (resourceKind === "employments") {
    Object.assign(record, normalizeEmploymentPayload(payload));
    delete record.department_function_id;
  }

  if (resourceKind === "trainings") {
    Object.assign(record, normalizeTrainingPayload(payload));
  }

  if (resourceKind === "requirement_scores") {
    Object.assign(record, normalizeRequirementScorePayload(payload));
  }

  if (resourceKind === "assessment_records") {
    Object.assign(record, normalizeAssessmentRecordPayload(payload));
  }

  if (resourceKind === "periodical_general_assessments") {
    Object.assign(record, normalizePeriodicalAssessmentPayload(payload));
  }

  if (resourceKind === "buckets") {
    const normalizedBucketPayload = normalizeBucketPayload(payload);
    record.bucket_category_id =
      normalizedBucketPayload.bucket_category_id ||
      store.collections.bucket_categories[1]?.id ||
      1;
    record.bucket_author_employment_id =
      normalizedBucketPayload.bucket_author_employment_id || 1;
    record.bucket_has_public_access = Boolean(
      normalizedBucketPayload.bucket_has_public_access
    );
  }

  if (resourceKind === "publication_storages") {
    const normalizedStoragePayload = normalizePublicationStoragePayload(payload);
    record.publication_id = normalizedStoragePayload.publication_id;
    record.document_extension = normalizedStoragePayload.document_extension || "pdf";
    record.document_name =
      normalizedStoragePayload.document_name || `publication-${record.id}`;
    record.document_hash_name =
      normalizedStoragePayload.document_hash_name || record.document_name;
    record.document_path =
      normalizedStoragePayload.document_path || "mock-publications";
    record.document_size = normalizedStoragePayload.document_size || "128 KB";
    record.document_uuid =
      normalizedStoragePayload.document_uuid || crypto.randomUUID();
    record.storageable_id =
      normalizedStoragePayload.storageable_id || normalizedStoragePayload.publication_id;
    record.storageable_type =
      normalizedStoragePayload.storageable_type || "Publication";
  }

  collection.push(record);
  return hydrateResource(store, resourceKind, record);
}

function updateGenericRecord(store, resource, id, payload = {}) {
  const collectionName = resolveCollectionName(resource);
  const collection = getCollection(store, collectionName);
  const resourceKind = collectionName;
  if (!Array.isArray(collection)) {
    return null;
  }

  const record = findById(store, collectionName, id);
  if (!record) {
    return null;
  }

  if (resourceKind === "users") {
    const profile = findById(store, "profiles", record.profile_id);
    const profilePayload = payload.profile || {};
    mutateRecord(record, {
      name: payload.name ?? record.name,
      email: payload.email ?? record.email,
      password:
        Object.prototype.hasOwnProperty.call(payload, "password") &&
        payload.password !== null &&
        payload.password !== ""
          ? hashPassword(payload.password)
          : record.password,
      role_ids:
        Object.prototype.hasOwnProperty.call(payload, "role_ids")
          ? normalizeIdList(payload.role_ids)
          : record.role_ids,
      permission_ids:
        Object.prototype.hasOwnProperty.call(payload, "permission_ids")
          ? normalizeIdList(payload.permission_ids)
          : record.permission_ids,
    });

    if (profile) {
      mutateRecord(profile, {
        profile_fullname:
          profilePayload.profile_fullname || payload.profile_fullname || payload.name,
        profile_gender:
          profilePayload.profile_gender ?? payload.profile_gender ?? profile.profile_gender,
        profile_place_of_birth:
          profilePayload.profile_place_of_birth ??
          payload.profile_place_of_birth ??
          profile.profile_place_of_birth,
        profile_date_of_birth: Object.prototype.hasOwnProperty.call(
          profilePayload,
          "profile_date_of_birth"
        ) || Object.prototype.hasOwnProperty.call(payload, "profile_date_of_birth")
          ? normalizeDateValue(
              profilePayload.profile_date_of_birth ?? payload.profile_date_of_birth
            )
          : profile.profile_date_of_birth,
        profile_marital_status:
          profilePayload.profile_marital_status ??
          payload.profile_marital_status ??
          profile.profile_marital_status,
        profile_nationality:
          profilePayload.profile_nationality ??
          payload.profile_nationality ??
          profile.profile_nationality,
        profile_religion:
          profilePayload.profile_religion ??
          payload.profile_religion ??
          profile.profile_religion,
      });
    }

    return hydrateResource(store, resource, record);
  }

  if (resourceKind === "roles") {
    mutateRecord(record, {
      name: payload.name ?? record.name,
      guard_name: payload.guard_name ?? record.guard_name,
      permission_ids: Object.prototype.hasOwnProperty.call(payload, "permission_ids")
        ? normalizeIdList(payload.permission_ids)
        : record.permission_ids,
    });
    return hydrateResource(store, resource, record);
  }

  if (resourceKind === "permissions") {
    mutateRecord(record, {
      name: payload.name ?? record.name,
      group: payload.group ?? record.group,
      guard_name: payload.guard_name ?? record.guard_name,
    });
    return hydrateResource(store, resource, record);
  }

  if (resourceKind === "employments") {
    mutateRecord(record, normalizeEmploymentPayload(payload));
    delete record.department_function_id;
    return hydrateResource(store, resource, record);
  }

  if (resourceKind === "trainings") {
    mutateRecord(record, normalizeTrainingPayload(payload));
    return hydrateResource(store, resource, record);
  }

  if (resourceKind === "requirement_scores") {
    mutateRecord(record, normalizeRequirementScorePayload(payload));
    return hydrateResource(store, resource, record);
  }

  if (resourceKind === "assessment_records") {
    mutateRecord(record, normalizeAssessmentRecordPayload(payload));
    return hydrateResource(store, resource, record);
  }

  if (resourceKind === "periodical_general_assessments") {
    mutateRecord(record, normalizePeriodicalAssessmentPayload(payload));
    return hydrateResource(store, resource, record);
  }

  if (resourceKind === "buckets") {
    mutateRecord(record, normalizeBucketPayload(payload));
    return hydrateResource(store, resource, record);
  }

  if (
    resourceKind === "publications" &&
    (
      Object.prototype.hasOwnProperty.call(payload, "isVerified") ||
      Object.prototype.hasOwnProperty.call(payload, "publication_title") ||
      Object.prototype.hasOwnProperty.call(payload, "publication_slug") ||
      Object.prototype.hasOwnProperty.call(payload, "publication_description") ||
      Object.prototype.hasOwnProperty.call(payload, "publication_category_id") ||
      Object.prototype.hasOwnProperty.call(payload, "bucket_id")
    )
  ) {
    const nextPublicationSlug = Object.prototype.hasOwnProperty.call(
      payload,
      "publication_slug"
    )
      ? String(payload.publication_slug || "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      : record.publication_slug;

    mutateRecord(record, {
      publication_title: payload.publication_title ?? record.publication_title,
      publication_slug: nextPublicationSlug,
      publication_description:
        payload.publication_description ?? record.publication_description,
      publication_category_id:
        Object.prototype.hasOwnProperty.call(payload, "publication_category_id")
          ? normalizeNullableId(payload.publication_category_id)
          : record.publication_category_id,
      bucket_id: Object.prototype.hasOwnProperty.call(payload, "bucket_id")
        ? normalizeNullableId(payload.bucket_id)
        : record.bucket_id,
      publication_is_verified: Object.prototype.hasOwnProperty.call(payload, "isVerified")
        ? Boolean(payload.isVerified)
        : Object.prototype.hasOwnProperty.call(payload, "publication_is_verified")
          ? Boolean(payload.publication_is_verified)
          : record.publication_is_verified,
    });
    return hydrateResource(store, resource, record);
  }

  if (resourceKind === "publication_storages") {
    mutateRecord(record, normalizePublicationStoragePayload(payload));
    return hydrateResource(store, resource, record);
  }

  mutateRecord(record, payload);
  return hydrateResource(store, resource, record);
}

function deleteGenericRecord(store, resource, id) {
  const collection = getCollection(store, resource);
  if (!Array.isArray(collection)) {
    return false;
  }

  const record = findById(store, resource, id);
  if (!record) {
    return false;
  }

  if (resource === "users") {
    if (record.profile_id) {
      deleteProfileCascade(store, record.profile_id);
    }

    const index = collection.findIndex(
      (item) => Number(item.id) === Number(id)
    );
    if (index === -1) {
      return false;
    }

    collection.splice(index, 1);
    return true;
  }

  if (resource === "profiles") {
    return deleteProfileCascade(store, id);
  }

  if (resource === "employments") {
    return deleteEmploymentCascade(store, id);
  }

  if (resource === "publications") {
    return deletePublicationCascade(store, id);
  }

  if (resource === "roles") {
    store.collections.users.forEach((user) => {
      user.role_ids = (user.role_ids || []).filter(
        (roleId) => Number(roleId) !== Number(id)
      );
      user.updated_at = nowIso();
    });
  }

  if (resource === "permissions") {
    store.collections.users.forEach((user) => {
      user.permission_ids = (user.permission_ids || []).filter(
        (permissionId) => Number(permissionId) !== Number(id)
      );
      user.updated_at = nowIso();
    });

    store.collections.roles.forEach((role) => {
      role.permission_ids = (role.permission_ids || []).filter(
        (permissionId) => Number(permissionId) !== Number(id)
      );
      role.updated_at = nowIso();
    });
  }

  if (resource === "buckets") {
    store.collections.publications
      .filter((publication) => Number(publication.bucket_id) === Number(id))
      .forEach((publication) => {
        deletePublicationCascade(store, publication.id);
      });
  }

  if (resource === "publication_categories") {
    store.collections.publications.forEach((publication) => {
      if (Number(publication.publication_category_id) === Number(id)) {
        publication.publication_category_id = null;
        publication.updated_at = nowIso();
      }
    });
  }

  if (resource === "bucket_categories") {
    store.collections.buckets.forEach((bucket) => {
      if (Number(bucket.bucket_category_id) === Number(id)) {
        bucket.bucket_category_id = null;
        bucket.updated_at = nowIso();
      }
    });
  }

  if (resource === "positions") {
    store.collections.requirement_scores = store.collections.requirement_scores.filter(
      (item) => Number(item.position_id) !== Number(id)
    );
    store.collections.employments.forEach((employment) => {
      if (Number(employment.position_id) === Number(id)) {
        employment.position_id = null;
        employment.updated_at = nowIso();
      }
    });
    store.collections.assessment_records.forEach((record) => {
      if (Number(record.position_id) === Number(id)) {
        record.position_id = null;
        record.updated_at = nowIso();
      }
    });
  }

  if (resource === "competencies") {
    store.collections.requirement_scores = store.collections.requirement_scores.filter(
      (item) => Number(item.competency_id) !== Number(id)
    );
    store.collections.trainings = store.collections.trainings.filter(
      (item) => Number(item.competency_id) !== Number(id)
    );
    store.collections.assessment_records = store.collections.assessment_records.filter(
      (item) => Number(item.competency_id) !== Number(id)
    );
  }

  if (resource === "competency_levels") {
    store.collections.requirement_scores = store.collections.requirement_scores.filter(
      (item) => Number(item.competency_level_id) !== Number(id)
    );
    store.collections.trainings.forEach((training) => {
      if (Number(training.training_competency_level_stack_key) === Number(id)) {
        training.training_competency_level_stack_key = null;
        training.updated_at = nowIso();
      }
    });
    store.collections.assessment_records.forEach((record) => {
      if (Number(record.competency_level_id) === Number(id)) {
        record.competency_level_id = null;
        record.updated_at = nowIso();
      }
    });
  }

  if (resource === "trainings") {
    store.collections.assessment_records.forEach((record) => {
      if (Number(record.training_id) === Number(id)) {
        record.training_id = null;
        record.updated_at = nowIso();
      }
    });
  }

  const index = collection.findIndex((item) => Number(item.id) === Number(id));
  if (index === -1) {
    return false;
  }

  collection.splice(index, 1);
  return true;
}

function getAuthUser(store, userId) {
  const user = findById(store, "users", userId);
  if (!user) {
    return null;
  }

  return {
    ...userSummary(store, user, { includeProfileEmployment: true }),
    roles: (user.role_ids || [])
      .map((id) => findById(store, "roles", id))
      .filter(Boolean)
      .map((role) => role.name),
    permissions: getPermissionNamesForUser(store, user),
  };
}

function getRoleNamesForUser(store, userId) {
  const user = findById(store, "users", userId);
  if (!user) {
    return [];
  }

  return (user.role_ids || [])
    .map((id) => findById(store, "roles", id))
    .filter(Boolean)
    .map((role) => role.name);
}

function getGravatarUrl(store, userId) {
  const user = findById(store, "users", userId);
  const email = user?.email || "demo@example.com";
  const emailHash = crypto
    .createHash("md5")
    .update(String(email).trim().toLowerCase())
    .digest("hex");

  return `https://www.gravatar.com/avatar/${emailHash}?d=identicon`;
}

function getSelectOptions(store, key) {
  switch (key) {
    case "employments":
      return {
        data: store.collections.employments.map((employment) =>
          employmentSummary(store, employment, {
            includeHierarchy: false,
            includeAssessments: false,
          })
        ),
      };
    case "profiles":
      return {
        data: store.collections.profiles.map((profile) =>
          profileSummary(store, profile)
        ),
      };
    case "positions":
      return {
        data: store.collections.positions.map((position) =>
          positionSummary(store, position, { includeCompetencies: false })
        ),
      };
    case "companies":
      return {
        data: store.collections.companies.map((company) => companySummary(company)),
      };
    case "directorats":
      return {
        data: store.collections.directorats.map((item) => directoratSummary(item)),
      };
    case "personel_areas":
      return {
        data: store.collections.personel_areas.map((item) =>
          personelAreaSummary(item)
        ),
      };
    case "personel_sub_areas":
      return {
        data: store.collections.personel_sub_areas.map((item) =>
          personelSubAreaSummary(item)
        ),
      };
    case "plant_areas":
      return {
        data: store.collections.plant_areas.map((item) => plantAreaSummary(item)),
      };
    case "organizations":
      return {
        data: store.collections.organizations.map((item) =>
          organizationSummary(item)
        ),
      };
    case "departments":
      return {
        data: store.collections.departments.map((item) => departmentSummary(item)),
      };
    case "organization_functions":
      return {
        data: store.collections.organization_functions.map((item) =>
          organizationFunctionSummary(item)
        ),
      };
    case "competencies":
      return {
        data: store.collections.competencies.map((item) =>
          competencySummary(store, item, {
            includeTrainings: false,
            includeRequirement: false,
          })
        ),
      };
    case "competency_levels":
      return {
        data: store.collections.competency_levels.map((item) =>
          competencyLevelSummary(item)
        ),
      };
    case "assessment_schedules":
      return {
        data: store.collections.assessment_schedules.map((item) =>
          assessmentScheduleSummary(item)
        ),
      };
    case "employees":
      return {
        data: store.collections.employments.map((employment) =>
          employeeSummary(store, employment, {
            includeNested: false,
            employmentOptions: {
              includeHierarchy: false,
              includeAssessments: false,
            },
          })
        ),
      };
    case "publication_categories":
      return {
        data: store.collections.publication_categories.map((item) =>
          publicationCategorySummary(item)
        ),
      };
    case "bucket_categories":
      return {
        data: store.collections.bucket_categories.map((item) =>
          bucketCategorySummary(item)
        ),
      };
    default:
      return null;
  }
}

module.exports = {
  nowIso,
  nextId,
  paginate,
  toRootPagination,
  findById,
  assessmentScheduleSummary,
  employmentSummary,
  bucketSummary,
  bucketCategorySummary,
  publicationCategorySummary,
  publicationSummary,
  publicationStorageSummary,
  createPublicationRecord,
  createStore,
  isGenericResource,
  listResources,
  searchResources,
  showResource,
  createGenericRecord,
  updateGenericRecord,
  deleteGenericRecord,
  getAuthUser,
  getRoleNamesForUser,
  getPermissionNamesForUser,
  getGravatarUrl,
  getSelectOptions,
  employeeSummary,
  listEmployees,
  searchEmployees,
  showEmployee,
};
