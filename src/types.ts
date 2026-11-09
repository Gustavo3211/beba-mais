export type WaterRecord = {
  id: string;
  date: string;
  amount: number;
  timestamp: string;
};

export type Settings = {
  goal: number;
  defaultCup: number;
};

export type Device = {
  code: string;
  addedAt: string;
};

export type AppState = {
  records: WaterRecord[];
  settings: Settings;
  devices: Device[];
};
