import { ACTIVITY_META, CATEGORY_META, CATEGORY_ORDER } from '../constants/defaultConfig';
import {
  canExecuteActivity,
  formatBlockerLabel,
  getActivityBlockers,
} from '../utils/gameEngine';
import { playClickSfx } from '../utils/audio';
import { StatDeltaLabel } from './StatDeltaLabel';
import type {
  ActivityKey,
  BalancingConfig,
  CategoryKey,
  GameState,
} from '../types/game';

interface ActivityPanelProps {
  gameState: GameState;
  config: BalancingConfig;
  locked: boolean;
  onCategoryClick: (category: CategoryKey) => void;
  onActivityClick: (activityKey: ActivityKey) => void;
  onOpenConfig: () => void;
  onReset: () => void;
}

export function ActivityPanel({
  gameState,
  config,
  locked,
  onCategoryClick,
  onActivityClick,
  onOpenConfig,
  onReset,
}: ActivityPanelProps) {
  return (
    <section className="wire-box activity-panel">
      <div className="panel-header">
        <span className="wire-box-title">Panel Aktivitas</span>
        <div className="header-actions">
          <button
            type="button"
            className="wire-button compact"
            onClick={() => {
              playClickSfx();
              onOpenConfig();
            }}
          >
            [Buka Config]
          </button>
          <button
            type="button"
            className="wire-button compact"
            disabled={locked}
            onClick={() => {
              playClickSfx();
              onReset();
            }}
          >
            [Reset Simulasi]
          </button>
        </div>
      </div>

      <div className="activity-list">
        {CATEGORY_ORDER.map((category) => {
          const meta = CATEGORY_META[category];
          const keys = meta.activityKeys;
          const isMulti = keys.length > 1;
          const enabled = keys.some((key) =>
            canExecuteActivity(key, gameState, config),
          );
          const disabled = locked || !enabled;
          const fixedKey = keys[0];
          const blockers = Array.from(
            new Set(
              keys.flatMap((key) =>
                getActivityBlockers(key, gameState, config),
              ),
            ),
          );
          const statusLabel = disabled ? formatBlockerLabel(blockers) : '';

          return (
            <button
              key={category}
              type="button"
              className="wire-button activity-button"
              disabled={disabled}
              onClick={() => {
                playClickSfx();
                if (isMulti) {
                  onCategoryClick(category);
                } else {
                  onActivityClick(fixedKey);
                }
              }}
            >
              <span className="activity-title">{meta.label}</span>
              {statusLabel && (
                <span className="validation-label locked">{statusLabel}</span>
              )}
              {isMulti ? (
                <span className="delta-label">
                  Sub-aktivitas:{' '}
                  {keys.map((key) => ACTIVITY_META[key].shortLabel).join(', ')}
                </span>
              ) : (
                <StatDeltaLabel
                  delta={config.activities[fixedKey]}
                  special={
                    fixedKey.startsWith('stream_')
                      ? 'stream'
                      : fixedKey === 'sm_post'
                        ? 'post'
                        : undefined
                  }
                />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
