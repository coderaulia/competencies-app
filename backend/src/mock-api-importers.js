"use strict";

const path = require("node:path");
const core = require("./mock-api-core");
const { ValidationError } = require("./api-errors");
const { assertRequiredHeaders, parseCsvBuffer } = require("./csv-utils");

const EMPLOYMENT_REQUIRED_HEADERS = [
  "profile_fullname",
  "email",
  "employment_wsr",
];

const PARENT_EMPLOYMENT_REQUIRED_HEADERS = [
  "employment_wsr",
  "parent_employment_wsr",
];

const RELATION_LOOKUPS = {
  position: {
    collection: "positions",
    idHeader: "position_id",
    label: "Position",
    nameHeaders: ["position_name"],
    searchFields: ["position_name"],
  },
  company: {
    collection: "companies",
    idHeader: "company_id",
    label: "Company",
    nameHeaders: ["company_name"],
    searchFields: ["company_name"],
  },
  directorat: {
    collection: "directorats",
    idHeader: "directorat_id",
    label: "Directorat",
    nameHeaders: ["directorat_name"],
    searchFields: ["directorat_name"],
  },
  personelArea: {
    collection: "personel_areas",
    idHeader: "personel_area_id",
    label: "Personel area",
    nameHeaders: ["personel_area_text", "personel_area_code"],
    searchFields: ["personel_area_text", "personel_area_code"],
  },
  personelSubArea: {
    collection: "personel_sub_areas",
    idHeader: "personel_sub_area_id",
    label: "Personel sub area",
    nameHeaders: ["personel_sub_area_text", "personel_sub_area_code"],
    searchFields: ["personel_sub_area_text", "personel_sub_area_code"],
  },
  plantArea: {
    collection: "plant_areas",
    idHeader: "plant_area_id",
    label: "Plant area",
    nameHeaders: ["plant_area_name"],
    searchFields: ["plant_area_name"],
  },
  organization: {
    collection: "organizations",
    idHeader: "organization_id",
    label: "Organization",
    nameHeaders: ["organization_name"],
    searchFields: ["organization_name"],
  },
  department: {
    collection: "departments",
    idHeader: "department_id",
    label: "Department",
    nameHeaders: ["department_name"],
    searchFields: ["department_name"],
  },
  organizationFunction: {
    collection: "organization_functions",
    idHeader: "organization_function_id",
    label: "Organization function",
    nameHeaders: ["organization_function_name", "department_function_name"],
    searchFields: ["organization_function_name"],
  },
};

function getImportLabel(fileName, fallback) {
  if (!fileName) {
    return fallback;
  }

  const stem = path.basename(String(fileName), path.extname(String(fileName)));
  return (
    stem.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim() || fallback
  );
}

function titleCase(value) {
  return String(value || "")
    .split(/\s+/)
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1).toLowerCase())
    .join(" ");
}

function isBlank(value) {
  return String(value ?? "").trim() === "";
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeEmail(value) {
  return normalizeText(value);
}

function normalizeWsr(value) {
  return String(value || "").trim().toUpperCase();
}

function parseId(value) {
  if (isBlank(value)) {
    return null;
  }

  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function parseDelimitedValues(value) {
  return String(value || "")
    .split(/[|,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function addRowError(meta, rowNumber, field, message) {
  const key = `rows.${rowNumber}.${field}`;
  meta[key] = meta[key] || [];
  meta[key].push(message);
}

function ensureCsvSupport(payload) {
  if (!payload.fileBuffer) {
    return;
  }

  const extension = path.extname(String(payload.fileName || "")).toLowerCase();
  if (extension && extension !== ".csv") {
    throw new ValidationError(
      "Only CSV imports are supported in local mode.",
      {
        file: [
          "Download the CSV template, edit it in Excel if needed, then upload the file as .csv.",
        ],
      }
    );
  }
}

function findRecordByFieldValue(store, collectionName, searchFields, rawValue) {
  const normalizedValue = normalizeText(rawValue);
  if (!normalizedValue) {
    return null;
  }

  return (
    (store.collections[collectionName] || []).find((record) =>
      searchFields.some(
        (field) => normalizeText(record[field]) === normalizedValue
      )
    ) || null
  );
}

function resolveRelationId(store, row, rowNumber, meta, config) {
  const explicitId = parseId(row[config.idHeader]);
  if (row[config.idHeader] && !explicitId) {
    addRowError(
      meta,
      rowNumber,
      config.idHeader,
      `${config.label} id must be a valid numeric value.`
    );
    return null;
  }

  if (explicitId) {
    const record = core.findById(store, config.collection, explicitId);
    if (!record) {
      addRowError(
        meta,
        rowNumber,
        config.idHeader,
        `${config.label} was not found.`
      );
      return null;
    }
    return record.id;
  }

  const nameHeader = config.nameHeaders.find((header) => !isBlank(row[header]));
  if (!nameHeader) {
    return null;
  }

  const record = findRecordByFieldValue(
    store,
    config.collection,
    config.searchFields,
    row[nameHeader]
  );

  if (!record) {
    addRowError(
      meta,
      rowNumber,
      nameHeader,
      `${config.label} was not found.`
    );
    return null;
  }

  return record.id;
}

function resolveRoleIds(store, row, rowNumber, meta) {
  const roleIds = [];
  const seen = new Set();

  parseDelimitedValues(row.role_ids).forEach((value) => {
    const roleId = parseId(value);
    if (!roleId) {
      addRowError(meta, rowNumber, "role_ids", "Role ids must be numeric values.");
      return;
    }

    const role = core.findById(store, "roles", roleId);
    if (!role) {
      addRowError(meta, rowNumber, "role_ids", "Role was not found.");
      return;
    }

    if (!seen.has(role.id)) {
      seen.add(role.id);
      roleIds.push(role.id);
    }
  });

  parseDelimitedValues(row.role_names).forEach((value) => {
    const role = findRecordByFieldValue(store, "roles", ["name"], value);
    if (!role) {
      addRowError(meta, rowNumber, "role_names", "Role was not found.");
      return;
    }

    if (!seen.has(role.id)) {
      seen.add(role.id);
      roleIds.push(role.id);
    }
  });

  return roleIds;
}

function findUserByEmail(store, email) {
  return (
    store.collections.users.find(
      (user) => normalizeEmail(user.email) === normalizeEmail(email)
    ) || null
  );
}

function findEmploymentByWsr(store, employmentWsr) {
  return (
    store.collections.employments.find(
      (employment) =>
        normalizeWsr(employment.employment_wsr) === normalizeWsr(employmentWsr)
    ) || null
  );
}

function findEmploymentForProfile(store, profileId) {
  return (
    store.collections.employments.find(
      (employment) => Number(employment.profile_id) === Number(profileId)
    ) || null
  );
}

function createImportedEmployment(store, options = {}) {
  const userId = store.counters.users || 1;
  const profileName = titleCase(
    `${options.batchLabel || "Imported"} ${options.roleLabel || "Employee"} ${userId}`
  );
  const emailSlug = profileName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/(^\.|\.$)/g, "");

  const user = core.createGenericRecord(store, "users", {
    name: profileName,
    email: `${emailSlug}@example.com`,
    role_ids: options.role_ids || [],
    profile_fullname: profileName,
    profile_gender: options.profile_gender || "Unknown",
    profile_place_of_birth: options.profile_place_of_birth || "Jakarta",
    profile_date_of_birth:
      options.profile_date_of_birth || "1995-01-01T00:00:00.000Z",
    profile_marital_status: options.profile_marital_status || "Single",
    profile_nationality: options.profile_nationality || "Indonesia",
    profile_religion: options.profile_religion || "Islam",
  });

  return core.createGenericRecord(store, "employments", {
    employment_hiring_date:
      options.employment_hiring_date || new Date().toISOString(),
    employment_end_date: null,
    employment_group_type_name: options.employment_group_type_name || "Contract",
    employment_group_age: options.employment_group_age || "Junior",
    employment_status: options.employment_status || "Active",
    employment_position_status: options.employment_position_status || "Acting",
    employment_wsr:
      options.employment_wsr || `IMP-${String(user.id).padStart(3, "0")}`,
    parent_employment_id: options.parent_employment_id ?? null,
    profile_id: user.profile?.id || null,
    position_id: options.position_id || null,
    company_id: options.company_id || null,
    directorat_id: options.directorat_id || null,
    personel_area_id: options.personel_area_id || null,
    personel_sub_area_id: options.personel_sub_area_id || null,
    plant_area_id: options.plant_area_id || null,
    organization_id: options.organization_id || null,
    department_id: options.department_id || null,
    organization_function_id: options.organization_function_id || null,
  });
}

function inferParentEmploymentId(store, employment) {
  const candidates = store.collections.employments
    .filter((candidate) => Number(candidate.id) !== Number(employment.id))
    .filter(
      (candidate) => Number(candidate.profile_id) !== Number(employment.profile_id)
    )
    .filter((candidate) => {
      if (
        employment.organization_id &&
        employment.department_id &&
        candidate.organization_id &&
        candidate.department_id
      ) {
        return (
          Number(candidate.organization_id) === Number(employment.organization_id) &&
          Number(candidate.department_id) === Number(employment.department_id)
        );
      }

      if (employment.directorat_id && candidate.directorat_id) {
        return Number(candidate.directorat_id) === Number(employment.directorat_id);
      }

      return true;
    })
    .sort((left, right) => Number(left.id) - Number(right.id));

  return candidates[0]?.id || 1;
}

function buildEmploymentImportRows(store, payload = {}) {
  ensureCsvSupport(payload);

  const parsed = parseCsvBuffer(payload.fileBuffer);
  assertRequiredHeaders(
    parsed.headers,
    EMPLOYMENT_REQUIRED_HEADERS,
    "Employment import template is invalid."
  );

  if (parsed.rows.length === 0) {
    throw new ValidationError("Employment import file does not contain any data rows.");
  }

  const meta = {};
  const seenEmails = new Set();
  const seenWsrs = new Set();

  const plannedRows = parsed.rows.map((row, index) => {
    const rowNumber = index + 2;
    const email = normalizeEmail(row.email);
    const employmentWsr = normalizeWsr(row.employment_wsr);

    if (!row.profile_fullname) {
      addRowError(meta, rowNumber, "profile_fullname", "Full name is required.");
    }

    if (!email) {
      addRowError(meta, rowNumber, "email", "Email is required.");
    } else if (seenEmails.has(email)) {
      addRowError(meta, rowNumber, "email", "Email must be unique in the import file.");
    } else {
      seenEmails.add(email);
    }

    if (!employmentWsr) {
      addRowError(meta, rowNumber, "employment_wsr", "Employment WSR is required.");
    } else if (seenWsrs.has(employmentWsr)) {
      addRowError(
        meta,
        rowNumber,
        "employment_wsr",
        "Employment WSR must be unique in the import file."
      );
    } else {
      seenWsrs.add(employmentWsr);
    }

    const relationIds = Object.values(RELATION_LOOKUPS).reduce(
      (accumulator, config) => {
        accumulator[config.idHeader] = resolveRelationId(
          store,
          row,
          rowNumber,
          meta,
          config
        );
        return accumulator;
      },
      {}
    );

    const roleIds = resolveRoleIds(store, row, rowNumber, meta);
    const parentEmploymentId = parseId(row.parent_employment_id);
    if (row.parent_employment_id && !parentEmploymentId) {
      addRowError(
        meta,
        rowNumber,
        "parent_employment_id",
        "Parent employment id must be numeric."
      );
    } else if (
      parentEmploymentId &&
      !core.findById(store, "employments", parentEmploymentId)
    ) {
      addRowError(
        meta,
        rowNumber,
        "parent_employment_id",
        "Parent employment was not found."
      );
    }

    return {
      rowNumber,
      email,
      employment_wsr: employmentWsr,
      parent_employment_wsr: normalizeWsr(row.parent_employment_wsr),
      parent_employment_id: parentEmploymentId,
      userPayload: {
        name: row.name || row.profile_fullname,
        email,
        password: row.password || "password",
        role_ids: roleIds,
        profile_fullname: row.profile_fullname,
        profile_gender: row.profile_gender || "Unknown",
        profile_place_of_birth: row.profile_place_of_birth || "Jakarta",
        profile_date_of_birth:
          row.profile_date_of_birth || "1995-01-01T00:00:00.000Z",
        profile_marital_status: row.profile_marital_status || "Single",
        profile_nationality: row.profile_nationality || "Indonesia",
        profile_religion: row.profile_religion || "Unknown",
      },
      employmentPayload: {
        employment_hiring_date:
          row.employment_hiring_date || new Date().toISOString(),
        employment_end_date: row.employment_end_date || null,
        employment_group_type_name: row.employment_group_type_name || "Contract",
        employment_group_age: row.employment_group_age || "Junior",
        employment_status: row.employment_status || "Active",
        employment_position_status:
          row.employment_position_status || "Active",
        employment_wsr: employmentWsr,
        parent_employment_id: parentEmploymentId,
        position_id: relationIds.position_id,
        company_id: relationIds.company_id,
        directorat_id: relationIds.directorat_id,
        personel_area_id: relationIds.personel_area_id,
        personel_sub_area_id: relationIds.personel_sub_area_id,
        plant_area_id: relationIds.plant_area_id,
        organization_id: relationIds.organization_id,
        department_id: relationIds.department_id,
        organization_function_id: relationIds.organization_function_id,
      },
    };
  });

  plannedRows.forEach((row) => {
    if (!row.parent_employment_wsr) {
      return;
    }

    if (row.parent_employment_wsr === row.employment_wsr) {
      addRowError(
        meta,
        row.rowNumber,
        "parent_employment_wsr",
        "Employment cannot report to itself."
      );
      return;
    }

    const parentExists =
      findEmploymentByWsr(store, row.parent_employment_wsr) ||
      plannedRows.some(
        (candidate) => candidate.employment_wsr === row.parent_employment_wsr
      );

    if (!parentExists) {
      addRowError(
        meta,
        row.rowNumber,
        "parent_employment_wsr",
        "Parent employment WSR was not found."
      );
    }
  });

  if (Object.keys(meta).length > 0) {
    throw new ValidationError("Employment import file is invalid.", meta);
  }

  return plannedRows;
}

function applyEmploymentImportRows(store, plannedRows) {
  const importedEmployments = [];
  let createdCount = 0;
  let updatedCount = 0;

  plannedRows.forEach((plannedRow) => {
    let user = findUserByEmail(store, plannedRow.email);
    if (user) {
      user = core.updateGenericRecord(store, "users", user.id, plannedRow.userPayload);
    } else {
      user = core.createGenericRecord(store, "users", plannedRow.userPayload);
    }

    const profileId = user?.profile?.id || null;
    const existingByWsr = findEmploymentByWsr(store, plannedRow.employment_wsr);
    const existingByProfile = profileId ? findEmploymentForProfile(store, profileId) : null;
    const existingEmployment = existingByWsr || existingByProfile;

    if (existingEmployment) {
      importedEmployments.push(
        core.updateGenericRecord(store, "employments", existingEmployment.id, {
          ...plannedRow.employmentPayload,
          profile_id: profileId,
        })
      );
      updatedCount += 1;
      return;
    }

    importedEmployments.push(
      core.createGenericRecord(store, "employments", {
        ...plannedRow.employmentPayload,
        profile_id: profileId,
      })
    );
    createdCount += 1;
  });

  plannedRows.forEach((plannedRow) => {
    const employment = findEmploymentByWsr(store, plannedRow.employment_wsr);
    if (!employment) {
      return;
    }

    let parentEmploymentId = plannedRow.parent_employment_id;
    if (!parentEmploymentId && plannedRow.parent_employment_wsr) {
      parentEmploymentId =
        findEmploymentByWsr(store, plannedRow.parent_employment_wsr)?.id || null;
    }

    if (parentEmploymentId !== undefined && parentEmploymentId !== null) {
      core.updateGenericRecord(store, "employments", employment.id, {
        parent_employment_id: parentEmploymentId,
      });
    }
  });

  return {
    importedEmployments: plannedRows
      .map((row) => findEmploymentByWsr(store, row.employment_wsr))
      .filter(Boolean)
      .map((employment) => core.employmentSummary(store, employment)),
    createdCount,
    updatedCount,
  };
}

function importEmployments(store, payload = {}) {
  if (!payload.fileBuffer) {
    const batchLabel = getImportLabel(payload.fileName, "Employment Import");
    const importedEmployments = [
      createImportedEmployment(store, {
        batchLabel,
        roleLabel: "Frontend Engineer",
        position_id: 3,
        company_id: 2,
        directorat_id: 2,
        personel_area_id: 1,
        personel_sub_area_id: 2,
        plant_area_id: 1,
        organization_id: 2,
        department_id: 2,
        organization_function_id: 2,
        employment_wsr: `IMP-FE-${String(store.counters.employments || 1).padStart(3, "0")}`,
      }),
      createImportedEmployment(store, {
        batchLabel,
        roleLabel: "Learning Officer",
        position_id: 5,
        company_id: 1,
        directorat_id: 1,
        personel_area_id: 1,
        personel_sub_area_id: 1,
        plant_area_id: 1,
        organization_id: 1,
        department_id: 1,
        organization_function_id: 1,
        employment_wsr: `IMP-LD-${String((store.counters.employments || 1) + 1).padStart(3, "0")}`,
      }),
    ];

    return {
      message: `Imported ${importedEmployments.length} dummy employments from ${batchLabel}.`,
      data: {
        resource: "employments",
        source_file: payload.fileName || null,
        imported_count: importedEmployments.length,
        created_count: importedEmployments.length,
        updated_count: 0,
        imported_employments: importedEmployments,
      },
    };
  }

  const plannedRows = buildEmploymentImportRows(store, payload);
  const appliedRows = applyEmploymentImportRows(store, plannedRows);

  return {
    message: `Imported ${appliedRows.importedEmployments.length} employment rows from ${payload.fileName}.`,
    data: {
      resource: "employments",
      source_file: payload.fileName || null,
      imported_count: appliedRows.importedEmployments.length,
      created_count: appliedRows.createdCount,
      updated_count: appliedRows.updatedCount,
      imported_employments: appliedRows.importedEmployments,
    },
  };
}

function buildParentEmploymentImportRows(store, payload = {}) {
  ensureCsvSupport(payload);

  const parsed = parseCsvBuffer(payload.fileBuffer);
  assertRequiredHeaders(
    parsed.headers,
    PARENT_EMPLOYMENT_REQUIRED_HEADERS,
    "Parent-employment import template is invalid."
  );

  if (parsed.rows.length === 0) {
    throw new ValidationError(
      "Parent-employment import file does not contain any data rows."
    );
  }

  const meta = {};
  const plannedRows = parsed.rows.map((row, index) => {
    const rowNumber = index + 2;
    const employmentWsr = normalizeWsr(row.employment_wsr);
    const parentEmploymentWsr = normalizeWsr(row.parent_employment_wsr);

    if (!employmentWsr) {
      addRowError(meta, rowNumber, "employment_wsr", "Employment WSR is required.");
    }

    const employment = employmentWsr
      ? findEmploymentByWsr(store, employmentWsr)
      : null;
    if (employmentWsr && !employment) {
      addRowError(meta, rowNumber, "employment_wsr", "Employment was not found.");
    }

    let parentEmployment = null;
    if (parentEmploymentWsr) {
      parentEmployment = findEmploymentByWsr(store, parentEmploymentWsr);
      if (!parentEmployment) {
        addRowError(
          meta,
          rowNumber,
          "parent_employment_wsr",
          "Parent employment was not found."
        );
      } else if (employment && Number(parentEmployment.id) === Number(employment.id)) {
        addRowError(
          meta,
          rowNumber,
          "parent_employment_wsr",
          "Employment cannot report to itself."
        );
      }
    }

    return {
      employment,
      rowNumber,
      employment_wsr: employmentWsr,
      parentEmployment,
      parent_employment_wsr: parentEmploymentWsr,
    };
  });

  if (Object.keys(meta).length > 0) {
    throw new ValidationError("Parent-employment import file is invalid.", meta);
  }

  return plannedRows;
}

function importParentEmployments(store, payload = {}) {
  if (payload.fileBuffer) {
    const plannedRows = buildParentEmploymentImportRows(store, payload);
    const updatedEmployments = plannedRows.map((plannedRow) => {
      const nextParentId = plannedRow.parentEmployment?.id || null;
      return core.updateGenericRecord(store, "employments", plannedRow.employment.id, {
        parent_employment_id: nextParentId,
      });
    });

    return {
      message: updatedEmployments.length
        ? `Synchronized ${updatedEmployments.length} employment reporting lines from ${payload.fileName}.`
        : "No employment hierarchy updates were needed.",
      data: {
        resource: "parent-employments",
        source_file: payload.fileName || null,
        updated_count: updatedEmployments.length,
        updated_employments: updatedEmployments,
      },
    };
  }

  const updatedEmployments = store.collections.employments
    .filter((employment) => Number(employment.id) !== 1)
    .filter((employment) => !employment.parent_employment_id)
    .map((employment) => {
      const parentEmploymentId = inferParentEmploymentId(store, employment);
      employment.parent_employment_id = parentEmploymentId;
      employment.updated_at = core.nowIso();
      return core.employmentSummary(store, employment);
    });

  return {
    message: updatedEmployments.length
      ? `Synchronized ${updatedEmployments.length} employment reporting lines.`
      : "No employment hierarchy updates were needed.",
    data: {
      resource: "parent-employments",
      source_file: payload.fileName || null,
      updated_count: updatedEmployments.length,
      updated_employments: updatedEmployments,
    },
  };
}

function importResource(store, resource, payload = {}) {
  switch (resource) {
    case "employments":
      return importEmployments(store, payload);
    case "parent-employments":
      return importParentEmployments(store, payload);
    default: {
      const fileName = payload.fileName ? ` (${payload.fileName})` : "";
      return {
        message: `Import for ${resource} accepted${fileName}.`,
        data: {
          resource,
          source_file: payload.fileName || null,
          imported_count: 0,
          updated_count: 0,
        },
      };
    }
  }
}

module.exports = {
  importResource,
};
