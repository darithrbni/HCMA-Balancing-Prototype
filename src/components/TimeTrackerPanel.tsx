import type { GameState } from '../types/game';

interface TimeTrackerPanelProps {
  gameState: GameState;
}

export function TimeTrackerPanel({ gameState }: TimeTrackerPanelProps) {
  const cycleDisplay = Math.min(gameState.currentCycle, 8);

  return (
    <div className="schedule-history">
      <div className="time-header">
        <span>
          {`Cycle (Month) ${cycleDisplay}/8 | Phase (Week) ${gameState.currentPhase}/4 | Day ${gameState.currentDay}/7`}
        </span>
      </div>

      <section className="wire-box time-tracker">
        <span className="wire-box-title">Riwayat Jadwal Pekan Ini</span>

        <div className="day-grid">
          {Array.from({ length: 7 }, (_, index) => {
            const slot = gameState.weekSlots[index] ?? null;
            const isActive =
              index === gameState.currentDay - 1 && !gameState.isFinished;
            const className = [
              'day-slot',
              isActive ? 'active' : '',
              slot ? 'done' : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <div className={className} key={index}>
                {slot ? (
                  <>
                    <div className="slot-code">{slot.code}</div>
                    <div className="slot-label">{slot.label}</div>
                  </>
                ) : (
                  <div className="slot-label">Day {index + 1}</div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
