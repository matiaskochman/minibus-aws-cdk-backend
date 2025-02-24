export function dateToNumeric(isoDate: string): number {
  const date = new Date(isoDate);
  return parseInt(
    `${date.getUTCFullYear()}${(date.getUTCMonth() + 1)
      .toString()
      .padStart(2, "0")}${date.getUTCDate().toString().padStart(2, "0")}${date
      .getUTCHours()
      .toString()
      .padStart(2, "0")}${date
      .getUTCMinutes()
      .toString()
      .padStart(2, "0")}${date.getUTCSeconds().toString().padStart(2, "0")}`,
    10
  );
}
