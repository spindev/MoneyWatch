/** Format a number with 2 decimal places in German locale (e.g. "1.234,56"). */
export function fmt(value: number, decimals = 2): string {
  return value.toLocaleString('de-DE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Format a date ISO string (YYYY-MM-DD) as "DD.MM.YYYY". */
export function fmtDate(iso?: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d ?? ''}.${m ?? ''}.${y ?? ''}`;
}
