"use strict";

const { ValidationError, NotFoundError } = require("./api-errors");

const RESOURCE_ALIASES = {
  assessments: "assessment_records",
};

function normalizeResource(resource) {
  return RESOURCE_ALIASES[resource] || resource;
}

function hasOwn(payload, key) {
  return Object.prototype.hasOwnProperty.call(payload || {}, key);
}

function isBlank(value) {
  return value === null || value === undefined || String(value).trim() === "";
}

function addError(meta, field, message) {
  if (!meta[field]) {
    meta[field] = [];
  }
  meta[field].push(message);
}

function ensureValid(meta, message) {
  if (Object.keys(meta).length > 0) {
    throw new ValidationError(message, meta);
  }
}

function parseId(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function findRecord(store, collectionName, id) {
  if (!Array.isArray(store.collections[collectionName])) {
    return null;
  }

  return (
    store.collections[collectionName].find(
      (item) => Number(item.id) === Number(id)
    ) || null
  );
}

function requireExistingRecord(store, collectionName, id, message) {
  const record = findRecord(store, collectionName, id);
  if (!record) {
    throw new NotFoundError(message);
  }

  return record;
}

function validateRequiredString(meta, payload, field, label, required = false) {
  if (!required && !hasOwn(payload, field)) {
    return;
  }

  if (isBlank(payload[field])) {
    addError(meta, field, `${label} is required.`);
  }
}

function validateEmail(
  meta,
  value,
  field,
  store,
  currentUserId = null,
  options = {}
) {
  if (isBlank(value)) {
    addError(meta, field, "Email is required.");
    return;
  }

  const normalized = String(value).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    addError(meta, field, "Email must be valid.");
    return;
  }

  if (options.enforceUnique === false) {
    return;
  }

  const duplicate = store.collections.users.find(
    (user) =>
      Number(user.id) !== Number(currentUserId) &&
      String(user.email || "").trim().toLowerCase() === normalized
  );

  if (duplicate) {
    addError(meta, field, "Email has already been taken.");
  }
}

function validateForeignKey(
  meta,
  store,
  payload,
  field,
  collectionName,
  label,
  required = false
) {
  if (!hasOwn(payload, field)) {
    if (required) {
      addError(meta, field, `${label} is required.`);
    }
    return null;
  }

  if (payload[field] === null || payload[field] === "") {
    if (required) {
      addError(meta, field, `${label} is required.`);
    }
    return null;
  }

  const id = parseId(payload[field]);
  if (!id) {
    addError(meta, field, `${label} must be a valid id.`);
    return null;
  }

  if (!findRecord(store, collectionName, id)) {
    addError(meta, field, `${label} was not found.`);
    return null;
  }

  return id;
}

function validateIdList(meta, store, payload, field, collectionName, label) {
  if (!hasOwn(payload, field)) {
    return;
  }

  const rawValue = payload[field];
  const values = Array.isArray(rawValue)
    ? rawValue
    : rawValue === null || rawValue === undefined || rawValue === ""
      ? []
      : [rawValue];

  values.forEach((value, index) => {
    const id = parseId(value);
    if (!id) {
      addError(meta, field, `${label} at index ${index} must be a valid id.`);
      return;
    }

    if (!findRecord(store, collectionName, id)) {
      addError(meta, field, `${label} at index ${index} was not found.`);
    }
  });
}

function validateNonNegativeNumber(meta, payload, field, label, required = false) {
  if (!required && !hasOwn(payload, field)) {
    return;
  }

  const rawValue = payload[field];
  if (rawValue === null || rawValue === undefined || rawValue === "") {
    if (required) {
      addError(meta, field, `${label} is required.`);
    }
    return;
  }

  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed) || parsed < 0) {
    addError(meta, field, `${label} must be a non-negative number.`);
  }
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function validateUniqueString(
  meta,
  store,
  payload,
  field,
  collectionName,
  label,
  options = {}
) {
  if (!options.required && !hasOwn(payload, field)) {
    return;
  }

  const rawValue = payload[field];
  if (isBlank(rawValue)) {
    if (options.required) {
      addError(meta, field, `${label} is required.`);
    }
    return;
  }

  const normalized = options.normalizer
    ? options.normalizer(rawValue)
    : String(rawValue).trim().toLowerCase();

  if (!normalized) {
    addError(meta, field, `${label} is required.`);
    return;
  }

  const duplicate = (store.collections[collectionName] || []).find((item) => {
    const currentValue = options.normalizer
      ? options.normalizer(item[field])
      : String(item[field] || "").trim().toLowerCase();

    return (
      Number(item.id) !== Number(options.currentId || null) &&
      currentValue === normalized
    );
  });

  if (duplicate) {
    addError(meta, field, `${label} has already been taken.`);
  }
}

function validateLoginPayload(payload) {
  const meta = {};
  validateEmail(meta, payload?.email, "email", { collections: { users: [] } });
  if (isBlank(payload?.password)) {
    addError(meta, "password", "Password is required.");
  }
  ensureValid(meta, "Login payload is invalid.");
}

function validatePasswordFields(meta, payload, options = {}) {
  const required = options.required === true;
  const passwordProvided = required || hasOwn(payload, "password");
  const confirmationProvided =
    required || hasOwn(payload, "password_confirmation");

  if (passwordProvided) {
    if (isBlank(payload?.password)) {
      addError(meta, "password", "Password is required.");
    } else if (String(payload.password).length < 6) {
      addError(meta, "password", "Password must be at least 6 characters.");
    }
  }

  if (confirmationProvided) {
    if (isBlank(payload?.password_confirmation)) {
      addError(
        meta,
        "password_confirmation",
        "Password confirmation is required."
      );
    } else if (String(payload.password_confirmation) !== String(payload.password)) {
      addError(
        meta,
        "password_confirmation",
        "Password confirmation does not match."
      );
    }
  }
}

function validateAuthRegisterPayload(store, payload) {
  const meta = {};
  validateRequiredString(meta, payload, "name", "Name", true);
  validateEmail(meta, payload?.email, "email", store);
  validatePasswordFields(meta, payload, { required: true });
  ensureValid(meta, "Register payload is invalid.");
}

function validatePasswordResetRequestPayload(store, payload) {
  const meta = {};
  validateEmail(meta, payload?.email, "email", store, null, {
    enforceUnique: false,
  });
  ensureValid(meta, "Password reset request payload is invalid.");
}

function validateResetPasswordPayload(store, payload) {
  const meta = {};
  validateEmail(meta, payload?.email, "email", store, null, {
    enforceUnique: false,
  });
  validateRequiredString(meta, payload, "token", "Reset token", true);
  validatePasswordFields(meta, payload, { required: true });
  ensureValid(meta, "Reset password payload is invalid.");
}

function validateUserMutation(store, payload, options = {}) {
  const meta = {};
  const isCreate = options.mode === "create";
  const currentUserId = options.currentId || null;

  validateRequiredString(meta, payload, "name", "Name", isCreate);
  if (isCreate || hasOwn(payload, "email")) {
    validateEmail(meta, payload.email, "email", store, currentUserId);
  }

  validateIdList(meta, store, payload, "role_ids", "roles", "Role");
  validateIdList(meta, store, payload, "permission_ids", "permissions", "Permission");

  const profilePayload = payload.profile || {};
  if (isCreate || hasOwn(profilePayload, "profile_fullname") || hasOwn(payload, "profile_fullname")) {
    const fullName =
      profilePayload.profile_fullname ?? payload.profile_fullname ?? null;
    if (isBlank(fullName)) {
      addError(meta, "profile_fullname", "Profile full name is required.");
    }
  }

  ensureValid(meta, "User payload is invalid.");
}

function validateEmploymentMutation(store, payload, options = {}) {
  const meta = {};
  const isCreate = options.mode === "create";
  const currentId = options.currentId || null;

  if (isCreate) {
    validateForeignKey(
      meta,
      store,
      payload,
      "profile_id",
      "profiles",
      "Profile",
      true
    );
  } else if (hasOwn(payload, "profile_id")) {
    validateForeignKey(meta, store, payload, "profile_id", "profiles", "Profile");
  }

  [
    ["position_id", "positions", "Position"],
    ["company_id", "companies", "Company"],
    ["directorat_id", "directorats", "Directorat"],
    ["personel_area_id", "personel_areas", "Personel area"],
    ["personel_sub_area_id", "personel_sub_areas", "Personel sub area"],
    ["plant_area_id", "plant_areas", "Plant area"],
    ["organization_id", "organizations", "Organization"],
    ["department_id", "departments", "Department"],
    ["organization_function_id", "organization_functions", "Organization function"],
    ["department_function_id", "organization_functions", "Organization function"],
  ].forEach(([field, collectionName, label]) => {
    validateForeignKey(meta, store, payload, field, collectionName, label);
  });

  if (hasOwn(payload, "parent_employment_id")) {
    if (
      payload.parent_employment_id !== null &&
      payload.parent_employment_id !== ""
    ) {
      const parentId = parseId(payload.parent_employment_id);
      if (!parentId) {
        addError(meta, "parent_employment_id", "Parent employment must be a valid id.");
      } else if (!findRecord(store, "employments", parentId)) {
        addError(meta, "parent_employment_id", "Parent employment was not found.");
      } else if (Number(parentId) === Number(currentId)) {
        addError(meta, "parent_employment_id", "Employment cannot report to itself.");
      }
    }
  }

  ensureValid(meta, "Employment payload is invalid.");
}

function validateRequirementScoreMutation(store, payload, options = {}) {
  const meta = {};
  const isCreate = options.mode === "create";

  if (isCreate || hasOwn(payload, "position_id")) {
    validateForeignKey(
      meta,
      store,
      payload,
      "position_id",
      "positions",
      "Position",
      isCreate
    );
  }
  if (isCreate || hasOwn(payload, "competency_id")) {
    validateForeignKey(
      meta,
      store,
      payload,
      "competency_id",
      "competencies",
      "Competency",
      isCreate
    );
  }
  if (isCreate || hasOwn(payload, "competency_level_id")) {
    validateForeignKey(
      meta,
      store,
      payload,
      "competency_level_id",
      "competency_levels",
      "Competency level",
      isCreate
    );
  }
  validateNonNegativeNumber(
    meta,
    payload,
    "minimum_score",
    "Minimum score",
    isCreate
  );

  const hasPosition =
    isCreate || hasOwn(payload, "position_id") ? parseId(payload.position_id) : null;
  const hasCompetency =
    isCreate || hasOwn(payload, "competency_id")
      ? parseId(payload.competency_id)
      : null;

  if (hasPosition && hasCompetency) {
    const duplicate = store.collections.requirement_scores.find(
      (item) =>
        Number(item.id) !== Number(options.currentId || null) &&
        Number(item.position_id) === Number(hasPosition) &&
        Number(item.competency_id) === Number(hasCompetency)
    );

    if (duplicate) {
      addError(
        meta,
        "competency_id",
        "Requirement score for this position and competency already exists."
      );
    }
  }

  ensureValid(meta, "Requirement score payload is invalid.");
}

function validateTrainingMutation(store, payload, options = {}) {
  const meta = {};
  const isCreate = options.mode === "create";

  validateRequiredString(
    meta,
    payload,
    "training_title",
    "Training title",
    isCreate
  );
  validateForeignKey(meta, store, payload, "competency_id", "competencies", "Competency");
  validateForeignKey(
    meta,
    store,
    payload,
    "training_competency_level_stack_key",
    "competency_levels",
    "Competency level"
  );
  validateUniqueString(meta, store, payload, "training_title", "trainings", "Training title", {
    required: isCreate,
    currentId: options.currentId,
  });

  ensureValid(meta, "Training payload is invalid.");
}

function validatePublicationMutation(store, payload, options = {}) {
  const meta = {};
  const isCreate = options.mode === "create";
  const currentPublication = options.currentId
    ? findRecord(store, "publications", options.currentId)
    : null;
  const titleCandidate =
    payload.publication_title || payload.publication_slug || options.fileName || null;
  const slugCandidate = hasOwn(payload, "publication_slug")
    ? slugify(payload.publication_slug || "")
    : currentPublication?.publication_slug
      ? slugify(currentPublication.publication_slug)
      : slugify(payload.publication_title || options.fileName || "");

  if (isCreate && isBlank(titleCandidate)) {
    addError(
      meta,
      "publication_title",
      "Publication title or slug is required."
    );
  }

  if (isCreate || hasOwn(payload, "bucket_id")) {
    validateForeignKey(meta, store, payload, "bucket_id", "buckets", "Bucket");
  }
  if (isCreate || hasOwn(payload, "publication_category_id")) {
    validateForeignKey(
      meta,
      store,
      payload,
      "publication_category_id",
      "publication_categories",
      "Publication category"
    );
  }
  if (!slugCandidate) {
    addError(meta, "publication_slug", "Publication slug is required.");
  } else {
    const duplicate = store.collections.publications.find(
      (item) =>
        Number(item.id) !== Number(options.currentId || null) &&
        slugify(item.publication_slug || item.publication_title || "") === slugCandidate
    );

    if (duplicate) {
      addError(meta, "publication_slug", "Publication slug has already been taken.");
    }
  }

  ensureValid(meta, "Publication payload is invalid.");
}

function validateBucketMutation(store, payload, options = {}) {
  const meta = {};
  const isCreate = options.mode === "create";

  validateRequiredString(meta, payload, "bucket_name", "Bucket name", isCreate);
  validateUniqueString(meta, store, payload, "bucket_name", "buckets", "Bucket name", {
    required: isCreate,
    currentId: options.currentId,
  });
  if (isCreate || hasOwn(payload, "bucket_category_id")) {
    validateForeignKey(
      meta,
      store,
      payload,
      "bucket_category_id",
      "bucket_categories",
      "Bucket category"
    );
  }
  if (isCreate || hasOwn(payload, "bucket_author_employment_id")) {
    validateForeignKey(
      meta,
      store,
      payload,
      "bucket_author_employment_id",
      "employments",
      "Bucket author"
    );
  }

  ensureValid(meta, "Bucket payload is invalid.");
}

function validatePublicationStorageMutation(store, payload, options = {}) {
  const meta = {};
  const isCreate = options.mode === "create";

  if (isCreate || hasOwn(payload, "publication_id")) {
    validateForeignKey(
      meta,
      store,
      payload,
      "publication_id",
      "publications",
      "Publication",
      isCreate
    );
  }
  validateRequiredString(meta, payload, "document_name", "Document name", isCreate);
  validateRequiredString(
    meta,
    payload,
    "document_extension",
    "Document extension",
    isCreate
  );
  validateRequiredString(meta, payload, "document_path", "Document path", isCreate);
  validateRequiredString(meta, payload, "document_size", "Document size", isCreate);

  ensureValid(meta, "Publication storage payload is invalid.");
}

function validateSimpleNameMutation(payload, field, label, options = {}) {
  const meta = {};
  validateRequiredString(meta, payload, field, label, options.mode === "create");
  ensureValid(meta, `${label} payload is invalid.`);
}

function validateUniqueSimpleNameMutation(
  store,
  payload,
  field,
  label,
  collectionName,
  options = {}
) {
  const meta = {};
  validateRequiredString(meta, payload, field, label, options.mode === "create");
  validateUniqueString(meta, store, payload, field, collectionName, label, {
    required: options.mode === "create",
    currentId: options.currentId,
  });
  ensureValid(meta, `${label} payload is invalid.`);
}

function validateAssessmentRecordMutation(store, payload, options = {}) {
  const meta = {};
  const isCreate = options.mode === "create";

  if (isCreate || hasOwn(payload, "employment_id")) {
    validateForeignKey(
      meta,
      store,
      payload,
      "employment_id",
      "employments",
      "Employment",
      isCreate
    );
  }
  if (isCreate || hasOwn(payload, "position_id")) {
    validateForeignKey(
      meta,
      store,
      payload,
      "position_id",
      "positions",
      "Position",
      isCreate
    );
  }
  if (isCreate || hasOwn(payload, "competency_id")) {
    validateForeignKey(
      meta,
      store,
      payload,
      "competency_id",
      "competencies",
      "Competency",
      isCreate
    );
  }
  if (hasOwn(payload, "competency_level_id")) {
    validateForeignKey(
      meta,
      store,
      payload,
      "competency_level_id",
      "competency_levels",
      "Competency level"
    );
  }
  if (hasOwn(payload, "training_id")) {
    validateForeignKey(meta, store, payload, "training_id", "trainings", "Training");
  }
  if (isCreate || hasOwn(payload, "assessment_schedule_id")) {
    validateForeignKey(
      meta,
      store,
      payload,
      "assessment_schedule_id",
      "assessment_schedules",
      "Assessment schedule",
      isCreate
    );
  }
  validateNonNegativeNumber(
    meta,
    payload,
    "assessment_score",
    "Assessment score",
    false
  );
  validateNonNegativeNumber(meta, payload, "minimum_score", "Minimum score", false);

  ensureValid(meta, "Assessment payload is invalid.");
}

function validatePeriodicalAssessmentMutation(store, payload, options = {}) {
  const meta = {};
  const isCreate = options.mode === "create";

  if (isCreate || hasOwn(payload, "employment_id")) {
    validateForeignKey(
      meta,
      store,
      payload,
      "employment_id",
      "employments",
      "Employment",
      isCreate
    );
  }
  if (isCreate || hasOwn(payload, "assessment_schedule_id")) {
    validateForeignKey(
      meta,
      store,
      payload,
      "assessment_schedule_id",
      "assessment_schedules",
      "Assessment schedule",
      isCreate
    );
  }
  validateRequiredString(
    meta,
    payload,
    "parameters_name",
    "Parameter name",
    isCreate
  );

  ensureValid(meta, "Periodical assessment payload is invalid.");
}

function validateCertificationMutation(store, payload, options = {}) {
  const meta = {};
  const isCreate = options.mode === "create";

  if (isCreate || hasOwn(payload, "employment_id")) {
    validateForeignKey(
      meta,
      store,
      payload,
      "employment_id",
      "employments",
      "Employment",
      isCreate
    );
  }
  validateRequiredString(
    meta,
    payload,
    "certification_name",
    "Certification name",
    isCreate
  );

  ensureValid(meta, "Certification payload is invalid.");
}

function validateProfileMutation(store, payload, options = {}) {
  const meta = {};
  if (options.mode === "create" || hasOwn(payload, "user_id")) {
    validateForeignKey(meta, store, payload, "user_id", "users", "User", options.mode === "create");
  }

  ensureValid(meta, "Profile payload is invalid.");
}

function validateGenericMutation(store, resource, payload, options = {}) {
  const resourceKind = normalizeResource(resource);
  const mutationOptions = {
    mode: options.mode || "create",
    currentId: options.currentId || null,
    fileName: options.fileName || null,
  };

  switch (resourceKind) {
    case "users":
      return validateUserMutation(store, payload, mutationOptions);
    case "roles":
      return validateUserRolePermissions(store, payload, mutationOptions);
    case "permissions":
      return validateUniqueSimpleNameMutation(
        store,
        payload,
        "name",
        "Permission",
        "permissions",
        mutationOptions
      );
    case "profiles":
      return validateProfileMutation(store, payload, mutationOptions);
    case "companies":
      return validateSimpleNameMutation(
        payload,
        "company_name",
        "Company",
        mutationOptions
      );
    case "directorats":
      return validateSimpleNameMutation(
        payload,
        "directorat_name",
        "Directorat",
        mutationOptions
      );
    case "personel_areas":
      return validateSimpleNameMutation(
        payload,
        "personel_area_name",
        "Personel area",
        mutationOptions
      );
    case "personel_sub_areas":
      return validateSimpleNameMutation(
        payload,
        "personel_sub_area_name",
        "Personel sub area",
        mutationOptions
      );
    case "plant_areas":
      return validateSimpleNameMutation(
        payload,
        "plant_area_name",
        "Plant area",
        mutationOptions
      );
    case "organizations":
      return validateSimpleNameMutation(
        payload,
        "organization_name",
        "Organization",
        mutationOptions
      );
    case "departments":
      return validateSimpleNameMutation(
        payload,
        "department_name",
        "Department",
        mutationOptions
      );
    case "organization_functions":
      return validateSimpleNameMutation(
        payload,
        "organization_function_name",
        "Organization function",
        mutationOptions
      );
    case "positions":
      return validateUniqueSimpleNameMutation(
        store,
        payload,
        "position_name",
        "Position",
        "positions",
        mutationOptions
      );
    case "competencies":
      return validateUniqueSimpleNameMutation(
        store,
        payload,
        "competency_name",
        "Competency",
        "competencies",
        mutationOptions
      );
    case "competency_levels":
      return validateUniqueSimpleNameMutation(
        store,
        payload,
        "competency_level_name",
        "Competency level",
        "competency_levels",
        mutationOptions
      );
    case "trainings":
      return validateTrainingMutation(store, payload, mutationOptions);
    case "certifications":
      return validateCertificationMutation(store, payload, mutationOptions);
    case "requirement_scores":
      return validateRequirementScoreMutation(store, payload, mutationOptions);
    case "assessment_schedules":
      return validateSimpleNameMutation(
        payload,
        "assessment_schedule_title",
        "Assessment schedule",
        mutationOptions
      );
    case "assessment_records":
      return validateAssessmentRecordMutation(store, payload, mutationOptions);
    case "periodical_general_assessments":
      return validatePeriodicalAssessmentMutation(store, payload, mutationOptions);
    case "employments":
      return validateEmploymentMutation(store, payload, mutationOptions);
    case "buckets":
      return validateBucketMutation(store, payload, mutationOptions);
    case "publications":
      return validatePublicationMutation(store, payload, mutationOptions);
    case "publication_storages":
      return validatePublicationStorageMutation(store, payload, mutationOptions);
    case "publication_categories":
      return validateUniqueSimpleNameMutation(
        store,
        payload,
        "publication_category_name",
        "Publication category",
        "publication_categories",
        mutationOptions
      );
    case "bucket_categories":
      return validateUniqueSimpleNameMutation(
        store,
        payload,
        "bucket_category_name",
        "Bucket category",
        "bucket_categories",
        mutationOptions
      );
    default:
      return undefined;
  }
}

function validateUserRolePermissions(store, payload, options = {}) {
  const meta = {};
  validateRequiredString(meta, payload, "name", "Role", options.mode === "create");
  validateIdList(meta, store, payload, "permission_ids", "permissions", "Permission");
  ensureValid(meta, "Role payload is invalid.");
}

function validateChangeParentEmploymentPayload(store, payload) {
  const employment = requireExistingRecord(
    store,
    "employments",
    payload?.employment_id,
    "Employment was not found"
  );
  const meta = {};

  if (payload?.parent_employment_id !== null && payload?.parent_employment_id !== "") {
    const parentId = parseId(payload.parent_employment_id);
    if (!parentId) {
      addError(meta, "parent_employment_id", "Parent employment must be a valid id.");
    } else if (Number(parentId) === Number(employment.id)) {
      addError(meta, "parent_employment_id", "Employment cannot report to itself.");
    } else if (!findRecord(store, "employments", parentId)) {
      addError(meta, "parent_employment_id", "Parent employment was not found.");
    }
  }

  ensureValid(meta, "Parent employment payload is invalid.");
}

function validateAddPositionPayload(store, employmentId, payload) {
  requireExistingRecord(store, "employments", employmentId, "Employment was not found");
  const meta = {};
  const positionId = parseId(payload?.positionId);
  if (!positionId) {
    addError(meta, "positionId", "Position is required.");
  } else if (!findRecord(store, "positions", positionId)) {
    addError(meta, "positionId", "Position was not found.");
  }
  ensureValid(meta, "Position assignment payload is invalid.");
}

function validateAssessmentTransactionPayload(store, employmentId, payload = {}) {
  requireExistingRecord(store, "employments", employmentId, "Employment was not found");

  const meta = {};
  const positionId = parseId(payload.positionId);
  if (!positionId) {
    addError(meta, "positionId", "Position is required.");
  } else if (!findRecord(store, "positions", positionId)) {
    addError(meta, "positionId", "Position was not found.");
  }

  const assessmentScheduleId = parseId(
    payload.periodicalAssessmentRecord?.assessmentSchedule
  );
  if (!assessmentScheduleId) {
    addError(
      meta,
      "periodicalAssessmentRecord.assessmentSchedule",
      "Assessment schedule is required."
    );
  } else if (!findRecord(store, "assessment_schedules", assessmentScheduleId)) {
    addError(
      meta,
      "periodicalAssessmentRecord.assessmentSchedule",
      "Assessment schedule was not found."
    );
  }

  const records = Array.isArray(payload.assessmentRecord)
    ? payload.assessmentRecord
    : [];
  const parameters = Array.isArray(payload.periodicalAssessmentRecord?.parameters)
    ? payload.periodicalAssessmentRecord.parameters
    : [];

  if (records.length === 0 && parameters.length === 0) {
    addError(
      meta,
      "assessmentRecord",
      "Assessment payload must contain competency scores or periodical parameters."
    );
  }

  records.forEach((record, index) => {
    const competencyId = parseId(record?.competencyId);
    if (!competencyId) {
      addError(meta, `assessmentRecord.${index}.competencyId`, "Competency is required.");
    } else if (!findRecord(store, "competencies", competencyId)) {
      addError(
        meta,
        `assessmentRecord.${index}.competencyId`,
        "Competency was not found."
      );
    }

    if (record?.selectedTraining !== null && record?.selectedTraining !== undefined && record?.selectedTraining !== "") {
      const trainingId = parseId(record.selectedTraining);
      if (!trainingId) {
        addError(
          meta,
          `assessmentRecord.${index}.selectedTraining`,
          "Training must be a valid id."
        );
      } else if (!findRecord(store, "trainings", trainingId)) {
        addError(
          meta,
          `assessmentRecord.${index}.selectedTraining`,
          "Training was not found."
        );
      }
    }

    if (record?.value !== null && record?.value !== undefined && record?.value !== "") {
      const score = Number(record.value);
      if (!Number.isFinite(score) || score < 0) {
        addError(
          meta,
          `assessmentRecord.${index}.value`,
          "Assessment score must be a non-negative number."
        );
      }
    }
  });

  parameters.forEach((parameter, index) => {
    if (isBlank(parameter?.name)) {
      addError(
        meta,
        `periodicalAssessmentRecord.parameters.${index}.name`,
        "Parameter name is required."
      );
    }
  });

  ensureValid(meta, "Assessment transaction payload is invalid.");
}

function validatePublicationUploadPayload(store, payload = {}, options = {}) {
  validatePublicationMutation(store, payload, {
    mode: "create",
    fileName: options.fileName || null,
  });
}

module.exports = {
  validateAuthRegisterPayload,
  validateLoginPayload,
  validatePasswordResetRequestPayload,
  validateResetPasswordPayload,
  validateGenericMutation,
  validateChangeParentEmploymentPayload,
  validateAddPositionPayload,
  validateAssessmentTransactionPayload,
  validatePublicationUploadPayload,
};
