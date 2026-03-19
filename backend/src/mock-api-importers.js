"use strict";

const path = require("node:path");
const core = require("./mock-api-core");

function getImportLabel(fileName, fallback) {
  if (!fileName) {
    return fallback;
  }

  const stem = path.basename(String(fileName), path.extname(String(fileName)));
  return stem
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim() || fallback;
}

function titleCase(value) {
  return String(value || "")
    .split(/\s+/)
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1).toLowerCase())
    .join(" ");
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
    profile_date_of_birth: options.profile_date_of_birth || "1995-01-01T00:00:00.000Z",
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
    employment_position_status:
      options.employment_position_status || "Acting",
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

function importEmployments(store, payload = {}) {
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
      imported_employments: importedEmployments,
    },
  };
}

function inferParentEmploymentId(store, employment) {
  const candidates = store.collections.employments
    .filter((candidate) => Number(candidate.id) !== Number(employment.id))
    .filter((candidate) => Number(candidate.profile_id) !== Number(employment.profile_id))
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

function importParentEmployments(store, payload = {}) {
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
