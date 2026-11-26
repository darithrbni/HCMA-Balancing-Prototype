import {
  ACTIVITY_META,
  CATEGORY_META,
  STAT_KEYS,
  STAT_LABELS,
} from '../constants/defaultConfig';
import {
  canExecuteActivity,
  getActivityBlockerLabel,
  isMonetizationUnlocked,
} from '../utils/gameEngine';
import { playClickSfx } from '../utils/audio';
import { StatDeltaLabel } from './StatDeltaLabel';
import type {
  ActivityDelta,
  ActivityKey,
  BalancingConfig,
  CategoryKey,
  GameState,
} from '../types/game';

interface SubActivityModalProps {
  category: CategoryKey;
  gameState: GameState;
  config: BalancingConfig;
  onSelect: (activityKey: ActivityKey) => void;
  onCancel: () => void;
}

function normalize(value: number): number {
  return Number(value.toFixed(2));
}

function formatSigned(value: number): string {
  const clean = normalize(value);
  if (clean === 0) return '0';
  return `${clean > 0 ? '+' : ''}${clean}`;
}

function formatConcise(value: number, prefix: string, positive: boolean): string {
  const clean = normalize(value);
  if (clean === 0) return prefix;
  if (positive && clean > 0) return `${prefix} (+${clean})`;
  return `${prefix} (${clean})`;
}

function streamDeltaSummary(
  delta: ActivityDelta,
  monetizationUnlocked: boolean,
): string {
  const parts = [
    formatConcise(delta.follower ?? 0, '++Follower', true),
  ];

  if (monetizationUnlocked) {
    parts.push(formatConcise(delta.money ?? 0, '+Money', true));
  }

  for (const stat of STAT_KEYS) {
    if (stat === 'follower' || stat === 'money' || stat === 'motivation') {
      continue;
    }
    const value = delta[stat] ?? 0;
    if (normalize(value) !== 0) {
      parts.push(`${formatSigned(value)} ${STAT_LABELS[stat]}`);
    }
  }

  return parts.join(', ');
}

export function SubActivityModal({
  category,
  gameState,
  config,
  onSelect,
  onCancel,
}: SubActivityModalProps) {
  const meta = CATEGORY_META[category];
  const monetizationUnlocked = isMonetizationUnlocked(gameState, config);

  return (
    <div className="modal-overlay">
      <div className="modal-box sub-activity-box" role="dialog" aria-modal="true">
        <div className="panel-header">
          <span className="wire-box-title">Pilih Sub-Aktivitas - {meta.label}</span>
          <button
            type="button"
            className="wire-button compact"
            onClick={() => {
              playClickSfx();
              onCancel();
            }}
          >
            [Batal]
          </button>
        </div>

        <div className="sub-activity-list">
          {meta.activityKeys.map((key) => {
            const enabled = canExecuteActivity(key, gameState, config);
            const statusLabel = enabled
              ? ''
              : getActivityBlockerLabel(key, gameState, config);
            const isStream = key.startsWith('stream_');
            const isPost = key === 'sm_post';

            return (
              <button
                key={key}
                type="button"
                className="wire-button sub-activity-button"
                disabled={!enabled}
                onClick={() => {
                  playClickSfx();
                  onSelect(key);
                }}
              >
                <span className="activity-title">{ACTIVITY_META[key].label}</span>
                {statusLabel && (
                  <span className="validation-label locked">{statusLabel}</span>
                )}
                {isStream ? (
                  <span className="delta-label">
                    {streamDeltaSummary(config.activities[key], monetizationUnlocked)}
                  </span>
                ) : (
                  <StatDeltaLabel
                    delta={config.activities[key]}
                    special={isPost ? 'post' : undefined}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
