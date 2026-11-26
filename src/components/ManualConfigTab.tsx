import {
  ACTIVITY_KEYS_CSV_ORDER,
  ACTIVITY_META,
  CYCLE_NUMBERS,
  STAT_KEYS,
  STAT_LABELS,
} from '../constants/defaultConfig';
import { parseCsvNumber } from '../utils/csvParser';
import type {
  ActivityDelta,
  ActivityKey,
  BalancingConfig,
  CycleNumber,
} from '../types/game';

interface ManualConfigTabProps {
  draft: BalancingConfig;
  onChangeActivity: (
    key: ActivityKey,
    field: keyof ActivityDelta,
    value: number,
  ) => void;
  onChangeGlobal: (
    field: 'monetizationThreshold' | 'moneyMultiplier',
    value: number,
  ) => void;
  onChangeCycle: (cycle: CycleNumber, value: number) => void;
}

export function ManualConfigTab({
  draft,
  onChangeActivity,
  onChangeGlobal,
  onChangeCycle,
}: ManualConfigTabProps) {
  return (
    <div>
      <div className="table-scroll">
        <table className="wire-table">
          <thead>
            <tr>
              <th>Aktivitas</th>
              {STAT_KEYS.map((stat) => (
                <th key={stat}>{STAT_LABELS[stat]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ACTIVITY_KEYS_CSV_ORDER.map((key) => {
              const delta = draft.activities[key];

              return (
                <tr key={key}>
                  <td>{ACTIVITY_META[key].label}</td>
                  {STAT_KEYS.map((stat) => (
                    <td key={stat}>
                      <input
                        type="number"
                        step="any"
                        aria-label={`${ACTIVITY_META[key].label} ${STAT_LABELS[stat]}`}
                        value={delta[stat]}
                        onChange={(event) =>
                          onChangeActivity(
                            key,
                            stat,
                            parseCsvNumber(event.target.value),
                          )
                        }
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h3 className="section-label">Global Rule</h3>
      <div className="config-grid two-columns">
        <label className="wire-field">
          Syarat Follower untuk Monetisasi
          <input
            type="number"
            step="any"
            value={draft.monetizationThreshold}
            onChange={(event) =>
              onChangeGlobal(
                'monetizationThreshold',
                parseCsvNumber(event.target.value),
              )
            }
          />
        </label>
        <label className="wire-field">
          Pengali Money dari Monetisasi
          <input
            type="number"
            step="any"
            value={draft.moneyMultiplier}
            onChange={(event) =>
              onChangeGlobal('moneyMultiplier', parseCsvNumber(event.target.value))
            }
          />
        </label>
      </div>

      <h3 className="section-label">Cycle Multipliers</h3>
      <div className="config-grid cycle-columns">
        {CYCLE_NUMBERS.map((cycle) => (
          <label className="wire-field" key={cycle}>
            Cycle {cycle}
            <input
              type="number"
              step="any"
              value={draft.cycleMultipliers[cycle]}
              onChange={(event) =>
                onChangeCycle(cycle, parseCsvNumber(event.target.value))
              }
            />
          </label>
        ))}
      </div>
    </div>
  );
}
