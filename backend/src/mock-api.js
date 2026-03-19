"use strict";

const core = require("./mock-api-core");
const analytics = require("./mock-api-analytics");
const publications = require("./mock-api-publications");
const importers = require("./mock-api-importers");

module.exports = {
  ...core,
  ...analytics,
  ...publications,
  ...importers,
};
