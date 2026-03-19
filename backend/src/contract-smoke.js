"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
process.env.BACKEND_RESET_ON_BOOT = "true";
const { app } = require("./index");
const { DATABASE_FILE } = require("./store-persistence");

async function main() {
  const server = await new Promise((resolve) => {
    const instance = app.listen(0, () => resolve(instance));
  });

  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  async function request(path, options = {}) {
    const headers = { ...(options.headers || {}) };
    const isFormData = Boolean(options.formData);

    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    if (options.token) {
      headers.Authorization = `Bearer ${options.token}`;
    }

    const response = await fetch(`${baseUrl}${path}`, {
      method: options.method || "GET",
      headers,
      body: isFormData
        ? options.formData
        : options.body === undefined
          ? undefined
          : JSON.stringify(options.body),
    });

    const contentType = response.headers.get("content-type") || "";
    const payload =
      options.expectBinary || contentType.includes("application/pdf")
        ? Buffer.from(await response.arrayBuffer())
        : contentType.includes("application/json")
          ? await response.json()
          : await response.text();

    return {
      response,
      payload,
    };
  }

  async function assertSeededResource(resource, token) {
    const list = await request(`/api/${resource}?limit=2`, { token });
    assert.equal(
      list.response.status,
      200,
      `${resource} list should succeed for seeded data`
    );
    assert.ok(
      Array.isArray(list.payload.data),
      `${resource} list should return a data array`
    );
    assert.ok(
      list.payload.data.length > 0,
      `${resource} should have at least one seeded row`
    );

    const seededRecordId = list.payload.data[0]?.id;
    assert.ok(seededRecordId, `${resource} seeded row should expose an id`);

    const show = await request(`/api/${resource}/${seededRecordId}`, { token });
    assert.equal(
      show.response.status,
      200,
      `${resource} show should succeed for seeded data`
    );
    assert.equal(
      show.payload.data.id,
      seededRecordId,
      `${resource} show should return the requested seeded row`
    );
  }

  try {
    const login = await request("/api/auth/login", {
      method: "POST",
      body: {
        email: "demo@example.com",
        password: "password",
      },
    });

    assert.equal(login.response.status, 200, "login should succeed");
    const token = login.payload.oAuth.access_token;
    assert.ok(token, "login should return an access token");
    const authUser = await request("/api/auth/user", { token });
    assert.equal(authUser.response.status, 200, "auth user should succeed");
    assert.ok(authUser.payload.profile, "auth user should expose profile data");
    assert.ok(
      authUser.payload.profile?.employment,
      "auth user should expose linked employment data"
    );
    assert.ok(fs.existsSync(DATABASE_FILE), "persistent database file should exist");
    const loginPersistedState = JSON.parse(fs.readFileSync(DATABASE_FILE, "utf8"));
    assert.equal(
      loginPersistedState.collections.users[0].is_logged_in,
      true,
      "login should persist user session metadata"
    );
    assert.notEqual(
      loginPersistedState.collections.users[0].password,
      "password",
      "seeded passwords should not be persisted in plaintext"
    );
    assert.match(
      loginPersistedState.collections.users[0].password,
      /^scrypt\$/,
      "seeded passwords should be scrypt hashed"
    );

    const seededResources = [
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
      "requirement_scores",
      "assessment_schedules",
      "assessments",
      "assessment_records",
      "periodical_general_assessments",
      "employments",
      "certifications",
      "bucket_categories",
      "publication_categories",
      "buckets",
      "publications",
      "publication_storages",
      "employees",
    ];

    for (const resource of seededResources) {
      await assertSeededResource(resource, token);
    }

    const employmentSelectOptions = await request(
      "/api/utilities/select_options/employments",
      { token }
    );
    assert.equal(
      employmentSelectOptions.response.status,
      200,
      "employment select options should succeed"
    );
    assert.ok(
      employmentSelectOptions.payload.data[0]?.profile?.profile_fullname,
      "employment select options should expose nested profile labels"
    );

    const assessmentScheduleOptions = await request(
      "/api/utilities/select_options/assessment_schedules",
      { token }
    );
    assert.equal(
      assessmentScheduleOptions.response.status,
      200,
      "assessment schedule select options should succeed"
    );
    assert.ok(
      assessmentScheduleOptions.payload.data.some(
        (schedule) => schedule.assessment_schedule_is_active === true
      ),
      "assessment schedule options should expose active schedules"
    );

    const publicationBucketLists = await request(
      "/api/utilities/uploads/libraries/publication-bucket-lists",
      { token }
    );
    assert.equal(
      publicationBucketLists.response.status,
      200,
      "publication bucket list should succeed"
    );
    assert.ok(
      publicationBucketLists.payload.result.publicBucket,
      "publication bucket list should expose the public bucket"
    );
    assert.ok(
      Array.isArray(publicationBucketLists.payload.result.myBuckets),
      "publication bucket list should expose private buckets"
    );

    const publicationBucketDetail = await request(
      `/api/utilities/uploads/libraries/publication-bucket-lists/${publicationBucketLists.payload.result.publicBucket.id}`,
      { token }
    );
    assert.equal(
      publicationBucketDetail.response.status,
      200,
      "publication bucket detail should succeed"
    );
    assert.ok(
      Array.isArray(publicationBucketDetail.payload.result.publications),
      "publication bucket detail should expose publication cards"
    );

    const dashboardEmploymentsWithAssessments = await request(
      "/api/utilities/dashboard/superadmin/employments_has_assessments?limit=10",
      { token }
    );
    assert.equal(
      dashboardEmploymentsWithAssessments.response.status,
      200,
      "dashboard employment list should succeed"
    );
    assert.ok(
      dashboardEmploymentsWithAssessments.payload.data.length > 0,
      "dashboard employment list should expose seeded assessment rows"
    );
    assert.ok(
      Number(dashboardEmploymentsWithAssessments.payload.total) > 0,
      "dashboard employment list should expose pagination totals"
    );

    const dashboardExport = await request(
      "/api/utilities/dashboard/exports/superadmin/employments_has_assessments",
      { token }
    );
    assert.equal(
      dashboardExport.response.status,
      200,
      "dashboard export should succeed"
    );
    assert.match(
      String(dashboardExport.payload),
      /id,employee_name,position_name,report_to/,
      "dashboard export should return the expected CSV header"
    );

    const appliedEmployeesAnalytics = await request(
      "/api/utilities/analytics/aplied_employes",
      { token }
    );
    assert.equal(
      appliedEmployeesAnalytics.response.status,
      200,
      "applied employees analytics should succeed"
    );
    assert.ok(
      appliedEmployeesAnalytics.payload.statistics.length > 0,
      "applied employees analytics should expose schedule statistics"
    );

    const employeeAnalytics = await request(
      "/api/utilities/analytics/employes?limit=10",
      { token }
    );
    assert.equal(
      employeeAnalytics.response.status,
      200,
      "employee analytics list should succeed"
    );
    assert.ok(
      employeeAnalytics.payload.data.length > 0,
      "employee analytics list should expose seeded employee rows"
    );

    const employeeAnalyticsDetail = await request(
      `/api/utilities/analytics/employes/${employeeAnalytics.payload.data[0].employe_id}`,
      { token }
    );
    assert.equal(
      employeeAnalyticsDetail.response.status,
      200,
      "employee analytics detail should succeed"
    );
    assert.ok(
      employeeAnalyticsDetail.payload.data.employe_asssessment_chart_data.length > 0,
      "employee analytics detail should expose chart-ready assessment data"
    );

    const departmentAnalytics = await request(
      "/api/utilities/analytics/competence_employe/by_department",
      { token }
    );
    assert.equal(
      departmentAnalytics.response.status,
      200,
      "department analytics list should succeed"
    );
    assert.ok(
      departmentAnalytics.payload.data.length > 0,
      "department analytics list should expose seeded departments"
    );

    const departmentAnalyticsDetail = await request(
      `/api/utilities/analytics/competence_employe/by_department/${departmentAnalytics.payload.data[0].department_id}?showParticipation=true`,
      { token }
    );
    assert.equal(
      departmentAnalyticsDetail.response.status,
      200,
      "department analytics detail should succeed"
    );
    assert.ok(
      departmentAnalyticsDetail.payload.data.department_overview
        .assessment_by_schedules.length > 0,
      "department analytics detail should expose schedule participation data"
    );

    const unauthorizedUserShow = await request("/api/users/1");
    assert.equal(
      unauthorizedUserShow.response.status,
      401,
      "generic CRUD should require authentication"
    );

    const publicEmploymentLookup = await request(
      "/api/employments_autocomplete_options"
    );
    assert.equal(
      publicEmploymentLookup.response.status,
      200,
      "public employment lookup should remain accessible"
    );
    assert.ok(
      publicEmploymentLookup.payload.data.length > 0,
      "public employment lookup should expose seeded employments"
    );
    const publicEmploymentShow = await request(
      `/api/employments_autocomplete_options/${publicEmploymentLookup.payload.data[0].employment_id}`
    );
    assert.equal(
      publicEmploymentShow.response.status,
      200,
      "public employment lookup detail should succeed for seeded data"
    );

    const invalidLoginPayload = await request("/api/auth/login", {
      method: "POST",
      body: {
        email: "invalid-email",
      },
    });
    assert.equal(
      invalidLoginPayload.response.status,
      422,
      "login should validate malformed payloads"
    );
    assert.ok(
      invalidLoginPayload.payload.error.meta.password.includes(
        "Password is required."
      )
    );

    const registeredUser = await request("/api/auth/register", {
      method: "POST",
      body: {
        name: "Auth Flow User",
        email: "auth.flow@example.com",
        password: "secret123",
        password_confirmation: "secret123",
      },
    });
    assert.equal(
      registeredUser.response.status,
      201,
      "register should succeed for a valid local user"
    );
    assert.equal(registeredUser.payload.data.email, "auth.flow@example.com");

    const registeredUserLogin = await request("/api/auth/login", {
      method: "POST",
      body: {
        email: "auth.flow@example.com",
        password: "secret123",
      },
    });
    assert.equal(
      registeredUserLogin.response.status,
      200,
      "registered user should be able to log in with its own password"
    );

    const resetRequest = await request("/api/auth/forgot-password/request-reset-link", {
      method: "POST",
      body: {
        email: "auth.flow@example.com",
      },
    });
    assert.equal(
      resetRequest.response.status,
      200,
      "password reset request should succeed"
    );
    assert.equal(resetRequest.payload.data.email, "auth.flow@example.com");
    assert.ok(resetRequest.payload.data.reset_token);
    const resetRequestPersistedState = JSON.parse(
      fs.readFileSync(DATABASE_FILE, "utf8")
    );
    const persistedResetRequest =
      resetRequestPersistedState.collections.password_reset_requests.find(
        (item) => item.email === "auth.flow@example.com"
      );
    assert.ok(
      persistedResetRequest?.token_hash,
      "reset requests should persist only a token hash"
    );
    assert.equal(
      Object.prototype.hasOwnProperty.call(persistedResetRequest, "token"),
      false,
      "reset requests should not persist raw reset tokens"
    );

    const resetPassword = await request("/api/auth/reset-password", {
      method: "POST",
      body: {
        email: "auth.flow@example.com",
        token: resetRequest.payload.data.reset_token,
        password: "secret456",
        password_confirmation: "secret456",
      },
    });
    assert.equal(
      resetPassword.response.status,
      200,
      "password reset should succeed"
    );

    const oldPasswordLogin = await request("/api/auth/login", {
      method: "POST",
      body: {
        email: "auth.flow@example.com",
        password: "secret123",
      },
    });
    assert.equal(
      oldPasswordLogin.response.status,
      422,
      "old password should stop working after reset"
    );

    const newPasswordLogin = await request("/api/auth/login", {
      method: "POST",
      body: {
        email: "auth.flow@example.com",
        password: "secret456",
      },
    });
    assert.equal(
      newPasswordLogin.response.status,
      200,
      "new password should work after reset"
    );
    const persistedAuthState = JSON.parse(fs.readFileSync(DATABASE_FILE, "utf8"));
    assert.ok(
      persistedAuthState.collections.password_reset_requests.some(
        (item) =>
          item.email === "auth.flow@example.com" &&
          item.used_at !== null
      ),
      "password reset requests should be persisted and marked as used"
    );

    const userShow = await request("/api/users/1", { token });
    assert.equal(userShow.response.status, 200, "user show should succeed");
    assert.equal(userShow.payload.data.name, "Demo Admin");
    assert.equal(userShow.payload.data.roles[0].name, "superadmin");
    assert.equal(userShow.payload.data.permissions[0].name, "manage.users");
    assert.equal(
      userShow.payload.data.profile.employment.position.position_name,
      "Operations Manager"
    );

    const roleShow = await request("/api/roles/1", { token });
    assert.equal(roleShow.response.status, 200, "role show should succeed");
    assert.equal(roleShow.payload.data.name, "superadmin");
    assert.ok(roleShow.payload.data.permissions.length > 0);
    assert.ok(roleShow.payload.data.users.length > 0);
    assert.equal(
      roleShow.payload.data.users[0].profile.profile_fullname,
      "Demo Admin"
    );

    const permissionShow = await request("/api/permissions/4", { token });
    assert.equal(
      permissionShow.response.status,
      200,
      "permission show should succeed"
    );
    assert.equal(permissionShow.payload.data.name, "manage.learning");
    assert.ok(permissionShow.payload.data.roles.length > 0);
    assert.ok(permissionShow.payload.data.users.length > 0);

    const userSearch = await request("/api/users/search?limit=10", {
      method: "POST",
      token,
      body: {
        search: {
          value: "superadmin",
        },
      },
    });
    assert.equal(userSearch.response.status, 200, "user search should succeed");
    assert.equal(userSearch.payload.data.length, 1);
    assert.equal(userSearch.payload.data[0].name, "Demo Admin");

    const createdUser = await request("/api/users", {
      method: "POST",
      token,
      body: {
        name: "Contract User",
        email: "contract.user@example.com",
        role_ids: [2],
        permission_ids: [3],
        profile_fullname: "Contract User",
        profile_gender: "Female",
      },
    });
    assert.equal(createdUser.response.status, 201, "user create should succeed");
    assert.equal(createdUser.payload.data.roles[0].name, "manager");
    assert.equal(createdUser.payload.data.permissions[0].name, "manage.permissions");
    assert.equal(
      createdUser.payload.data.profile.profile_fullname,
      "Contract User"
    );

    const duplicateUser = await request("/api/users", {
      method: "POST",
      token,
      body: {
        name: "Duplicate Contract User",
        email: "contract.user@example.com",
        profile_fullname: "Duplicate Contract User",
      },
    });
    assert.equal(
      duplicateUser.response.status,
      422,
      "user create should reject duplicate emails"
    );
    assert.ok(
      duplicateUser.payload.error.meta.email.includes(
        "Email has already been taken."
      )
    );

    const createdEmployment = await request("/api/employments", {
      method: "POST",
      token,
      body: {
        employment_hiring_date: 1714521600,
        employment_end_date: null,
        employment_group_type_name: "Contract",
        employment_group_age: "Junior",
        employment_status: "Active",
        employment_position_status: "Acting",
        employment_wsr: "WSR-900",
        parent_employment_id: 1,
        profile_id: createdUser.payload.data.profile.id,
        position_id: 3,
        company_id: 2,
        directorat_id: 2,
        personel_area_id: 1,
        personel_sub_area_id: 2,
        plant_area_id: 1,
        organization_id: 2,
        department_id: 2,
        department_function_id: 2,
      },
    });
    assert.equal(
      createdEmployment.response.status,
      201,
      "employment create should succeed"
    );
    assert.match(
      createdEmployment.payload.data.employment_hiring_date,
      /^\d{4}-\d{2}-\d{2}T/
    );
    assert.equal(
      createdEmployment.payload.data.profile.profile_fullname,
      "Contract User"
    );
    assert.equal(createdEmployment.payload.data.organization_id, 2);
    assert.equal(createdEmployment.payload.data.department_id, 2);
    assert.equal(createdEmployment.payload.data.organization_function_id, 2);
    assert.equal(
      createdEmployment.payload.data.organization.organization_name,
      "Product Engineering"
    );
    assert.equal(
      createdEmployment.payload.data.department.department_name,
      "Frontend Platform"
    );
    assert.equal(
      createdEmployment.payload.data.organization_function.organization_function_name,
      "Frontend Delivery"
    );

    const profileOptions = await request("/api/utilities/select_options/profiles", {
      token,
    });
    assert.equal(
      profileOptions.response.status,
      200,
      "profile select options should succeed"
    );
    assert.ok(
      profileOptions.payload.data.some(
        (profile) =>
          profile.id === createdUser.payload.data.profile.id &&
          profile.user.email === "contract.user@example.com"
      )
    );

    const organizationOptions = await request(
      "/api/utilities/select_options/organizations",
      { token }
    );
    assert.equal(
      organizationOptions.response.status,
      200,
      "organization select options should succeed"
    );
    assert.ok(
      organizationOptions.payload.data.some(
        (organization) => organization.organization_name === "Product Engineering"
      )
    );

    const departmentOptions = await request(
      "/api/utilities/select_options/departments",
      { token }
    );
    assert.equal(
      departmentOptions.response.status,
      200,
      "department select options should succeed"
    );
    assert.ok(
      departmentOptions.payload.data.some(
        (department) => department.department_name === "Frontend Platform"
      )
    );

    const organizationFunctionOptions = await request(
      "/api/utilities/select_options/organization_functions",
      { token }
    );
    assert.equal(
      organizationFunctionOptions.response.status,
      200,
      "organization function select options should succeed"
    );
    assert.ok(
      organizationFunctionOptions.payload.data.some(
        (item) => item.organization_function_name === "Frontend Delivery"
      )
    );

    const publicationCategoryOptions = await request(
      "/api/utilities/select_options/publication_categories",
      { token }
    );
    assert.equal(
      publicationCategoryOptions.response.status,
      200,
      "publication category select options should succeed"
    );
    assert.ok(publicationCategoryOptions.payload.data.length > 0);

    const bucketCategoryOptions = await request(
      "/api/utilities/select_options/bucket_categories",
      { token }
    );
    assert.equal(
      bucketCategoryOptions.response.status,
      200,
      "bucket category select options should succeed"
    );
    assert.ok(bucketCategoryOptions.payload.data.length > 0);

    const organizationShow = await request("/api/organizations/2", { token });
    assert.equal(
      organizationShow.response.status,
      200,
      "organization show should succeed"
    );
    assert.equal(
      organizationShow.payload.data.organization_name,
      "Product Engineering"
    );

    const existingEmployment = await request("/api/employments/3", { token });
    assert.equal(
      existingEmployment.response.status,
      200,
      "employment show should succeed"
    );
    assert.equal(
      existingEmployment.payload.data.organization.organization_name,
      "Product Engineering"
    );
    assert.equal(
      existingEmployment.payload.data.department.department_name,
      "Frontend Platform"
    );
    assert.equal(
      existingEmployment.payload.data.organization_function.organization_function_name,
      "Frontend Delivery"
    );

    const employeeList = await request("/api/employees?limit=10", { token });
    assert.equal(
      employeeList.response.status,
      200,
      "employee aggregate list should succeed"
    );
    assert.ok(
      employeeList.payload.data.some(
        (employee) =>
          employee.employment_id === createdEmployment.payload.data.id &&
          employee.profile_fullname === "Contract User"
      )
    );

    const employeeSearch = await request("/api/employees/search?limit=10", {
      method: "POST",
      token,
      body: {
        search: {
          value: "Contract User",
        },
      },
    });
    assert.equal(
      employeeSearch.response.status,
      200,
      "employee aggregate search should succeed"
    );
    assert.equal(employeeSearch.payload.data.length, 1);
    assert.equal(
      employeeSearch.payload.data[0].employment_id,
      createdEmployment.payload.data.id
    );
    assert.equal(
      employeeSearch.payload.data[0].department_name,
      "Frontend Platform"
    );

    const employeeShow = await request(
      `/api/employees/${createdEmployment.payload.data.id}`,
      { token }
    );
    assert.equal(
      employeeShow.response.status,
      200,
      "employee aggregate show should succeed"
    );
    assert.equal(employeeShow.payload.data.user_id, createdUser.payload.data.id);
    assert.equal(
      employeeShow.payload.data.profile.profile_fullname,
      "Contract User"
    );
    assert.equal(
      employeeShow.payload.data.employment.position.position_name,
      "Frontend Engineer"
    );
    assert.equal(
      employeeShow.payload.data.role_names[0],
      "manager"
    );

    const employeeOptions = await request("/api/utilities/select_options/employees", {
      token,
    });
    assert.equal(
      employeeOptions.response.status,
      200,
      "employee select options should succeed"
    );
    assert.ok(
      employeeOptions.payload.data.some(
        (employee) =>
          employee.employment_id === createdEmployment.payload.data.id &&
          employee.user === null &&
          employee.profile === null &&
          employee.employment === null
      )
    );

    const publicationUploadForm = new FormData();
    publicationUploadForm.set("publication_title", "Persistent Upload");
    publicationUploadForm.set(
      "publication_description",
      "Uploaded through multipart form data"
    );
    publicationUploadForm.set("bucket_id", "2");
    publicationUploadForm.set("publication_category_id", "3");
    publicationUploadForm.set(
      "document",
      new Blob(["%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF"], {
        type: "application/pdf",
      }),
      "persistent-upload.pdf"
    );

    const uploadedPublication = await request(
      "/api/utilities/uploads/libraries",
      {
        method: "POST",
        token,
        formData: publicationUploadForm,
      }
    );
    assert.equal(
      uploadedPublication.response.status,
      200,
      "publication multipart upload should succeed"
    );
    assert.equal(
      uploadedPublication.payload.data.publication_title,
      "Persistent Upload"
    );
    assert.equal(
      uploadedPublication.payload.data.storages[0].document_extension,
      "pdf"
    );
    const persistedAfterUpload = JSON.parse(fs.readFileSync(DATABASE_FILE, "utf8"));
    assert.ok(
      persistedAfterUpload.collections.publications.some(
        (publication) => publication.publication_title === "Persistent Upload"
      ),
      "uploaded publication should be stored in the persistent database"
    );

    const invalidPublicationUploadForm = new FormData();
    invalidPublicationUploadForm.set("publication_title", "Broken Upload");
    invalidPublicationUploadForm.set("publication_category_id", "9999");
    const invalidPublicationUpload = await request(
      "/api/utilities/uploads/libraries",
      {
        method: "POST",
        token,
        formData: invalidPublicationUploadForm,
      }
    );
    assert.equal(
      invalidPublicationUpload.response.status,
      422,
      "publication upload should reject unknown categories"
    );
    assert.ok(
      invalidPublicationUpload.payload.error.meta.publication_category_id.includes(
        "Publication category was not found."
      )
    );

    const stateBeforeEmploymentImport = JSON.parse(
      fs.readFileSync(DATABASE_FILE, "utf8")
    );
    const employmentImportCsv = [
      "profile_fullname,email,employment_wsr,position_id,organization_id,department_id,organization_function_id,company_id,directorat_id,personel_area_id,personel_sub_area_id,plant_area_id,employment_hiring_date,employment_status,employment_group_type_name,employment_group_age,employment_position_status,parent_employment_wsr,role_names",
      "Imported Frontend Analyst,imported.frontend.analyst@example.com,IMP-FE-101,3,2,2,2,2,2,1,2,1,2026-03-01,Active,Contract,Junior,Staff,,employee",
      "Imported Learning Officer,imported.learning.officer@example.com,IMP-LD-101,5,1,1,1,1,1,1,1,1,2026-03-05,Active,Permanent,Mid,Staff,,employee",
    ].join("\n");
    const employmentImportForm = new FormData();
    employmentImportForm.set(
      "xlsx_doc",
      new Blob([employmentImportCsv], {
        type: "text/csv",
      }),
      "employment-import.csv"
    );

    const employmentImport = await request("/api/utilities/importers/employments", {
      method: "POST",
      token,
      formData: employmentImportForm,
    });
    assert.equal(
      employmentImport.response.status,
      200,
      "employment importer should succeed"
    );
    assert.equal(employmentImport.payload.data.resource, "employments");
    assert.equal(employmentImport.payload.data.imported_count, 2);
    assert.equal(
      employmentImport.payload.data.imported_employments.length,
      2,
      "employment importer should create two imported employments"
    );
    assert.ok(
      employmentImport.payload.data.imported_employments.every(
        (employment) => employment.parent_employment_id === null
      ),
      "employment importer should leave imported rows ready for hierarchy sync"
    );

    const stateAfterEmploymentImport = JSON.parse(
      fs.readFileSync(DATABASE_FILE, "utf8")
    );
    assert.equal(
      stateAfterEmploymentImport.collections.employments.length,
      stateBeforeEmploymentImport.collections.employments.length + 2,
      "employment importer should persist new employment rows"
    );

    const invalidEmploymentImportForm = new FormData();
    invalidEmploymentImportForm.set(
      "xlsx_doc",
      new Blob(["profile_fullname,email\nBroken Row,broken@example.com"], {
        type: "text/csv",
      }),
      "invalid-employment-import.csv"
    );
    const invalidEmploymentImport = await request(
      "/api/utilities/importers/employments",
      {
        method: "POST",
        token,
        formData: invalidEmploymentImportForm,
      }
    );
    assert.equal(
      invalidEmploymentImport.response.status,
      422,
      "employment importer should reject missing required template columns"
    );
    assert.ok(
      invalidEmploymentImport.payload.error.meta.headers[0].includes(
        "employment_wsr"
      )
    );

    const parentEmploymentImportCsv = [
      "employment_wsr,parent_employment_wsr",
      "IMP-FE-101,WSR-002",
      "IMP-LD-101,WSR-001",
    ].join("\n");
    const parentEmploymentImportForm = new FormData();
    parentEmploymentImportForm.set(
      "xlsx_doc",
      new Blob([parentEmploymentImportCsv], {
        type: "text/csv",
      }),
      "parent-employment-sync.csv"
    );

    const parentEmploymentImport = await request(
      "/api/utilities/importers/parent-employments",
      {
        method: "POST",
        token,
        formData: parentEmploymentImportForm,
      }
    );
    assert.equal(
      parentEmploymentImport.response.status,
      200,
      "parent employment importer should succeed"
    );
    assert.equal(
      parentEmploymentImport.payload.data.resource,
      "parent-employments"
    );
    assert.ok(
      parentEmploymentImport.payload.data.updated_count >= 2,
      "parent employment importer should synchronize the imported rows"
    );

    const syncedImportedEmployment = await request(
      `/api/employments/${employmentImport.payload.data.imported_employments[0].id}`,
      { token }
    );
    assert.equal(
      syncedImportedEmployment.response.status,
      200,
      "synced imported employment should be readable"
    );
    assert.ok(
      syncedImportedEmployment.payload.data.parent_employment_id,
      "parent employment importer should attach a reporting line"
    );

    const createdPublication = await request("/api/publications", {
      method: "POST",
      token,
      body: {
        publication_title: "API Created Publication",
        publication_slug: "api-created-publication",
        publication_description: "Created through generic publication CRUD",
        bucket_id: "2",
        publication_category_id: "1",
      },
    });
    assert.equal(
      createdPublication.response.status,
      201,
      "generic publication create should succeed"
    );
    assert.equal(
      createdPublication.payload.data.publication_slug,
      "api-created-publication"
    );
    assert.equal(createdPublication.payload.data.storages.length, 1);

    const publicationStorageShow = await request(
      `/api/publication_storages/${createdPublication.payload.data.storages[0].id}`,
      { token }
    );
    assert.equal(
      publicationStorageShow.response.status,
      200,
      "publication storage show should succeed"
    );
    assert.equal(
      publicationStorageShow.payload.data.publication.id,
      createdPublication.payload.data.id
    );
    assert.match(publicationStorageShow.payload.data.document_url, /^\/api\//);
    assert.equal(
      publicationStorageShow.payload.data.document_type,
      "application/pdf"
    );
    assert.ok(publicationStorageShow.payload.data.document_storage_path);
    assert.ok(publicationStorageShow.payload.data.document_description);

    const unauthorizedDocument = await request(
      publicationStorageShow.payload.data.document_url
    );
    assert.equal(
      unauthorizedDocument.response.status,
      401,
      "publication document should require authentication"
    );

    const publicationDocument = await request(
      publicationStorageShow.payload.data.document_url,
      {
        token,
        expectBinary: true,
      }
    );
    assert.equal(
      publicationDocument.response.status,
      200,
      "publication document should stream for authenticated users"
    );
    assert.equal(
      publicationDocument.response.headers.get("content-type"),
      "application/pdf",
      "publication document should return a pdf content type"
    );
    assert.ok(
      publicationDocument.payload.length > 0,
      "publication document should return a non-empty payload"
    );

    const duplicatePublication = await request("/api/publications", {
      method: "POST",
      token,
      body: {
        publication_title: "API Created Publication Duplicate",
        publication_slug: "api-created-publication",
        bucket_id: "2",
        publication_category_id: "1",
      },
    });
    assert.equal(
      duplicatePublication.response.status,
      422,
      "generic publication create should reject duplicate slugs"
    );
    assert.ok(
      duplicatePublication.payload.error.meta.publication_slug.includes(
        "Publication slug has already been taken."
      )
    );

    const assessmentAliasShow = await request("/api/assessments/1", { token });
    assert.equal(
      assessmentAliasShow.response.status,
      200,
      "assessment alias show should succeed"
    );
    assert.equal(assessmentAliasShow.payload.data.assessment_score, 4);
    assert.equal(assessmentAliasShow.payload.data.employment.id, 2);
    assert.equal(assessmentAliasShow.payload.data.position.position_name, "Plant Supervisor");
    assert.equal(assessmentAliasShow.payload.data.competency.competency_name, "Safety");
    assert.equal(
      assessmentAliasShow.payload.data.assessmentSchedule.assessment_schedule_title,
      "Mid Year Review"
    );
    assert.equal(
      assessmentAliasShow.payload.data.training.training_title,
      "Industrial Safety"
    );

    const createdAssessmentAlias = await request("/api/assessments", {
      method: "POST",
      token,
      body: {
        assessment_score: "3",
        competency_id: "3",
        competency_level_id: "2",
        employment_id: String(createdEmployment.payload.data.id),
        gap_score: "1",
        minimum_score: "4",
        parent_employment_id: "1",
        position_id: "3",
        training_id: "4",
        idp_status: "on-going",
        assessment_schedule_id: "2",
      },
    });
    assert.equal(
      createdAssessmentAlias.response.status,
      201,
      "assessment alias create should succeed"
    );
    assert.equal(createdAssessmentAlias.payload.data.assessment_score, 3);
    assert.equal(
      createdAssessmentAlias.payload.data.employment_id,
      createdEmployment.payload.data.id
    );
    assert.equal(
      createdAssessmentAlias.payload.data.assessmentSchedule.assessment_schedule_phase_period,
      "H2"
    );

    const updatedAssessmentRecord = await request(
      `/api/assessment_records/${createdAssessmentAlias.payload.data.id}`,
      {
        method: "PATCH",
        token,
        body: {
          assessment_score: "5",
          gap_score: "0",
          training_id: "5",
          idp_status: "done",
        },
      }
    );
    assert.equal(
      updatedAssessmentRecord.response.status,
      200,
      "assessment record update should succeed"
    );
    assert.equal(updatedAssessmentRecord.payload.data.assessment_score, 5);
    assert.equal(updatedAssessmentRecord.payload.data.gap_score, 0);
    assert.equal(updatedAssessmentRecord.payload.data.training.id, 5);

    const periodicalList = await request(
      "/api/periodical_general_assessments?limit=10",
      { token }
    );
    assert.equal(
      periodicalList.response.status,
      200,
      "periodical assessments list should succeed"
    );
    assert.ok(periodicalList.payload.data.length > 0);

    const createdPeriodical = await request(
      "/api/periodical_general_assessments",
      {
        method: "POST",
        token,
        body: {
          employment_id: String(createdEmployment.payload.data.id),
          assessment_schedule_id: "2",
          parameters_name: "education",
          parameters_value: "Mock architecture clinic",
          status: "done",
        },
      }
    );
    assert.equal(
      createdPeriodical.response.status,
      201,
      "periodical assessment create should succeed"
    );
    assert.equal(
      createdPeriodical.payload.data.employment_id,
      createdEmployment.payload.data.id
    );
    assert.equal(createdPeriodical.payload.data.assessment_schedule_id, 2);
    assert.equal(
      createdPeriodical.payload.data.assessment_schedule.assessment_schedule_title,
      "Annual Review"
    );

    const certificationList = await request("/api/certifications?limit=10", {
      token,
    });
    assert.equal(
      certificationList.response.status,
      200,
      "certification list should succeed"
    );
    assert.ok(
      certificationList.payload.data.length > 0,
      "certification list should expose seeded certifications"
    );

    const createdCertification = await request("/api/certifications", {
      method: "POST",
      token,
      body: {
        certification_name: "Mock Safety Pass",
        certification_status: "active",
        employment_id: String(createdEmployment.payload.data.id),
      },
    });
    assert.equal(
      createdCertification.response.status,
      201,
      "certification create should succeed"
    );
    assert.equal(
      createdCertification.payload.data.certification_name,
      "Mock Safety Pass"
    );
    assert.equal(
      createdCertification.payload.data.employment.id,
      createdEmployment.payload.data.id
    );
    const employmentWithCertification = await request(
      `/api/employments/${createdEmployment.payload.data.id}`,
      { token }
    );
    assert.equal(
      employmentWithCertification.response.status,
      200,
      "employment show with certification should succeed"
    );
    assert.equal(
      employmentWithCertification.payload.data.certifications.length,
      1,
      "employment payload should expose linked certifications"
    );

    const periodicalOnlySave = await request(
      `/api/transactions/assessment_record/${createdEmployment.payload.data.id}`,
      {
        method: "POST",
        token,
        body: {
          positionId: 3,
          assessmentRecord: [],
          periodicalAssessmentRecord: {
            assessmentSchedule: 2,
            parameters: [
              {
                name: "education",
                value: "Pair with senior frontend reviewer",
                status: "done",
              },
              {
                name: "exposure",
                value: "Lead one deployment retrospective",
                status: "on-going",
              },
              {
                name: "experience",
                value: "Own one dashboard release checklist",
                status: "pending",
              },
            ],
          },
        },
      }
    );
    assert.equal(
      periodicalOnlySave.response.status,
      200,
      "periodical-only assessment save should succeed"
    );
    assert.equal(periodicalOnlySave.payload.data.assessment_records.length, 0);
    assert.equal(periodicalOnlySave.payload.data.appliedAssessmentLogs.length, 1);
    assert.equal(periodicalOnlySave.payload.data.appliedAssessmentLogs[0].id, 2);

    const invalidAssessmentSave = await request(
      `/api/transactions/assessment_record/${createdEmployment.payload.data.id}`,
      {
        method: "POST",
        token,
        body: {
          positionId: 9999,
          assessmentRecord: [
            {
              competencyId: 9999,
              value: 2,
              gapScore: 1,
              selectedTraining: 9999,
            },
          ],
          periodicalAssessmentRecord: {
            assessmentSchedule: 9999,
            parameters: [
              {
                name: "",
                value: "invalid",
                status: "done",
              },
            ],
          },
        },
      }
    );
    assert.equal(
      invalidAssessmentSave.response.status,
      422,
      "assessment transaction should reject unknown relations"
    );
    assert.ok(
      invalidAssessmentSave.payload.error.meta.positionId.includes(
        "Position was not found."
      )
    );
    assert.ok(
      invalidAssessmentSave.payload.error.meta[
        "periodicalAssessmentRecord.assessmentSchedule"
      ].includes("Assessment schedule was not found.")
    );

    const createdEmploymentAfterPeriodicalOnly = await request(
      `/api/employments/${createdEmployment.payload.data.id}`,
      { token }
    );
    assert.equal(
      createdEmploymentAfterPeriodicalOnly.response.status,
      200,
      "employment show after periodical save should succeed"
    );
    assert.equal(
      createdEmploymentAfterPeriodicalOnly.payload.data.assessment_records.length,
      0
    );
    assert.equal(
      createdEmploymentAfterPeriodicalOnly.payload.data.appliedAssessmentLogs.length,
      1
    );
    assert.equal(
      createdEmploymentAfterPeriodicalOnly.payload.data.periodical_general_assessments.length,
      3
    );

    const positionShow = await request("/api/positions/3", { token });
    assert.equal(positionShow.response.status, 200, "position show should succeed");
    assert.equal(positionShow.payload.data.position_name, "Frontend Engineer");
    assert.equal(positionShow.payload.data.attachedCompetenciesCount, 2);
    assert.equal(positionShow.payload.data.competency_by_level.length, 2);

    const filteredPositions = await request("/api/positions/search?limit=10", {
      method: "POST",
      token,
      body: {
        scopes: [{ name: "hasCompetencyThroughLevels" }],
      },
    });
    assert.equal(
      filteredPositions.response.status,
      200,
      "filtered position search should succeed"
    );
    assert.ok(
      filteredPositions.payload.data.every(
        (position) => position.attachedCompetenciesCount > 0
      )
    );

    const createdTraining = await request("/api/trainings", {
      method: "POST",
      token,
      body: {
        training_job_competency_function: "Frontend",
        training_job_course_function: "Performance",
        training_title: "Vue Performance Clinic",
        training_level: "Intermediate",
        training_target_group: "Frontend Engineers",
        training_notes: "Baru",
        training_delivery_method: "Workshop",
        training_program_duration: "2",
        training_day_duration: "1",
        training_hours_duration: "6",
        training_objective: "Improve rendering performance",
        training_content: "Chunking and lazy loading",
        training_competency_level_stack_key: "2",
        competency_id: "3",
      },
    });
    assert.equal(
      createdTraining.response.status,
      201,
      "training create should succeed"
    );
    assert.equal(createdTraining.payload.data.competency.id, 3);
    assert.equal(createdTraining.payload.data.training_program_duration, 2);

    const createdRequirementScore = await request("/api/requirement_scores", {
      method: "POST",
      token,
      body: {
        minimum_score: "5",
        position_id: "5",
        competency_id: "1",
        competency_level_id: "2",
      },
    });
    assert.equal(
      createdRequirementScore.response.status,
      201,
      "requirement score create should succeed"
    );
    assert.equal(createdRequirementScore.payload.data.minimum_score, 5);
    assert.equal(
      createdRequirementScore.payload.data.position.position_name,
      "Learning & Development Officer"
    );
    assert.equal(
      createdRequirementScore.payload.data.level.competency_level_title,
      "L2"
    );

    const duplicateRequirementScore = await request("/api/requirement_scores", {
      method: "POST",
      token,
      body: {
        minimum_score: "4",
        position_id: "5",
        competency_id: "1",
        competency_level_id: "3",
      },
    });
    assert.equal(
      duplicateRequirementScore.response.status,
      422,
      "requirement score create should reject duplicate position-competency pairs"
    );
    assert.ok(
      duplicateRequirementScore.payload.error.meta.competency_id.includes(
        "Requirement score for this position and competency already exists."
      )
    );

    const deletePublication = await request(
      `/api/publications/${createdPublication.payload.data.id}`,
      {
        method: "DELETE",
        token,
      }
    );
    assert.equal(
      deletePublication.response.status,
      200,
      "publication delete should succeed"
    );

    const missingPublicationStorage = await request(
      `/api/publication_storages/${createdPublication.payload.data.storages[0].id}`,
      { token }
    );
    assert.equal(
      missingPublicationStorage.response.status,
      404,
      "publication delete should remove linked storage"
    );

    const deleteUser = await request(
      `/api/users/${createdUser.payload.data.id}`,
      {
        method: "DELETE",
        token,
      }
    );
    assert.equal(deleteUser.response.status, 200, "user delete should succeed");

    const missingUser = await request(`/api/users/${createdUser.payload.data.id}`, {
      token,
    });
    assert.equal(missingUser.response.status, 404, "deleted user should be gone");

    const missingProfile = await request(
      `/api/profiles/${createdUser.payload.data.profile.id}`,
      { token }
    );
    assert.equal(
      missingProfile.response.status,
      404,
      "linked profile should be deleted with the user"
    );

    const missingEmployment = await request(
      `/api/employments/${createdEmployment.payload.data.id}`,
      { token }
    );
    assert.equal(
      missingEmployment.response.status,
      404,
      "linked employment should be deleted with the user"
    );

    const missingEmployeeAggregate = await request(
      `/api/employees/${createdEmployment.payload.data.id}`,
      { token }
    );
    assert.equal(
      missingEmployeeAggregate.response.status,
      404,
      "employee aggregate should disappear when the employment is deleted"
    );

    const missingAssessmentAfterEmploymentDelete = await request(
      `/api/assessment_records/${createdAssessmentAlias.payload.data.id}`,
      { token }
    );
    assert.equal(
      missingAssessmentAfterEmploymentDelete.response.status,
      404,
      "linked assessment record should be deleted with the employment"
    );

    const missingCertificationAfterEmploymentDelete = await request(
      `/api/certifications/${createdCertification.payload.data.id}`,
      { token }
    );
    assert.equal(
      missingCertificationAfterEmploymentDelete.response.status,
      404,
      "linked certification should be deleted with the employment"
    );

    const deleteRegisteredUser = await request(
      `/api/users/${registeredUser.payload.data.id}`,
      {
        method: "DELETE",
        token,
      }
    );
    assert.equal(
      deleteRegisteredUser.response.status,
      200,
      "registered auth-flow user should be deletable"
    );

    console.log("contract smoke checks passed");
  } finally {
    server.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
