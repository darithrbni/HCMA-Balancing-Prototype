import { STAT_KEYS, STAT_LABELS } from '../constants/defaultConfig';
import type { ActivityDelta, StatKey } from '../types/game';

interface StatDeltaLabelProps {
  delta: ActivityDelta | Record<StatKey, number>;
  special?: 'stream' | 'post';
}

function normalize(value: number): number {
  return Number(value.toFixed(2));
}

function formatSigned(value: number): string {
  const clean = normalize(value);
  if (clean === 0) return '0';
  return `${clean > 0 ? '+' : ''}${clean}`;
}

export function StatDeltaLabel({ delta, special }: StatDeltaLabelProps) {
  const parts: string[] = [];

  for (const stat of STAT_KEYS) {
    if (special === 'post' && stat === 'motivation') continue;
    const value = delta[stat] ?? 0;
    if (normalize(value) !== 0) {
      parts.push(`${formatSigned(value)} ${STAT_LABELS[stat]}`);
    }
  }

  if (special === 'post') {
    const magnitude = Math.abs(delta.motivation ?? 0);
    if (magnitude > 0) {
      parts.unshift(
        `Motivation ${formatSigned(magnitude)} / ${formatSigned(-magnitude)} (50/50)`,
      );
    }
  }

  if (parts.length === 0) {
    return <span className="delta-label">0</span>;
  }

  return <span className="delta-label">{parts.join(', ')}</span>;
}
