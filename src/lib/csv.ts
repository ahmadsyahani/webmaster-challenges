export function csvCell(value: string) {
  // Quote delimiters/newlines and neutralize formulas, including leading whitespace.
  const safe = /^[\s]*[=+\-@]/.test(value) || /^[\t\r\n]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}
