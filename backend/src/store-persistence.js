"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { createSeedState } = require("./data");
const { createStore } = require("./mock-api-core");
const { upgradePersistedCollections } = require("./security");

const DATA_DIRECTORY = path.join(__dirname, "..", "data");
const DATABASE_FILE = path.join(DATA_DIRECTORY, "app-db.json");

function ensureDirectory(directoryPath) {
  fs.mkdirSync(directoryPath, { recursive: true });
}

function writeJsonAtomic(filePath, payload) {
  ensureDirectory(path.dirname(filePath));
  const tempPath = `${filePath}.tmp`;
  fs.writeFileSync(tempPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  fs.renameSync(tempPath, filePath);
}

function resetPersistedCollections() {
  const collections = upgradePersistedCollections(createSeedState()).collections;
  writeJsonAtomic(DATABASE_FILE, {
    version: 1,
    updated_at: new Date().toISOString(),
    collections,
  });
  return collections;
}

function loadPersistedCollections(options = {}) {
  const shouldReset =
    options.reset === true || process.env.BACKEND_RESET_ON_BOOT === "true";

  if (shouldReset || !fs.existsSync(DATABASE_FILE)) {
    return resetPersistedCollections();
  }

  const raw = fs.readFileSync(DATABASE_FILE, "utf8");
  const payload = JSON.parse(raw);
  const collections = payload.collections || createSeedState();
  const upgraded = upgradePersistedCollections(collections);

  if (upgraded.changed) {
    writeJsonAtomic(DATABASE_FILE, {
      version: 1,
      updated_at: new Date().toISOString(),
      collections: upgraded.collections,
    });
  }

  return upgraded.collections;
}

function persistStore(store) {
  writeJsonAtomic(DATABASE_FILE, {
    version: 1,
    updated_at: new Date().toISOString(),
    collections: store.collections,
  });
}

function createPersistentStore(options = {}) {
  const store = createStore(loadPersistedCollections(options));
  return {
    ...store,
    persist() {
      persistStore(store);
    },
    dbFile: DATABASE_FILE,
  };
}

module.exports = {
  DATABASE_FILE,
  createPersistentStore,
  loadPersistedCollections,
  persistStore,
  resetPersistedCollections,
};
