export function getTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return '';
  }
}

export function getTimezoneOffset(): number {
  return new Date().getTimezoneOffset();
}
