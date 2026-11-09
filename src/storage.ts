import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_SETTINGS, sanitizeState } from './logic';
import { AppState } from './types';

export const STORAGE_KEY = 'beba-plus-state-v2';
const LEGACY_KEY = 'beba-plus-state-v1';

export async function loadState(): Promise<AppState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const saved = sanitizeState(raw ? JSON.parse(raw) : null);
    if (saved) return saved;

    // Preserva apenas registros reais da versão anterior; descarta o histórico fictício.
    const legacyRaw = await AsyncStorage.getItem(LEGACY_KEY);
    const legacy = legacyRaw ? JSON.parse(legacyRaw) : null;
    if (legacy && legacy.demoMode === false) {
      const migrated = sanitizeState(legacy);
      if (migrated) return migrated;
    }
  } catch (error) {
    console.warn('Falha ao ler os dados salvos.', error);
  }
  return { records: [], settings: { ...DEFAULT_SETTINGS }, devices: [] };
}

export async function saveState(state: AppState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
