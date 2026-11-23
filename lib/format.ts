export function formatNumber(value: number | string | null | undefined) {
  return new Intl.NumberFormat('id-ID').format(Number(value || 0));
}

export function formatCurrency(value: number | string | null | undefined) {
  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function formatRupiah(value: number | string | null | undefined) {
  return `Rp ${formatCurrency(value)}`;
}

export function formatDateTime(
  value: string | Date | null | undefined
) {
  if (!value) return '-';

  const date = new Date(value);

  if (isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Asia/Jakarta',
  }).format(date);
}