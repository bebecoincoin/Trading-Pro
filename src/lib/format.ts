export function fmtCurrency(v: number | null | undefined, currency = 'USD') {
  if (v === null || v === undefined || isNaN(v)) return '—';
  const abs = Math.abs(v);
  const opts: Intl.NumberFormatOptions =
    abs >= 1
      ? { style: 'currency', currency, maximumFractionDigits: 2 }
      : { style: 'currency', currency, maximumFractionDigits: 6 };
  return new Intl.NumberFormat('en-US', opts).format(v);
}

export function fmtCompact(v: number | null | undefined) {
  if (v === null || v === undefined || isNaN(v)) return '—';
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(v);
}

export function fmtPct(v: number | null | undefined, digits = 2) {
  if (v === null || v === undefined || isNaN(v)) return '—';
  const s = v.toFixed(digits);
  return v >= 0 ? `+${s}%` : `${s}%`;
}

export function pctColor(v: number | null | undefined) {
  if (v === null || v === undefined) return 'text-text-muted';
  if (v > 0) return 'text-accent-green';
  if (v < 0) return 'text-accent-red';
  return 'text-text-muted';
}

export function fmtDate(ts: number) {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(ts));
}
