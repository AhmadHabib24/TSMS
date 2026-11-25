export function toLocalISODate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getClientTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

/** Query params for /bills with client-local day boundaries on the server */
export function billsDateRangeParams(startDate: string, endDate: string) {
  const params = new URLSearchParams();
  params.append('start_date', startDate);
  params.append('end_date', endDate);
  params.append('timezone', getClientTimezone());
  return params;
}

export function todayBillsQueryParams() {
  const today = toLocalISODate(new Date());
  return billsDateRangeParams(today, today);
}