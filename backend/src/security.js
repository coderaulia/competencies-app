"use strict";

const crypto = require("node:crypto");

const PASSWORD_SCHEME = "scrypt";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function isHashedPassword(value) {
  return String(value || "").startsWith(`${PASSWORD_SCHEME}$`);
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto
    .scryptSync(String(password || ""), salt, 64)
    .toString("hex");

  return `${PASSWORD_SCHEME}$${salt}$${derivedKey}`;
}

function verifyPassword(password, storedValue) {
  const candidate = String(storedValue || "");
  if (!candidate) {
    return false;
  }

  if (!isHashedPassword(candidate)) {
    return String(password || "") === candidate;
  }

  const [, salt, expectedHash] = candidate.split("$");
  if (!salt || !expectedHash) {
    return false;
  }

  const actualHash = crypto
    .scryptSync(String(password || ""), salt, 64)
    .toString("hex");

  return crypto.timingSafeEqual(
    Buffer.from(actualHash, "hex"),
    Buffer.from(expectedHash, "hex")
  );
}

function hashResetToken(token) {
  return crypto
    .createHash("sha256")
    .update(String(token || ""))
    .digest("hex");
}

function upgradePersistedCollections(collections = {}) {
  const upgraded = clone(collections);
  let changed = false;

  upgraded.users = Array.isArray(upgraded.users) ? upgraded.users : [];
  upgraded.password_reset_requests = Array.isArray(
    upgraded.password_reset_requests
  )
    ? upgraded.password_reset_requests
    : [];

  upgraded.users.forEach((user) => {
    if (!isHashedPassword(user.password)) {
      user.password = hashPassword(user.password || "password");
      changed = true;
    }
  });

  upgraded.password_reset_requests.forEach((request) => {
    if (!request.token_hash && request.token) {
      request.token_hash = hashResetToken(request.token);
      delete request.token;
      changed = true;
    }
  });

  return {
    collections: upgraded,
    changed,
  };
}

module.exports = {
  hashPassword,
  verifyPassword,
  hashResetToken,
  upgradePersistedCollections,
};
