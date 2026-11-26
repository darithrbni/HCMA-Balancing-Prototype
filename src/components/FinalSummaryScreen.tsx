import { STAT_KEYS, STAT_LABELS } from '../constants/defaultConfig';
import { playClickSfx } from '../utils/audio';
import type { BalancingConfig, GameState } from '../types/game';

interface FinalSummaryScreenProps {
  gameState: GameState;
  config: BalancingConfig;
  onOpenConfig: () => void;
  onReset: () => void;
}

export function FinalSummaryScreen({
  gameState,
  config,
  onOpenConfig,
  onReset,
}: FinalSummaryScreenProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-box final-box" role="dialog" aria-modal="true">
        <span className="wire-box-title">Simulasi 8 Cycle Selesai</span>
        <p className="section-label">Statistik Akhir</p>
        <div className="final-stats">
          {STAT_KEYS.map((stat) => (
            <div className="wire-row" key={stat}>
              <span>{STAT_LABELS[stat]}</span>
              <span>{Number(gameState[stat].toFixed(2)).toLocaleString('id-ID')}</span>
            </div>
          ))}
        </div>
        <p className="message-line">
          Threshold monetisasi: {config.monetizationThreshold.toLocaleString('id-ID')}
        </p>
        <div className="config-footer">
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
            onClick={() => {
              playClickSfx();
              onReset();
            }}
          >
            [Reset Simulasi]
          </button>
        </div>
      </div>
    </div>
  );
}
