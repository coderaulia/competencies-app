"use strict";

const { DATABASE_FILE, resetPersistedCollections } = require("./store-persistence");

resetPersistedCollections();
console.log(`Reset backend database at ${DATABASE_FILE}`);
