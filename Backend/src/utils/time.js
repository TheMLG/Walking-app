export function getZonedParts(date, timeZone) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const parts = formatter.formatToParts(date);
  const map = {};
  for (const part of parts) {
    if (part.type !== 'literal') {
      map[part.type] = Number(part.value);
    }
  }

  return {
    year: map.year,
    month: map.month,
    day: map.day,
    hour: map.hour,
    minute: map.minute,
    second: map.second
  };
}

export function formatZonedDateKey(date, timeZone) {
  const { year, month, day } = getZonedParts(date, timeZone);
  return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

export function zonedLocalDateToUtc(timeZone, year, month, day, hour = 0, minute = 0, second = 0) {
  let utcTime = Date.UTC(year, month - 1, day, hour, minute, second);

  for (let i = 0; i < 2; i += 1) {
    const offsetMinutes = getTimezoneOffsetMinutes(timeZone, new Date(utcTime));
    const nextUtcTime = Date.UTC(year, month - 1, day, hour, minute, second) - offsetMinutes * 60 * 1000;
    if (nextUtcTime === utcTime) {
      break;
    }
    utcTime = nextUtcTime;
  }

  return new Date(utcTime);
}

export function getTimezoneOffsetMinutes(timeZone, date) {
  const { year, month, day, hour, minute, second } = getZonedParts(date, timeZone);
  const asUtc = Date.UTC(year, month - 1, day, hour, minute, second);
  return Math.round((asUtc - date.getTime()) / 60000);
}

export function getZonedWindow(timeZone, date = new Date()) {
  const parts = getZonedParts(date, timeZone);
  const start = zonedLocalDateToUtc(timeZone, parts.year, parts.month, parts.day, 0, 0, 0);
  const next = new Date(start);
  next.setUTCDate(next.getUTCDate() + 1);
  return { start, end: next, parts };
}

export function getZonedWeekWindow(timeZone, date = new Date()) {
  const parts = getZonedParts(date, timeZone);
  const currentUtc = zonedLocalDateToUtc(timeZone, parts.year, parts.month, parts.day, 0, 0, 0);
  const dayOfWeek = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short' }).format(date);
  const weekdayIndex = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[dayOfWeek];
  const mondayOffset = (weekdayIndex + 6) % 7;
  const start = new Date(currentUtc);
  start.setUTCDate(start.getUTCDate() - mondayOffset);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 7);
  return { start, end };
}

export function getZonedMonthWindow(timeZone, date = new Date()) {
  const parts = getZonedParts(date, timeZone);
  const start = zonedLocalDateToUtc(timeZone, parts.year, parts.month, 1, 0, 0, 0);
  const end = new Date(zonedLocalDateToUtc(timeZone, parts.year, parts.month, 1, 0, 0, 0));
  end.setUTCMonth(end.getUTCMonth() + 1);
  return { start, end };
}

export function addDaysUtc(date, days) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function shiftDateKey(dateKey, days) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return `${date.getUTCFullYear().toString().padStart(4, '0')}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}
