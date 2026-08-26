// Formatters and utilities for Vacanyi Building Contractor Management Portal

/**
 * Format a number as South African Rand (ZAR)
 * e.g., 145000 -> "R 145,000.00"
 */
export function formatZAR(amount: number | string | null | undefined): string {
  const numeric = typeof amount === 'string' ? parseFloat(amount) : (amount ?? 0);
  if (isNaN(numeric)) return 'R 0.00';
  
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numeric).replace('ZAR', 'R');
}

/**
 * Format date to human-readable South African standard
 * e.g., "2026-08-26" -> "26 Aug 2026"
 */
export function formatDate(dateString?: string | null): string {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

/**
 * Format date to ISO YYYY-MM-DD
 */
export function toISODate(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

/**
 * Normalize South African phone number for WhatsApp links
 * Handles:
 * "063 343 7927" -> "27633437927"
 * "+27 63 343 7927" -> "27633437927"
 * "27633437927" -> "27633437927"
 */
export function normalizeWhatsAppNumber(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return `27${cleaned.slice(1)}`;
  }
  if (cleaned.startsWith('27')) {
    return cleaned;
  }
  return cleaned;
}

/**
 * Format phone for display: "063 343 7927"
 */
export function formatPhoneDisplay(phone: string): string {
  if (!phone) return '-';
  const cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('27') && cleaned.length === 11) {
    const local = `0${cleaned.slice(2)}`;
    return `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
  }
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  return phone;
}

/**
 * Status style helpers
 */
export function getStatusBadgeClass(status: string): string {
  switch (status.toLowerCase()) {
    case 'paid':
    case 'completed':
    case 'certified':
    case 'accepted':
    case 'active':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500/20';
    case 'in_progress':
    case 'issued':
    case 'sent':
      return 'bg-amber-50 text-amber-800 border-amber-200 ring-1 ring-amber-500/20';
    case 'partially_paid':
      return 'bg-blue-50 text-blue-800 border-blue-200 ring-1 ring-blue-500/20';
    case 'planning':
    case 'draft':
    case 'lead':
    case 'pending':
      return 'bg-slate-100 text-slate-700 border-slate-200 ring-1 ring-slate-400/20';
    case 'overdue':
    case 'declined':
    case 'expired':
    case 'cancelled':
    case 'on_hold':
      return 'bg-rose-50 text-rose-700 border-rose-200 ring-1 ring-rose-500/20';
    case 'snagging':
      return 'bg-purple-50 text-purple-700 border-purple-200 ring-1 ring-purple-500/20';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

/**
 * Human readable status label
 */
export function formatStatusLabel(status: string): string {
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
