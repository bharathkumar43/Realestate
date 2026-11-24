import type { AreaUnit, Plot } from './types';

const trim = (n: number) => Number(n.toFixed(2)).toString();

/** 4500000 -> "₹45 L", 12000000 -> "₹1.2 Cr", 85000 -> "₹85,000" */
export function formatINR(value: number): string {
  if (!Number.isFinite(value)) return '—';
  if (value >= 1e7) return `₹${trim(value / 1e7)} Cr`;
  if (value >= 1e5) return `₹${trim(value / 1e5)} L`;
  return `₹${value.toLocaleString('en-IN')}`;
}

export function formatINRFull(value: number): string {
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

export const unitLabel: Record<AreaUnit, string> = {
  sqyd: 'sq.yd',
  sqft: 'sq.ft',
  acre: 'acres',
};

const SQYD_PER: Record<AreaUnit, number> = { sqyd: 1, sqft: 1 / 9, acre: 4840 };

export function toSqyd(value: number, unit: AreaUnit): number {
  return value * SQYD_PER[unit];
}

export function formatArea(value: number, unit: AreaUnit): string {
  return `${Number(value).toLocaleString('en-IN')} ${unitLabel[unit]}`;
}

/** All three representations of a plot's area, for the detail page. */
export function areaBreakdown(p: Pick<Plot, 'area_value' | 'area_unit'>) {
  const sqyd = toSqyd(p.area_value, p.area_unit);
  return {
    sqyd: Math.round(sqyd).toLocaleString('en-IN'),
    sqft: Math.round(sqyd * 9).toLocaleString('en-IN'),
    acre: trim(sqyd / 4840),
  };
}

/** Rate per sq.yd (or per acre for big land parcels). */
export function ratePer(p: Pick<Plot, 'price' | 'area_value' | 'area_unit'>): string {
  const sqyd = toSqyd(p.area_value, p.area_unit);
  if (!sqyd) return '—';
  if (p.area_unit === 'acre') return `${formatINR(p.price / (sqyd / 4840))} / acre`;
  return `${formatINRFull(p.price / sqyd)} / sq.yd`;
}

export const statusLabel = { available: 'Available', reserved: 'Reserved', sold: 'Sold' } as const;
