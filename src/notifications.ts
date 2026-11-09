import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { dateKey, timeFormat } from './logic';
import { AppState, WaterRecord } from './types';

/** Sem beber água por 2h → lembrete. */
export const IDLE_HOURS = 2;
/** Sem beber por 5h → alerta forte. */
export const CRITICAL_HOURS = 5;
/** Sem abrir o app por 7 dias → aviso de silenciamento. */
export const MUTED_DAYS = 7;

/** Distância mínima entre duas notificações agendadas. */
const MIN_GAP_MS = 45 * 60 * 1000;
/** Horas do dia com pelo menos 2 registros contam como "horário de sempre". */
const MIN_HITS = 2;
const HABIT_LOOKBACK_DAYS = 30;

export type PlannedNotification = {
  id: string;
  at: Date;
  title: string;
  body: string;
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/** Cria o canal de som no Android e pede permissão. Chamar uma vez na abertura. */
export async function configureNotifications(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('lembretes', {
      name: 'Lembretes de hidratação',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#5eead4',
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

function parseTime(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function latestDrink(records: WaterRecord[]): number {
  let latest = 0;
  records.forEach((record) => {
    const time = parseTime(record.timestamp, 0);
    if (time > latest) latest = time;
  });
  return latest;
}

/** Horários em que a pessoa costuma beber (últimos 30 dias). */
export function typicalHours(records: WaterRecord[], now: Date): number[] {
  const cutoff = now.getTime() - HABIT_LOOKBACK_DAYS * 24 * 60 * 60 * 1000;
  const counts = new Map<number, number>();
  records.forEach((record) => {
    const time = parseTime(record.timestamp, 0);
    if (time < cutoff) return;
    const hour = new Date(time).getHours();
    counts.set(hour, (counts.get(hour) ?? 0) + 1);
  });
  return [...counts.entries()]
    .filter(([, hits]) => hits >= MIN_HITS)
    .sort((a, b) => b[1] - a[1])
    .map(([hour]) => hour);
}

/** Próxima ocorrência futura de um horário costumeiro, ignorando dias em que já bebeu naquele hour. */
function nextHabitMoment(
  records: WaterRecord[],
  hours: number[],
  now: Date
): { at: Date; hour: number } | null {
  const earliest = now.getTime() + 60 * 60 * 1000;
  for (let dayOffset = 0; dayOffset <= 7; dayOffset += 1) {
    const day = new Date(now);
    day.setDate(day.getDate() + dayOffset);
    for (const hour of hours) {
      const candidate = new Date(day);
      candidate.setHours(hour, 0, 0, 0);
      if (candidate.getTime() < earliest) continue;
      const alreadyDrank = records.some(
        (record) =>
          record.date === dateKey(candidate) &&
          new Date(parseTime(record.timestamp, 0)).getHours() === hour
      );
      if (alreadyDrank) continue;
      return { at: candidate, hour };
    }
  }
  return null;
}

/**
 * Calcula quais notificações disparar, sem tocar em nada do sistema.
 * Se a pessoa ignorar o app por MUTED_DAYS, retorna vazio (para de avisar).
 */
export function planNotifications(state: AppState, now = new Date()): PlannedNotification[] {
  const nowMs = now.getTime();
  const lastSeen = parseTime(state.lastSeen, nowMs);
  const mutedAt = lastSeen + MUTED_DAYS * 24 * 60 * 60 * 1000;
  if (nowMs >= mutedAt) return [];

  const planned: PlannedNotification[] = [];

  const drink = latestDrink(state.records);
  if (drink > 0) {
    const idleAt = drink + IDLE_HOURS * 60 * 60 * 1000;
    const criticalAt = drink + CRITICAL_HOURS * 60 * 60 * 1000;
    const sinceLabel = timeFormat(new Date(drink).toISOString());

    if (criticalAt <= nowMs) {
      planned.push({
        id: 'critical',
        at: new Date(nowMs + 15 * 1000),
        title: 'Caramba! 😳',
        body: `Faz ${CRITICAL_HOURS} horas desde o último gole (${sinceLabel}). Tá tudo bem?`,
      });
    } else if (idleAt <= nowMs) {
      planned.push({
        id: 'idle',
        at: new Date(nowMs + 15 * 1000),
        title: `Faz ${IDLE_HOURS} horas 💧`,
        body: `Último gole às ${sinceLabel}. Bora reaprontar?`,
      });
      planned.push({
        id: 'critical',
        at: new Date(criticalAt),
        title: 'Caramba! 😳',
        body: `Faz ${CRITICAL_HOURS} horas desde o último gole. Seu corpo tá pedindo água.`,
      });
    } else {
      planned.push({
        id: 'idle',
        at: new Date(idleAt),
        title: `Faz ${IDLE_HOURS} horas 💧`,
        body: `Último gole às ${sinceLabel}. Bora reaprontar?`,
      });
      planned.push({
        id: 'critical',
        at: new Date(criticalAt),
        title: 'Caramba! 😳',
        body: `Faz ${CRITICAL_HOURS} horas desde o último gole. Seu corpo tá pedindo água.`,
      });
    }
  }

  const habit = nextHabitMoment(state.records, typicalHours(state.records, now), now);
  if (habit) {
    planned.push({
      id: 'habit',
      at: habit.at,
      title: 'Hora do copo de sempre',
      body: `Geralmente você bebe água por volta das ${String(habit.hour).padStart(2, '0')}h. Bora manter o hábito?`,
    });
  }

  planned.push({
    id: 'muted',
    at: new Date(mutedAt),
    title: 'Vamos dar uma pausa?',
    body: `Você está ${MUTED_DAYS} dias sem abrir o BEBA+. A gente para de avisar até você voltar.`,
  });

  // Remove notificações muito próximas entre si (mantém a mais cedo).
  planned.sort((a, b) => a.at.getTime() - b.at.getTime());
  const kept: PlannedNotification[] = [];
  planned.forEach((item) => {
    const previous = kept[kept.length - 1];
    if (previous && item.at.getTime() - previous.at.getTime() < MIN_GAP_MS) return;
    kept.push(item);
  });
  return kept;
}

/** Reagenda tudo a partir do estado atual. Chamar sempre que o estado mudar. */
export async function syncNotifications(state: AppState): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const permission = await Notifications.getPermissionsAsync();
    if (!permission.granted) return;

    const planned = planNotifications(state);
    for (const item of planned) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: item.title,
          body: item.body,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: item.at,
          channelId: 'lembretes',
        },
      });
    }
  } catch (error) {
    console.warn('Não foi possível agendar as notificações.', error);
  }
}
