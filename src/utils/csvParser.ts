import {
  ACTIVITY_KEYS_CSV_ORDER,
  ACTIVITY_META,
  CYCLE_NUMBERS,
  DEFAULT_CONFIG,
  GLOBAL_LABELS,
  cloneConfig,
} from '../constants/defaultConfig';
import type { ActivityKey, BalancingConfig, CycleNumber } from '../types/game';

export const CSV_HEADER =
  'category,key,label,follower,energy,motivation,money,communication,gaming_skill,artistry,musical,value';

export interface ParseCsvResult {
  config: BalancingConfig;
  errors: string[];
}

export function parseCsvNumber(raw: string | undefined): number {
  if (raw === undefined) return 0;
  const cleaned = raw.trim().replace(/^\+/, '');
  if (cleaned === '') return 0;
  const value = Number.parseFloat(cleaned);
  return Number.isFinite(value) ? value : 0;
}

function isActivityKey(value: string): value is ActivityKey {
  return ACTIVITY_KEYS_CSV_ORDER.some((key) => key === value);
}

export function parseCSV(
  text: string,
  base: BalancingConfig = DEFAULT_CONFIG,
): ParseCsvResult {
  const config = cloneConfig(base);
  const errors: string[] = [];
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  let headerMap: Record<string, number> | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line === '') continue;

    const cells = line.split(',').map((cell) => cell.trim());

    if (headerMap === null && cells[0] === 'category' && cells[1] === 'key') {
      headerMap = {};
      cells.forEach((header, index) => {
        headerMap![header] = index;
      });
      continue;
    }

    if (cells.length < 12) {
      errors.push(`Baris dilewati (kolom kurang dari 12): ${line}`);
      continue;
    }

    const column = (name: string, fallback: number): number =>
      headerMap && headerMap[name] !== undefined ? headerMap[name] : fallback;
    const numberAt = (name: string, fallback: number): number =>
      parseCsvNumber(cells[column(name, fallback)]);

    const key = cells[column('key', 1)];

    if (isActivityKey(key)) {
      const delta = config.activities[key];
      delta.follower = numberAt('follower', 3);
      delta.energy = numberAt('energy', 4);
      delta.motivation = numberAt('motivation', 5);
      delta.money = numberAt('money', 6);
      delta.communication = numberAt('communication', 7);
      delta.gamingSkill = numberAt('gaming_skill', 8);
      delta.artistry = numberAt('artistry', 9);
      delta.musical = numberAt('musical', 10);
      continue;
    }

    if (key === 'monetization_threshold') {
      config.monetizationThreshold = Math.max(0, numberAt('value', 11));
      continue;
    }

    if (key === 'money_multiplier') {
      config.moneyMultiplier = Math.max(0, numberAt('value', 11));
      continue;
    }

    const cycleMatch = /^cycle_([1-8])$/.exec(key);
    if (cycleMatch) {
      const cycle = Number(cycleMatch[1]) as CycleNumber;
      config.cycleMultipliers[cycle] = Math.max(0, numberAt('value', 11));
      continue;
    }

    errors.push(`Key tidak dikenal, baris dilewati: ${key || '(kosong)'}`);
  }

  return { config, errors };
}

export function serializeConfigToCSV(config: BalancingConfig): string {
  const rows: string[] = [CSV_HEADER];

  for (const key of ACTIVITY_KEYS_CSV_ORDER) {
    const delta = config.activities[key];
    rows.push(
      [
        'activity',
        key,
        ACTIVITY_META[key].label,
        delta.follower,
        delta.energy,
        delta.motivation,
        delta.money,
        delta.communication,
        delta.gamingSkill,
        delta.artistry,
        delta.musical,
        0,
      ].join(','),
    );
  }

  rows.push(
    [
      'global_rule',
      'monetization_threshold',
      GLOBAL_LABELS.monetizationThreshold,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      config.monetizationThreshold,
    ].join(','),
  );

  rows.push(
    [
      'global_rule',
      'money_multiplier',
      GLOBAL_LABELS.moneyMultiplier,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      config.moneyMultiplier,
    ].join(','),
  );

  for (const cycle of CYCLE_NUMBERS) {
    rows.push(
      [
        'cycle_multiplier',
        `cycle_${cycle}`,
        `Pengali Follower Cycle ${cycle}`,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        config.cycleMultipliers[cycle],
      ].join(','),
    );
  }

  return rows.join('\n');
}

export function downloadCsvTemplate(
  csvText: string,
  filename = 'hiyori-balancing-config.csv',
): void {
  try {
    const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  } catch {
    return;
  }
}
