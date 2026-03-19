export function formatUtcDate(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toUTCString();
}
