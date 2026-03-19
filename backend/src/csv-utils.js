"use strict";

const { ValidationError } = require("./api-errors");

function stripUtf8Bom(text) {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

function parseCsvText(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (inQuotes) {
      if (char === '"') {
        if (text[index + 1] === '"') {
          cell += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === ",") {
      row.push(cell);
      cell = "";
      continue;
    }

    if (char === "\r") {
      if (text[index + 1] === "\n") {
        index += 1;
      }
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  row.push(cell);
  rows.push(row);

  return rows.filter((candidateRow) =>
    candidateRow.some((candidateCell) => String(candidateCell || "").trim() !== "")
  );
}

function normalizeHeader(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/(^_|_$)/g, "");
}

function parseCsvBuffer(buffer) {
  const text = stripUtf8Bom(Buffer.from(buffer || "").toString("utf8"));
  const rows = parseCsvText(text);

  if (rows.length === 0) {
    throw new ValidationError("Import file is empty.");
  }

  const headers = rows[0].map((header) => normalizeHeader(header));
  if (headers.every((header) => !header)) {
    throw new ValidationError("Import file must include a header row.");
  }

  const dataRows = rows.slice(1).map((row) => {
    const record = {};
    headers.forEach((header, index) => {
      if (!header) {
        return;
      }
      record[header] = String(row[index] ?? "").trim();
    });
    return record;
  });

  return {
    headers,
    rows: dataRows.filter((row) =>
      Object.values(row).some((value) => String(value || "").trim() !== "")
    ),
  };
}

function assertRequiredHeaders(headers, requiredHeaders, message) {
  const missingHeaders = requiredHeaders.filter(
    (requiredHeader) => !headers.includes(requiredHeader)
  );

  if (missingHeaders.length > 0) {
    throw new ValidationError(message, {
      headers: [
        `Missing required columns: ${missingHeaders.join(", ")}.`,
      ],
    });
  }
}

module.exports = {
  assertRequiredHeaders,
  normalizeHeader,
  parseCsvBuffer,
};
