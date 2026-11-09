import { useCallback, useEffect, useRef, useState } from 'react';

import { dateKey, dayRecords } from './logic';
import { loadState, saveState } from './storage';
import { AppState, Settings, WaterRecord } from './types';

export function useWaterStore() {
  const [state, setState] = useState<AppState | null>(null);
  const stateRef = useRef<AppState | null>(null);

  useEffect(() => {
    let active = true;
    loadState().then((loaded) => {
      if (!active) return;
      stateRef.current = loaded;
      setState(loaded);
    });
    return () => {
      active = false;
    };
  }, []);

  const commit = useCallback((next: AppState) => {
    stateRef.current = next;
    setState(next);
    saveState(next).catch((error) => {
      console.warn('Não foi possível salvar os dados.', error);
    });
  }, []);

  const addWater = useCallback(
    (amount: number) => {
      const current = stateRef.current;
      if (!current) return;
      const value = Number(amount);
      if (!Number.isFinite(value) || value <= 0) return;
      const now = new Date();
      const record: WaterRecord = {
        id: `r-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
        date: dateKey(now),
        amount: value,
        timestamp: now.toISOString(),
      };
      commit({ ...current, records: [...current.records, record] });
    },
    [commit]
  );

  const undoLast = useCallback(() => {
    const current = stateRef.current;
    if (!current) return;
    const last = dayRecords(current.records, dateKey(new Date()))[0];
    if (!last) return;
    commit({ ...current, records: current.records.filter((record) => record.id !== last.id) });
  }, [commit]);

  const updateSettings = useCallback(
    (settings: Settings) => {
      const current = stateRef.current;
      if (!current) return;
      commit({ ...current, settings });
    },
    [commit]
  );

  const addDevice = useCallback(
    (code: string): boolean => {
      const current = stateRef.current;
      if (!current) return false;
      const trimmed = code.trim();
      if (trimmed.length < 3) return false;
      if (current.devices.some((device) => device.code === trimmed)) return true;
      commit({
        ...current,
        devices: [...current.devices, { code: trimmed, addedAt: new Date().toISOString() }],
      });
      return true;
    },
    [commit]
  );

  /** Marca que o app foi aberto agora (usado pelas notificações). Sem loop se já for recente. */
  const touch = useCallback(() => {
    const current = stateRef.current;
    if (!current) return;
    const last = Date.parse(current.lastSeen);
    if (Number.isFinite(last) && Date.now() - last < 5 * 60 * 1000) return;
    commit({ ...current, lastSeen: new Date().toISOString() });
  }, [commit]);

  return { state, addWater, undoLast, updateSettings, addDevice, touch };
}
