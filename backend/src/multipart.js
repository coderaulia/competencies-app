"use strict";

const fs = require("node:fs");
const path = require("node:path");

function parseBoundary(contentType) {
  const match = String(contentType || "").match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  return match ? match[1] || match[2] : null;
}

async function readRequestBuffer(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

async function parseMultipartForm(req) {
  const boundary = parseBoundary(req.headers["content-type"]);
  if (!boundary) {
    return {
      fields: {},
      files: [],
    };
  }

  const rawBuffer = await readRequestBuffer(req);
  const rawText = rawBuffer.toString("latin1");
  const token = `--${boundary}`;
  const parts = rawText
    .split(token)
    .slice(1, -1)
    .map((part) => part.replace(/^\r\n/, "").replace(/\r\n$/, ""))
    .filter(Boolean);

  const fields = {};
  const files = [];

  for (const part of parts) {
    const separatorIndex = part.indexOf("\r\n\r\n");
    if (separatorIndex === -1) {
      continue;
    }

    const headerText = part.slice(0, separatorIndex);
    const bodyText = part.slice(separatorIndex + 4).replace(/\r\n$/, "");
    const headers = headerText.split("\r\n");
    const disposition = headers.find((header) =>
      header.toLowerCase().startsWith("content-disposition:")
    );

    if (!disposition) {
      continue;
    }

    const nameMatch = disposition.match(/name="([^"]+)"/i);
    const fileNameMatch = disposition.match(/filename="([^"]*)"/i);
    const fieldName = nameMatch ? nameMatch[1] : null;

    if (!fieldName) {
      continue;
    }

    if (fileNameMatch && fileNameMatch[1]) {
      const fileName = path.basename(fileNameMatch[1]);
      const contentTypeHeader = headers.find((header) =>
        header.toLowerCase().startsWith("content-type:")
      );
      files.push({
        fieldName,
        fileName,
        contentType: contentTypeHeader
          ? contentTypeHeader.split(":")[1].trim()
          : "application/octet-stream",
        buffer: Buffer.from(bodyText, "latin1"),
      });
      continue;
    }

    fields[fieldName] = bodyText;
  }

  return {
    fields,
    files,
  };
}

function sanitizeFileStem(value, fallback) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return normalized || fallback;
}

function formatFileSize(byteLength) {
  const bytes = Number(byteLength) || 0;
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
  if (bytes >= 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${bytes} B`;
}

function saveUploadedFile(directoryPath, fileName, buffer) {
  fs.mkdirSync(directoryPath, { recursive: true });
  const filePath = path.join(directoryPath, fileName);
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

module.exports = {
  formatFileSize,
  parseMultipartForm,
  sanitizeFileStem,
  saveUploadedFile,
};
