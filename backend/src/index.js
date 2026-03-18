const express = require("express");
const cors = require("cors");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { tokens } = require("./data");
const { createMockPdfBuffer } = require("./mock-pdf");
const { parseMultipartForm, sanitizeFileStem, formatFileSize, saveUploadedFile } = require("./multipart");
const { createPersistentStore } = require("./store-persistence");
const { isApiError } = require("./api-errors");
const { createRateLimiter } = require("./rate-limit");
const { hashPassword, hashResetToken, verifyPassword } = require("./security");
const {
  validateLoginPayload,
  validateAuthRegisterPayload,
  validatePasswordResetRequestPayload,
  validateResetPasswordPayload,
  validateGenericMutation,
  validateChangeParentEmploymentPayload,
  validateAddPositionPayload,
  validateAssessmentTransactionPayload,
  validatePublicationUploadPayload,
} = require("./validation");
const {
  isGenericResource,
  nextId,
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
  listEmployees,
  searchEmployees,
  showEmployee,
  getSelectOptions,
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
  getPublicationBucketLists,
  getPublicationBucketDetail,
  getPublicationCategories,
  approvePublication,
  uploadPublication,
  importResource,
} = require("./mock-api");

const app = express();
const port = process.env.PORT || 3001;
const store = createPersistentStore();
const PUBLICATION_STORAGE_DIRECTORY = path.join(
  __dirname,
  "..",
  "storage",
  "mock-publications"
);
const IMPORT_STORAGE_DIRECTORY = path.join(
  __dirname,
  "..",
  "storage",
  "imports"
);
const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
];
const allowedOrigins = new Set(
  String(process.env.BACKEND_ALLOWED_ORIGINS || DEFAULT_ALLOWED_ORIGINS.join(","))
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
);
const authLoginLimiter = createRateLimiter({
  prefix: "auth-login",
  windowMs: 10 * 60 * 1000,
  max: 10,
});
const authRegisterLimiter = createRateLimiter({
  prefix: "auth-register",
  windowMs: 10 * 60 * 1000,
  max: 10,
});
const authResetRequestLimiter = createRateLimiter({
  prefix: "auth-reset-request",
  windowMs: 15 * 60 * 1000,
  max: 5,
});
const authResetLimiter = createRateLimiter({
  prefix: "auth-reset",
  windowMs: 15 * 60 * 1000,
  max: 10,
});
const uploadLimiter = createRateLimiter({
  prefix: "uploads",
  windowMs: 10 * 60 * 1000,
  max: 20,
});

app.use(
  cors({
    origin(origin, callback) {
      callback(null, !origin || allowedOrigins.has(origin));
    },
    credentials: false,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use((req, res, next) => {
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");

  if (req.path.startsWith("/api/auth")) {
    res.setHeader("Cache-Control", "no-store");
  }

  next();
});
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

function persistStore() {
  store.persist();
}

function extractPublicationStorage(fileName) {
  return path.join(PUBLICATION_STORAGE_DIRECTORY, path.basename(fileName));
}

function findPublicationForDocument(fileName) {
  const normalizedName = String(fileName || "").toLowerCase();
  const storage = store.collections.publication_storages.find((item) => {
    const candidate =
      `${item.document_hash_name}.${item.document_extension}`.toLowerCase();
    return candidate === normalizedName;
  });

  if (!storage) {
    return null;
  }

  return (
    store.collections.publications.find(
      (publication) => Number(publication.id) === Number(storage.publication_id)
    ) || null
  );
}

function findStoredPublicationFile(fileName) {
  const filePath = extractPublicationStorage(fileName);
  return fs.existsSync(filePath) ? filePath : null;
}

function inferBrowser(userAgent) {
  const agent = String(userAgent || "").toLowerCase();
  if (agent.includes("edg/")) return "Edge";
  if (agent.includes("chrome/")) return "Chrome";
  if (agent.includes("firefox/")) return "Firefox";
  if (agent.includes("safari/")) return "Safari";
  return "Unknown";
}

function inferPlatform(userAgent) {
  const agent = String(userAgent || "").toLowerCase();
  if (agent.includes("windows")) return "Windows";
  if (agent.includes("mac os")) return "macOS";
  if (agent.includes("android")) return "Android";
  if (agent.includes("iphone") || agent.includes("ipad")) return "iOS";
  if (agent.includes("linux")) return "Linux";
  return "Unknown";
}

function inferDevice(userAgent) {
  const agent = String(userAgent || "").toLowerCase();
  if (agent.includes("mobile") || agent.includes("iphone") || agent.includes("android")) {
    return "Mobile";
  }
  if (agent.includes("ipad") || agent.includes("tablet")) {
    return "Tablet";
  }
  return "Desktop";
}

function updateLoginTelemetry(user, req) {
  const hostHeader = String(req.headers.host || "");
  const [hostName, hostPort] = hostHeader.split(":");
  const userAgent = String(req.headers["user-agent"] || "");

  user.is_logged_in = true;
  user.last_logged_in_at = new Date().toISOString();
  user.last_logged_in_host = hostName || req.ip || "127.0.0.1";
  user.last_logged_in_port = hostPort || String(port);
  user.last_logged_in_user_agent = userAgent || null;
  user.last_logged_in_device = inferDevice(userAgent);
  user.last_logged_in_browser = inferBrowser(userAgent);
  user.last_logged_in_platform = inferPlatform(userAgent);
  user.updated_at = new Date().toISOString();
}

function clearLoginTelemetry(user) {
  user.is_logged_in = false;
  user.updated_at = new Date().toISOString();
}

function getUserByEmail(email) {
  return (
    store.collections.users.find(
      (item) =>
        String(item.email || "").trim().toLowerCase() ===
        String(email || "").trim().toLowerCase()
    ) || null
  );
}

function createPasswordResetRequest(email) {
  const token = crypto.randomBytes(24).toString("base64url");
  const timestamp = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30).toISOString();

  store.collections.password_reset_requests =
    (store.collections.password_reset_requests || []).filter(
      (item) =>
        String(item.email || "").trim().toLowerCase() !==
        String(email || "").trim().toLowerCase()
    );

  const resetRequest = {
    id: nextId(store, "password_reset_requests"),
    email: String(email || "").trim().toLowerCase(),
    token_hash: hashResetToken(token),
    expires_at: expiresAt,
    used_at: null,
    created_at: timestamp,
    updated_at: timestamp,
  };

  store.collections.password_reset_requests.push(resetRequest);
  return {
    ...resetRequest,
    token,
  };
}

function findPasswordResetRequest(email, token) {
  return (
    (store.collections.password_reset_requests || []).find(
      (item) =>
        String(item.email || "").trim().toLowerCase() ===
          String(email || "").trim().toLowerCase() &&
        String(item.token_hash || "") === hashResetToken(token)
    ) || null
  );
}

async function readMultipartPayload(req) {
  const { fields, files } = await parseMultipartForm(req);
  return {
    fields,
    files,
    primaryFile: files[0] || null,
  };
}

function createSession(userId) {
  const token = Buffer.from(
    `${userId}:${Date.now()}:${Math.random().toString(36).slice(2)}`
  ).toString("base64url");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString();

  tokens.set(token, {
    userId,
    expiresAt,
  });

  return { token, expiresAt };
}

function getSessionFromRequest(req) {
  const authorization = req.headers.authorization || "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : null;

  if (!token) {
    return null;
  }

  const session = tokens.get(token);
  if (!session) {
    return null;
  }

  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    tokens.delete(token);
    return null;
  }

  const user = getAuthUser(store, session.userId);
  if (!user) {
    tokens.delete(token);
    return null;
  }

  return {
    token,
    userId: session.userId,
    expiresAt: session.expiresAt,
    user,
  };
}

function optionalAuth(req, res, next) {
  req.session = getSessionFromRequest(req);
  next();
}

function requireAuth(req, res, next) {
  if (
    req.path === "/employments_autocomplete_options" ||
    req.path.startsWith("/employments_autocomplete_options/")
  ) {
    return next();
  }

  if (!req.session) {
    return res.status(401).json({
      error: {
        message: "Unauthenticated",
      },
    });
  }

  return next();
}

function respondNotFound(res, message = "Resource not found") {
  return res.status(404).json({
    error: {
      message,
    },
  });
}

function handleApiError(res, error) {
  if (isApiError(error)) {
    const payload = {
      error: {
        message: error.message,
      },
    };

    if (error.meta && Object.keys(error.meta).length > 0) {
      payload.error.meta = error.meta;
    }

    return res.status(error.statusCode).json(payload);
  }

  console.error(error);
  return res.status(500).json({
    error: {
      message: "Unexpected server error",
    },
  });
}

function runSafe(res, action) {
  try {
    return action();
  } catch (error) {
    return handleApiError(res, error);
  }
}

async function runSafeAsync(res, action) {
  try {
    return await action();
  } catch (error) {
    return handleApiError(res, error);
  }
}

function finishMutation(res, payload, options = {}) {
  if (payload === null || payload === undefined) {
    return respondNotFound(res, options.notFoundMessage);
  }

  if (options.persist !== false) {
    persistStore();
  }

  const responseBody =
    typeof options.buildBody === "function" ? options.buildBody(payload) : payload;
  return res.status(options.statusCode || 200).json(responseBody);
}

app.use(optionalAuth);

app.get("/api/health", (req, res) => {
  return res.json({
    status: "ok",
    mode: "local-persistent",
    db_file: store.dbFile,
    resources: [
      "auth",
      "crud",
      "select-options",
      "assessments",
      "analytics",
      "publications",
      "imports",
    ],
  });
});

app.get("/mock-publications/:fileName", (req, res) => {
  const storedFile = findStoredPublicationFile(req.params.fileName);
  if (storedFile) {
    return res.sendFile(storedFile);
  }

  const publication = findPublicationForDocument(req.params.fileName);
  const fallbackTitle = String(req.params.fileName || "mock-publication")
    .replace(/\.pdf$/i, "")
    .replace(/-/g, " ");
  const buffer = createMockPdfBuffer({
    title: publication?.publication_title || fallbackTitle,
    subtitle:
      publication?.publication_description || "Generated in mock mode.",
    detail: "This file is served dynamically so publication detail works locally.",
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename="${req.params.fileName || "mock-publication.pdf"}"`
  );
  return res.send(buffer);
});

app.post("/api/auth/login", authLoginLimiter, (req, res) => {
  return runSafe(res, () => {
    validateLoginPayload(req.body || {});

    const { email, password } = req.body || {};
    const user = getUserByEmail(email);

    if (!user || !verifyPassword(password, user.password)) {
      return res.status(422).json({
        error: {
          message: "Invalid email or password",
          meta: {
            email: ["Use demo@example.com or another seeded user"],
            password: ["Use the stored password for this local user."],
          },
        },
      });
    }

    updateLoginTelemetry(user, req);
    persistStore();

    const { token, expiresAt } = createSession(user.id);
    const authUser = getAuthUser(store, user.id);

    return res.json({
      user: {
        id: authUser.id,
        name: authUser.name,
        email: authUser.email,
      },
      oAuth: {
        access_token: token,
        expires_in: expiresAt,
      },
      roles: getRoleNamesForUser(store, user.id),
      permissions: getPermissionNamesForUser(store, user),
    });
  });
});

app.post("/api/auth/register", authRegisterLimiter, (req, res) => {
  return runSafe(res, () => {
    const payload = req.body || {};
    validateAuthRegisterPayload(store, payload);
    const created = createGenericRecord(store, "users", payload);
    return finishMutation(res, created, {
      statusCode: 201,
      buildBody: (data) => ({
        data,
        message: "User registered",
      }),
    });
  });
});

app.post(
  "/api/auth/forgot-password/request-reset-link",
  authResetRequestLimiter,
  (req, res) => {
    return runSafe(res, () => {
      const payload = req.body || {};
      validatePasswordResetRequestPayload(store, payload);
      const user = getUserByEmail(payload.email);

      if (!user) {
        return res.status(404).json({
          error: {
            message: "No user was found for that email address.",
          },
        });
      }

      const resetRequest = createPasswordResetRequest(payload.email);
      persistStore();

      return res.json({
        message: "Password reset link generated in local mode.",
        data: {
          email: resetRequest.email,
          reset_token: resetRequest.token,
          expires_at: resetRequest.expires_at,
          reset_url: `/authentication/reset-password?email=${encodeURIComponent(
            resetRequest.email
          )}&token=${encodeURIComponent(resetRequest.token)}`,
        },
      });
    });
  }
);

app.post("/api/auth/reset-password", authResetLimiter, (req, res) => {
  return runSafe(res, () => {
    const payload = req.body || {};
    validateResetPasswordPayload(store, payload);

    const user = getUserByEmail(payload.email);
    if (!user) {
      return res.status(404).json({
        error: {
          message: "No user was found for that email address.",
        },
      });
    }

    const resetRequest = findPasswordResetRequest(payload.email, payload.token);
    if (!resetRequest) {
      return res.status(422).json({
        error: {
          message: "Invalid password reset token.",
          meta: {
            token: ["The password reset token is invalid or has expired."],
          },
        },
      });
    }

    if (resetRequest.used_at) {
      return res.status(422).json({
        error: {
          message: "This password reset token has already been used.",
          meta: {
            token: ["Request a new password reset link."],
          },
        },
      });
    }

    if (new Date(resetRequest.expires_at).getTime() <= Date.now()) {
      return res.status(422).json({
        error: {
          message: "This password reset token has expired.",
          meta: {
            token: ["Request a new password reset link."],
          },
        },
      });
    }

    user.password = hashPassword(payload.password);
    user.updated_at = new Date().toISOString();
    resetRequest.used_at = new Date().toISOString();
    resetRequest.updated_at = resetRequest.used_at;
    persistStore();

    return res.json({
      message: "Password has been updated.",
    });
  });
});

app.post("/api/auth/logout", requireAuth, (req, res) => {
  const user = store.collections.users.find(
    (item) => Number(item.id) === Number(req.session.userId)
  );
  if (user) {
    clearLoginTelemetry(user);
    persistStore();
  }
  tokens.delete(req.session.token);
  return res.json({
    message: "Logged out",
  });
});

app.use("/api", requireAuth);

app.get("/api/auth/user", requireAuth, (req, res) => {
  return res.json(req.session.user);
});

app.get("/api/gravatar/:id", (req, res) => {
  return res.json(getGravatarUrl(store, req.params.id));
});

app.get("/api/employees", (req, res) => {
  return res.json(listEmployees(store, req.query));
});

app.post("/api/employees/search", (req, res) => {
  return res.json(searchEmployees(store, req.query, req.body || {}));
});

app.get("/api/employees/:id", (req, res) => {
  const payload = showEmployee(store, req.params.id);
  if (!payload) {
    return respondNotFound(res, "Employee was not found");
  }

  return res.json({
    data: payload,
  });
});

app.get("/api/employments_autocomplete_options", (req, res) => {
  return res.json(listEmploymentAutocompleteOptions(store));
});

app.get("/api/employments_autocomplete_options/:id", (req, res) => {
  const payload = showEmploymentAutocompleteOption(store, req.params.id);
  if (!payload) {
    return respondNotFound(res, "Employment was not found");
  }

  return res.json(payload);
});

app.get("/api/utilities/select_options/:key", (req, res) => {
  const payload = getSelectOptions(store, req.params.key);
  if (!payload) {
    return respondNotFound(res, "Select options were not found");
  }

  return res.json(payload);
});

app.post("/api/utilities/change_parent_employment", (req, res) => {
  return runSafe(res, () => {
    validateChangeParentEmploymentPayload(store, req.body || {});
    const payload = changeParentEmployment(store, req.body || {});
    return finishMutation(res, payload, {
      notFoundMessage: "Employment was not found",
    });
  });
});

app.get("/api/utilities/dashboard/:mode/:scope", (req, res) => {
  const includeAssessmentRecords =
    req.params.scope === "employments_has_assessments" ||
    req.params.scope === "sub_employments_has_assessments";

  const payload = getDashboardEmploymentStats(
    store,
    req.params.mode,
    includeAssessmentRecords,
    req.query,
    req.session?.userId || 1
  );

  return res.json(payload);
});

app.get("/api/utilities/dashboard/exports/:mode/:scope", (req, res) => {
  const exportBuffer = getDashboardExportBuffer(
    store,
    req.params.mode,
    req.session?.userId || 1
  );

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${req.params.scope}.csv"`
  );
  return res.send(exportBuffer);
});

app.get("/api/utilities/analytics/positions/statistics", (req, res) => {
  return res.json(getPositionStatistics(store));
});

app.get("/api/utilities/analytics/aplied_employes", (req, res) => {
  return res.json(getAppliedEmployeesAnalytics(store));
});

app.get("/api/utilities/analytics/employes", (req, res) => {
  return res.json(listEmployeeAnalytics(store, req.query));
});

app.get("/api/utilities/analytics/employes/:id", (req, res) => {
  const payload = getEmployeeAnalyticsDetail(store, req.params.id);
  if (!payload) {
    return respondNotFound(res, "Employee analytics were not found");
  }

  return res.json(payload);
});

app.get("/api/utilities/analytics/competence_employe/by_department", (req, res) => {
  return res.json(getDepartmentList(store));
});

app.get(
  "/api/utilities/analytics/competence_employe/by_department/:id",
  (req, res) => {
    const payload = getDepartmentDetail(
      store,
      req.params.id,
      String(req.query.showParticipation).toLowerCase() !== "false"
    );

    if (!payload) {
      return respondNotFound(res, "Department analytics were not found");
    }

    return res.json(payload);
  }
);

app.post("/api/transactions/assessment_record/add_position/:employmentId", (req, res) => {
  return runSafe(res, () => {
    validateAddPositionPayload(store, req.params.employmentId, req.body || {});
    const payload = addPositionToEmployment(
      store,
      req.params.employmentId,
      req.body || {}
    );

    return finishMutation(res, payload, {
      notFoundMessage: "Employment was not found",
    });
  });
});

app.post("/api/transactions/assessment_record/:employmentId", (req, res) => {
  return runSafe(res, () => {
    validateAssessmentTransactionPayload(
      store,
      req.params.employmentId,
      req.body || {}
    );
    const payload = saveAssessmentRecordTransaction(
      store,
      req.params.employmentId,
      req.body || {}
    );

    return finishMutation(res, payload, {
      notFoundMessage: "Employment was not found",
    });
  });
});

app.get("/api/utilities/uploads/libraries/publication-bucket-lists", (req, res) => {
  return res.json(getPublicationBucketLists(store));
});

app.get(
  "/api/utilities/uploads/libraries/publication-bucket-lists/:id",
  (req, res) => {
    const payload = getPublicationBucketDetail(store, req.params.id);
    if (!payload) {
      return respondNotFound(res, "Bucket was not found");
    }

    return res.json(payload);
  }
);

app.get("/api/utilities/uploads/libraries/publication-categories", (req, res) => {
  return res.json(getPublicationCategories(store));
});

app.post(
  "/api/utilities/uploads/libraries/publication-approval/:id",
  (req, res) => {
    return runSafe(res, () => {
      const payload = approvePublication(
        store,
        req.params.id,
        req.body?.isVerified
      );

      return finishMutation(res, payload, {
        notFoundMessage: "Publication was not found",
      });
    });
  }
);

app.post("/api/utilities/uploads/libraries", uploadLimiter, async (req, res) => {
  return runSafeAsync(res, async () => {
    const isMultipart = String(req.headers["content-type"] || "").includes(
      "multipart/form-data"
    );
    const multipart = isMultipart ? await readMultipartPayload(req) : null;
    const payload = isMultipart ? multipart.fields : req.body || {};
    const primaryFile = multipart?.primaryFile || null;

    validatePublicationUploadPayload(store, payload, {
      fileName: primaryFile?.fileName || null,
    });

    let document = null;
    if (primaryFile) {
      const titleSource =
        payload.publication_slug || payload.publication_title || primaryFile.fileName;
      const extension =
        path.extname(primaryFile.fileName).replace(/^\./, "").toLowerCase() || "pdf";
      const hashName = `${sanitizeFileStem(titleSource, "publication")}-${Date.now()}`;
      const fileName = `${hashName}.${extension}`;
      saveUploadedFile(PUBLICATION_STORAGE_DIRECTORY, fileName, primaryFile.buffer);
      document = {
        hashName,
        name: path.basename(primaryFile.fileName, path.extname(primaryFile.fileName)),
        extension,
        path: "mock-publications",
        storagePath: `mock-publications/${fileName}`,
        type: primaryFile.contentType || "application/pdf",
        description:
          payload.publication_description ||
          `Uploaded document ${path.basename(primaryFile.fileName)}`,
        sizeLabel: formatFileSize(primaryFile.buffer.length),
      };
    }

    const created = uploadPublication(store, {
      ...payload,
      document,
    });
    return finishMutation(res, created, {
      buildBody: (data) => ({
        data,
        message: primaryFile
          ? "Publication uploaded and persisted."
          : "Publication created and persisted.",
      }),
    });
  });
});

app.post("/api/utilities/importers/:resource", async (req, res) => {
  return runSafeAsync(res, async () => {
    const isMultipart = String(req.headers["content-type"] || "").includes(
      "multipart/form-data"
    );

    if (!isMultipart) {
      return res.json(importResource(req.params.resource, req.body || {}));
    }

    const { primaryFile } = await readMultipartPayload(req);
    if (!primaryFile) {
      return res.status(422).json({
        error: {
          message: "No import file was provided.",
        },
      });
    }

    const resourceDirectory = path.join(
      IMPORT_STORAGE_DIRECTORY,
      sanitizeFileStem(req.params.resource, "imports")
    );
    const fileName = `${Date.now()}-${path.basename(primaryFile.fileName)}`;
    saveUploadedFile(resourceDirectory, fileName, primaryFile.buffer);

    return res.json(
      importResource(req.params.resource, {
        fileName,
      })
    );
  });
});

app.get("/api/:resource", (req, res, next) => {
  if (!isGenericResource(req.params.resource)) {
    return next();
  }

  const payload = listResources(store, req.params.resource, req.query);
  return res.json(payload);
});

app.post("/api/:resource/search", (req, res, next) => {
  if (!isGenericResource(req.params.resource)) {
    return next();
  }

  const payload = searchResources(
    store,
    req.params.resource,
    req.query,
    req.body || {}
  );
  return res.json(payload);
});

app.get("/api/:resource/:id", (req, res, next) => {
  if (!isGenericResource(req.params.resource)) {
    return next();
  }

  const payload = showResource(store, req.params.resource, req.params.id);
  if (!payload) {
    return respondNotFound(res);
  }

  return res.json({
    data: payload,
  });
});

app.post("/api/:resource", (req, res, next) => {
  if (!isGenericResource(req.params.resource)) {
    return next();
  }

  return runSafe(res, () => {
    validateGenericMutation(store, req.params.resource, req.body || {}, {
      mode: "create",
    });
    const created = createGenericRecord(store, req.params.resource, req.body || {});
    return finishMutation(res, created, {
      statusCode: 201,
      buildBody: (data) => ({
        data,
      }),
    });
  });
});

app.patch("/api/:resource/:id", (req, res, next) => {
  if (!isGenericResource(req.params.resource)) {
    return next();
  }

  return runSafe(res, () => {
    validateGenericMutation(store, req.params.resource, req.body || {}, {
      mode: "update",
      currentId: req.params.id,
    });
    const updated = updateGenericRecord(
      store,
      req.params.resource,
      req.params.id,
      req.body || {}
    );

    return finishMutation(res, updated, {
      buildBody: (data) => ({
        data,
      }),
    });
  });
});

app.delete("/api/:resource/:id", (req, res, next) => {
  if (!isGenericResource(req.params.resource)) {
    return next();
  }

  const deleted = deleteGenericRecord(store, req.params.resource, req.params.id);
  if (!deleted) {
    return respondNotFound(res);
  }

  persistStore();
  return res.json({
    message: "Deleted",
  });
});

app.use("/api", (req, res) => {
  return res.status(404).json({
    error: {
      message: "This endpoint is not implemented in mock mode.",
    },
  });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Local backend listening on http://localhost:${port}`);
  });
}

module.exports = {
  app,
};
