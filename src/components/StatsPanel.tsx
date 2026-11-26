import {
  PERSONAL_ENDING_TITLES,
  PERSONAL_STAT_KEYS,
  STAT_LABELS,
  STAT_LIMITS,
} from '../constants/defaultConfig';
import { isMonetizationUnlocked } from '../utils/gameEngine';
import type {
  BalancingConfig,
  CycleNumber,
  GameState,
  StatKey,
} from '../types/game';

interface StatsPanelProps {
  gameState: GameState;
  config: BalancingConfig;
}

const MAIN_STATS: StatKey[] = ['follower', 'energy', 'motivation', 'money'];

function formatValue(value: number): string {
  return Number(value.toFixed(2)).toLocaleString('id-ID');
}

export function StatsPanel({ gameState, config }: StatsPanelProps) {
  const cycle = Math.min(gameState.currentCycle, 8) as CycleNumber;
  const multiplier = config.cycleMultipliers[cycle] ?? 1;
  const unlocked = isMonetizationUnlocked(gameState, config);
  const lockedEndingStat = gameState.lockedEndingStat;

  const renderStat = (stat: StatKey) => {
    const isPersonal = PERSONAL_STAT_KEYS.some((key) => key === stat);
    const showCap = stat !== 'follower' && stat !== 'money';

    const display =
      isPersonal && lockedEndingStat != null ? (
        lockedEndingStat === stat ? (
          <strong>100</strong>
        ) : (
          'Locked'
        )
      ) : (
        <>
          {formatValue(gameState[stat])}
          {showCap ? ` / ${STAT_LIMITS[stat].max.toLocaleString('id-ID')}` : ''}
        </>
      );

    return (
      <div className="wire-row" key={stat}>
        <span>{STAT_LABELS[stat]}</span>
        <span>{display}</span>
      </div>
    );
  };

  return (
    <section className="wire-box stats-panel">
      <span className="wire-box-title">Status Variabel Global</span>

      <h3 className="section-label">Main Stat</h3>
      <div>{MAIN_STATS.map(renderStat)}</div>

      <h3 className="section-label">Personal Stat</h3>
      <div>{PERSONAL_STAT_KEYS.map(renderStat)}</div>

      <h3 className="section-label">Indikator</h3>
      <div className="wire-row">
        <span>
          Status Monetisasi (Syarat:{' '}
          {config.monetizationThreshold.toLocaleString('id-ID')} follower)
        </span>
        <span>{unlocked ? 'Unlocked' : 'Locked'}</span>
      </div>
      <div className="wire-row">
        <span>Pengali Follower Cycle aktif</span>
        <span>x{formatValue(multiplier)}</span>
      </div>
      <div className="wire-row">
        <span>Hasil Archetype Hiyori</span>
        <span>
          {lockedEndingStat == null
            ? '-'
            : `Archetype Hiyori: ${PERSONAL_ENDING_TITLES[lockedEndingStat]}`}
        </span>
      </div>
    </section>
  );
}
