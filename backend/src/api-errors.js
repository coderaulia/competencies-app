"use strict";

class ApiError extends Error {
  constructor(message, statusCode = 500, meta = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.meta = meta;
  }
}

class ValidationError extends ApiError {
  constructor(message = "Validation failed", meta = null) {
    super(message, 422, meta);
  }
}

class NotFoundError extends ApiError {
  constructor(message = "Resource not found") {
    super(message, 404);
  }
}

function isApiError(error) {
  return error instanceof ApiError;
}

module.exports = {
  ApiError,
  ValidationError,
  NotFoundError,
  isApiError,
};
