import { AppState, Device, Settings, WaterRecord } from './types';

export const DEFAULT_SETTINGS: Settings = { goal: 2000, defaultCup: 250 };
export const GOAL_MIN = 250;
export const GOAL_MAX = 10000;
export const CUP_MIN = 50;
export const CUP_MAX = 2000;

const WEEKDAYS = [
  'domingo',
  'segunda-feira',
  'terça-feira',
  'quarta-feira',
  'quinta-feira',
  'sexta-feira',
  'sábado',
];

const MONTHS = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

export function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

export function dateKey(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function dateFromKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
}

export function shiftDate(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

export function todayKey(): string {
  return dateKey(new Date());
}

export function monthStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1, 12);
}

export function numberFormat(value: number): string {
  return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function litresFormat(value: number): string {
  const [integer, decimals] = (value / 1000).toFixed(1).split('.');
  return `${integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${decimals}`;
}

export function compactVolume(amount: number): string {
  if (amount >= 1000) return `${(amount / 1000).toFixed(1).replace('.', ',')}k`;
  return String(Math.round(amount));
}

export function timeFormat(timestamp: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '--:--';
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

export function longDate(date: Date): string {
  return `${WEEKDAYS[date.getDay()]}, ${date.getDate()} de ${MONTHS[date.getMonth()]}`;
}

export function monthTitle(date: Date): string {
  return `${MONTHS[date.getMonth()]} de ${date.getFullYear()}`;
}

export function dayRecords(records: WaterRecord[], key: string): WaterRecord[] {
  return records
    .filter((record) => record.date === key)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function dayTotal(records: WaterRecord[], key: string): number {
  return records.reduce((total, record) => total + (record.date === key ? Number(record.amount) : 0), 0);
}

export function allDayTotals(records: WaterRecord[]): Map<string, number> {
  const totals = new Map<string, number>();
  records.forEach((record) => {
    totals.set(record.date, (totals.get(record.date) ?? 0) + Number(record.amount));
  });
  return totals;
}

export function getStreak(records: WaterRecord[], goal: number): number {
  const today = new Date();
  let cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12);
  if (dayTotal(records, dateKey(cursor)) < goal) cursor = shiftDate(cursor, -1);
  let streak = 0;
  while (dayTotal(records, dateKey(cursor)) >= goal) {
    streak += 1;
    cursor = shiftDate(cursor, -1);
  }
  return streak;
}

export function yearStats(records: WaterRecord[], goal: number) {
  const year = new Date().getFullYear();
  const today = todayKey();
  const totals = allDayTotals(records);
  let total = 0;
  let days = 0;
  let goalDays = 0;
  totals.forEach((amount, key) => {
    if (dateFromKey(key).getFullYear() === year && key <= today) {
      total += amount;
      days += 1;
      if (amount >= goal) goalDays += 1;
    }
  });
  return { total, days, goalDays, average: days ? total / days : 0 };
}

export function bestYearStreak(records: WaterRecord[], goal: number): number {
  const year = new Date().getFullYear();
  const today = todayKey();
  const totals = allDayTotals(records);
  let best = 0;
  let current = 0;
  const cursor = new Date(year, 0, 1, 12);
  while (dateKey(cursor) <= today) {
    if ((totals.get(dateKey(cursor)) ?? 0) >= goal) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return best;
}

export function validNumber(value: unknown, min: number, max: number, fallback: number): number {
  const number = Number(value);
  return Number.isFinite(number) && number >= min && number <= max ? number : fallback;
}

type RawState = {
  records?: unknown;
  settings?: { goal?: unknown; defaultCup?: unknown } | null;
  devices?: unknown;
};

export function sanitizeState(input: unknown): AppState | null {
  if (!input || typeof input !== 'object') return null;
  const raw = input as RawState;
  if (!Array.isArray(raw.records) || !raw.settings) return null;

  const records: WaterRecord[] = [];
  raw.records.forEach((item, index) => {
    if (!item || typeof item !== 'object') return;
    const candidate = item as Partial<WaterRecord>;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(candidate.date))) return;
    if (!(Number(candidate.amount) > 0)) return;
    records.push({
      id: typeof candidate.id === 'string' ? candidate.id : `r-restored-${index}`,
      date: String(candidate.date),
      amount: Number(candidate.amount),
      timestamp:
        typeof candidate.timestamp === 'string'
          ? candidate.timestamp
          : `${candidate.date}T12:00:00.000Z`,
    });
  });

  const devices: Device[] = [];
  if (Array.isArray(raw.devices)) {
    raw.devices.forEach((item) => {
      if (!item || typeof item !== 'object') return;
      const candidate = item as Partial<Device>;
      if (typeof candidate.code !== 'string') return;
      devices.push({
        code: candidate.code,
        addedAt: typeof candidate.addedAt === 'string' ? candidate.addedAt : '',
      });
    });
  }

  return {
    records,
    settings: {
      goal: validNumber(raw.settings.goal, GOAL_MIN, GOAL_MAX, DEFAULT_SETTINGS.goal),
      defaultCup: validNumber(raw.settings.defaultCup, CUP_MIN, CUP_MAX, DEFAULT_SETTINGS.defaultCup),
    },
    devices,
  };
}
