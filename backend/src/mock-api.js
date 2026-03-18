"use strict";

const core = require("./mock-api-core");
const analytics = require("./mock-api-analytics");
const publications = require("./mock-api-publications");

module.exports = {
  ...core,
  ...analytics,
  ...publications,
};
