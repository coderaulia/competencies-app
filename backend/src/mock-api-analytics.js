"use strict";

const core = require("./mock-api-core");

function getEmploymentForUser(store, userId) {
  const profile = store.collections.profiles.find(
    (item) => Number(item.user_id) === Number(userId)
  );

  if (!profile) {
    return null;
  }

  return (
    store.collections.employments.find(
      (item) => Number(item.profile_id) === Number(profile.id)
    ) || null
  );
}

function getDescendantEmploymentIds(store, rootEmploymentId) {
  const descendants = new Set();
  const queue = [Number(rootEmploymentId)];

  while (queue.length > 0) {
    const currentId = queue.shift();
    const children = store.collections.employments.filter(
      (employment) => Number(employment.parent_employment_id) === Number(currentId)
    );

    children.forEach((child) => {
      if (!descendants.has(child.id)) {
        descendants.add(child.id);
        queue.push(child.id);
      }
    });
  }

  return descendants;
}

function getDashboardEmploymentRows(store, mode, includeAssessmentRecords, userId) {
  let employments = store.collections.employments.filter(
    (employment) => Number(employment.position_id) > 0
  );

  if (mode === "employee") {
    const rootEmployment = getEmploymentForUser(store, userId);
    if (rootEmployment) {
      const descendantIds = getDescendantEmploymentIds(store, rootEmployment.id);
      employments = employments.filter((employment) =>
        descendantIds.has(employment.id)
      );
    } else {
      employments = [];
    }
  }

  const filtered = employments.filter((employment) => {
    const hasRecords = store.collections.assessment_records.some(
      (record) => Number(record.employment_id) === Number(employment.id)
    );

    return includeAssessmentRecords ? hasRecords : !hasRecords;
  });

  return filtered.map((employment) => core.employmentSummary(store, employment));
}

function getDashboardEmploymentStats(
  store,
  mode,
  includeAssessmentRecords,
  query,
  userId
) {
  return core.toRootPagination(
    core.paginate(
      getDashboardEmploymentRows(store, mode, includeAssessmentRecords, userId),
      query
    )
  );
}

function getDashboardExportBuffer(store, mode, userId) {
  const rows = getDashboardEmploymentRows(store, mode, true, userId);
  const header = "id,employee_name,position_name,report_to\n";
  const body = rows
    .map((employment) => {
      const values = [
        employment.id,
        employment.profile?.profile_fullname || "",
        employment.position?.position_name || "",
        employment.parent?.profile?.profile_fullname || "",
      ];
      return values.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",");
    })
    .join("\n");

  return Buffer.from(header + body, "utf8");
}

function getPositionStatistics(store) {
  const positions = store.collections.positions;
  const hasCompetencyCount = positions.filter((position) =>
    store.collections.requirement_scores.some(
      (score) => Number(score.position_id) === Number(position.id)
    )
  ).length;

  return {
    data: {
      hasCompetency: {
        count: hasCompetencyCount,
      },
      hasNotCompetency: {
        count: positions.length - hasCompetencyCount,
      },
    },
  };
}

function listEmployeeAnalytics(store, query) {
  const employments = store.collections.employments
    .filter((employment) =>
      store.collections.assessment_records.some(
        (record) => Number(record.employment_id) === Number(employment.id)
      )
    )
    .map((employment) => {
      const hydrated = core.employmentSummary(store, employment);
      return {
        employe_id: hydrated.id,
        employe_name: hydrated.profile?.profile_fullname,
        employe_position: hydrated.position?.position_name,
        employe_organization:
          hydrated.organization?.organization_name || hydrated.company?.company_name,
        employe_organization_function:
          hydrated.organization_function?.organization_function_name ||
          hydrated.directorat?.directorat_name,
        employe_report_to: hydrated.parent?.profile?.profile_fullname || "-",
      };
    });

  return core.paginate(employments, query);
}

function getEmployeeAnalyticsDetail(store, employmentId) {
  const employment = core.employmentSummary(
    store,
    core.findById(store, "employments", employmentId)
  );

  if (!employment) {
    return null;
  }

  const scheduleIds = Array.from(
    new Set(
      employment.assessment_records
        .map((record) => record.assessment_schedule_id)
        .filter(Boolean)
    )
  );

  return {
    data: {
      employe_id: employment.id,
      employe_name: employment.profile?.profile_fullname,
      employe_position: employment.position?.position_name,
      employe_report_to: employment.parent?.profile?.profile_fullname || "-",
      employe_asssessment_chart_data: scheduleIds.map((scheduleId) => {
        const records = employment.assessment_records
          .filter(
            (record) => Number(record.assessment_schedule_id) === Number(scheduleId)
          )
          .map((record) => {
            const competency = core.findById(
              store,
              "competencies",
              record.competency_id
            );
            const minimumScore = Number(record.minimum_score || 0);
            const assessmentScore = Number(record.assessment_score || 0);
            const ratio =
              minimumScore > 0 ? Math.min(assessmentScore / minimumScore, 1) : 1;

            return {
              competency_name: competency?.competency_name || "Unknown",
              minimum_score: minimumScore,
              assessment_score: assessmentScore,
              gap_score: Number(record.gap_score || 0),
              ratio,
            };
          });

        return {
          schedule_id: scheduleId,
          assessment_records: records,
        };
      }),
    },
  };
}

function getAppliedEmployeesAnalytics(store) {
  return {
    statistics: store.collections.assessment_schedules.map((schedule) => {
      const appliedIds = new Set(
        store.collections.assessment_records
          .filter(
            (record) =>
              Number(record.assessment_schedule_id) === Number(schedule.id)
          )
          .map((record) => record.employment_id)
      );

      const total = store.collections.employments.filter(
        (employment) => Number(employment.position_id) > 0
      ).length;

      return {
        schedule_meta: core.assessmentScheduleSummary(schedule),
        schedule_applied_employe: appliedIds.size,
        schedule_not_applied_employee: Math.max(total - appliedIds.size, 0),
      };
    }),
  };
}

function getDepartmentAnalyticsSource(store) {
  const useDepartments =
    Array.isArray(store.collections.departments) &&
    store.collections.departments.length > 0 &&
    store.collections.employments.some((employment) => employment.department_id);

  return {
    useDepartments,
    collectionName: useDepartments ? "departments" : "directorats",
    relationField: useDepartments ? "department_id" : "directorat_id",
    nameField: useDepartments ? "department_name" : "directorat_name",
  };
}

function getDepartmentList(store) {
  const source = getDepartmentAnalyticsSource(store);
  return {
    data: store.collections[source.collectionName].map((record) => ({
      department_id: record.id,
      department_name: record[source.nameField],
    })),
    pagination: null,
    links: null,
  };
}

function getDepartmentDetail(store, directoratId, showParticipation) {
  const source = getDepartmentAnalyticsSource(store);
  const departmentSource = core.findById(
    store,
    source.collectionName,
    directoratId
  );
  if (!departmentSource) {
    return null;
  }

  const employments = store.collections.employments.filter(
    (employment) =>
      Number(employment[source.relationField]) === Number(directoratId)
  );

  const schedules = store.collections.assessment_schedules.map((schedule) => {
    const participants = employments
      .filter((employment) =>
        store.collections.assessment_records.some(
          (record) =>
            Number(record.employment_id) === Number(employment.id) &&
            Number(record.assessment_schedule_id) === Number(schedule.id)
        )
      )
      .map((employment) => core.employmentSummary(store, employment));

    const employmentParticipatedOverview = participants.map((employment) => {
      const matchingRecords = employment.assessment_records.filter(
        (record) => Number(record.assessment_schedule_id) === Number(schedule.id)
      );

      const gapAverage =
        matchingRecords.length === 0
          ? 0
          : matchingRecords.reduce((total, record) => {
              const minimumScore = Number(record.minimum_score || 0);
              const assessmentScore = Number(record.assessment_score || 0);
              const ratio =
                minimumScore > 0
                  ? Math.min(assessmentScore / minimumScore, 1)
                  : 1;
              return total + ratio * 100;
            }, 0) / matchingRecords.length;

      return {
        employe_id: employment.id,
        employe_profile_id: employment.profile_id,
        employe_user_id: employment.profile?.user_id || null,
        employe_profile_name: employment.profile?.profile_fullname,
        employe_parent_profile_name:
          employment.parent?.profile?.profile_fullname || "-",
        employe_position_name: employment.position?.position_name,
        employe_gap_average_assessment_score: Number(gapAverage.toFixed(2)),
        employe_gap_assessment_score: matchingRecords.map((record) => {
          const competency = core.findById(
            store,
            "competencies",
            record.competency_id
          );
          const minimumScore = Number(record.minimum_score || 0);
          const assessmentScore = Number(record.assessment_score || 0);

          return {
            assessment_id: record.id,
            assessment_schedule_id: schedule.id,
            assessment_competency_id: record.competency_id,
            assessment_minimum_score: minimumScore,
            assessment_assessment_score: assessmentScore,
            assessment_gap: Number(record.gap_score || 0),
            assessment_for_competency_name:
              competency?.competency_name || "Unknown",
            assessment_gap_ratio:
              minimumScore > 0
                ? Number(Math.min(assessmentScore / minimumScore, 1).toFixed(4))
                : 1,
          };
        }),
      };
    });

    const visibleParticipation = showParticipation
      ? employmentParticipatedOverview
      : employmentParticipatedOverview.slice(0, 3);

    const averageDepartmentScore =
      visibleParticipation.length === 0
        ? 0
        : visibleParticipation.reduce(
            (total, item) => total + item.employe_gap_average_assessment_score,
            0
          ) / visibleParticipation.length;

    return {
      assesment_schedule_id: schedule.id,
      assessment_schedule_title: schedule.assessment_schedule_title,
      assessment_schedule_description: schedule.assessment_schedule_description,
      assessment_schedule_year_period: schedule.assessment_schedule_year_period,
      assessment_schedule_phase_period: schedule.assessment_schedule_phase_period,
      employment_total: employments.length,
      employment_participated: participants.length,
      employment_not_participated: Math.max(
        employments.length - participants.length,
        0
      ),
      employment_participation_ratio:
        employments.length === 0
          ? 0
          : Number(((participants.length / employments.length) * 100).toFixed(2)),
      employment_average_gap_score_per_department: Number(
        averageDepartmentScore.toFixed(2)
      ),
      employment_participated_overview: visibleParticipation,
    };
  });

  const participatedAcrossSchedules = new Set(
    schedules.flatMap((schedule) =>
      schedule.employment_participated_overview.map((item) => item.employe_id)
    )
  );

  return {
    data: {
      department_id: departmentSource.id,
      department_name: departmentSource[source.nameField],
      employee_competence_ratio:
        employments.length === 0
          ? 0
          : Number(
              ((participatedAcrossSchedules.size / employments.length) * 100).toFixed(
                2
              )
            ),
      department_overview: {
        assessment_by_schedules: schedules,
      },
    },
  };
}

function listEmploymentAutocompleteOptions(store) {
  return {
    data: store.collections.employments.map((employment) => {
      const employee = core.employeeSummary(store, employment, {
        includeNested: false,
        employmentOptions: {
          includeHierarchy: false,
          includeAssessments: false,
        },
      });

      return {
        employment_id: employee.employment_id,
        profile_fullname: employee.profile_fullname,
        position_name: employee.position_name,
        parent_profile_fullname: employee.parent_profile_fullname,
      };
    }),
  };
}

function showEmploymentAutocompleteOption(store, id) {
  const employment = core.findById(store, "employments", id);
  if (!employment) {
    return null;
  }

  return {
    data: core.employmentSummary(store, employment),
  };
}

function changeParentEmployment(store, payload = {}) {
  const employment = core.findById(store, "employments", payload.employment_id);
  if (!employment) {
    return null;
  }

  employment.parent_employment_id = payload.parent_employment_id
    ? Number(payload.parent_employment_id)
    : null;
  employment.updated_at = core.nowIso();

  return {
    data: core.employmentSummary(store, employment),
    message: "Parent employment updated",
  };
}

function addPositionToEmployment(store, employmentId, payload = {}) {
  const employment = core.findById(store, "employments", employmentId);
  if (!employment) {
    return null;
  }

  employment.position_id = Number(payload.positionId) || null;
  employment.updated_at = core.nowIso();

  return {
    data: core.employmentSummary(store, employment),
    message: "Position assigned successfully",
  };
}

function saveAssessmentRecordTransaction(store, employmentId, payload = {}) {
  const employment = core.findById(store, "employments", employmentId);
  if (!employment) {
    return null;
  }

  const assessmentScheduleId = Number(
    payload.periodicalAssessmentRecord?.assessmentSchedule
  );

  store.collections.assessment_records = store.collections.assessment_records.filter(
    (record) =>
      !(
        Number(record.employment_id) === Number(employmentId) &&
        Number(record.assessment_schedule_id) === Number(assessmentScheduleId)
      )
  );

  store.collections.periodical_general_assessments =
    store.collections.periodical_general_assessments.filter(
      (record) =>
        !(
          Number(record.employment_id) === Number(employmentId) &&
          Number(record.assessment_schedule_id) === Number(assessmentScheduleId)
        )
    );

  (payload.assessmentRecord || []).forEach((record) => {
    const requirement = store.collections.requirement_scores.find(
      (item) =>
        Number(item.position_id) === Number(payload.positionId) &&
        Number(item.competency_id) === Number(record.competencyId)
    );

    store.collections.assessment_records.push({
      id: core.nextId(store, "assessment_records"),
      assessment_score: Number(record.value || 0),
      competency_id: Number(record.competencyId),
      competency_level_id: requirement?.competency_level_id || null,
      employment_id: Number(employmentId),
      gap_score: Number(record.gapScore || 0),
      minimum_score: Number(record.requiredScore || requirement?.minimum_score || 0),
      parent_employment_id: employment.parent_employment_id,
      position_id: Number(payload.positionId),
      training_id: record.selectedTraining ? Number(record.selectedTraining) : null,
      idp_exposure_experience: null,
      idp_status: record.idpStatus || null,
      assessment_schedule_id: assessmentScheduleId,
      created_at: core.nowIso(),
      updated_at: core.nowIso(),
    });
  });

  (payload.periodicalAssessmentRecord?.parameters || []).forEach((parameter) => {
    store.collections.periodical_general_assessments.push({
      id: core.nextId(store, "periodical_general_assessments"),
      employment_id: Number(employmentId),
      assessment_schedule_id: assessmentScheduleId,
      parameters_name: parameter.name,
      parameters_value: parameter.value,
      status: parameter.status,
      created_at: core.nowIso(),
      updated_at: core.nowIso(),
    });
  });

  return {
    data: core.employmentSummary(store, employment),
    message: "Assessment records saved",
  };
}

module.exports = {
  getDashboardEmploymentStats,
  getDashboardExportBuffer,
  getPositionStatistics,
  getAppliedEmployeesAnalytics,
  listEmployeeAnalytics,
  getEmployeeAnalyticsDetail,
  getDepartmentList,
  getDepartmentDetail,
  listEmploymentAutocompleteOptions,
  showEmploymentAutocompleteOption,
  changeParentEmployment,
  addPositionToEmployment,
  saveAssessmentRecordTransaction,
};
