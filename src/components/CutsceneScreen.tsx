import { useCallback, useEffect, useRef, useState } from 'react';
import { STAT_KEYS, STAT_LABELS } from '../constants/defaultConfig';
import { playClickSfx } from '../utils/audio';
import { StatDeltaLabel } from './StatDeltaLabel';
import type { Cutscene } from '../types/game';

interface CutsceneScreenProps {
  cutscene: Cutscene;
  onSkip: () => void;
}

export function CutsceneScreen({ cutscene, onSkip }: CutsceneScreenProps) {
  const doneRef = useRef(false);
  const [secondsLeft, setSecondsLeft] = useState(3);
  const isReview = cutscene.kind === 'weeklyReview';

  const complete = useCallback(
    (withSfx: boolean) => {
      if (doneRef.current) return;
      doneRef.current = true;
      if (withSfx) playClickSfx();
      onSkip();
    },
    [onSkip],
  );

  useEffect(() => {
    doneRef.current = false;
    if (isReview) return;

    setSecondsLeft(3);
    const interval = window.setInterval(() => {
      setSecondsLeft((previous) => Math.max(0, previous - 1));
    }, 1000);
    const timer = window.setTimeout(() => complete(false), 3000);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timer);
    };
  }, [cutscene.id, complete, isReview]);

  return (
    <div
      className="cutscene-root"
      role="button"
      tabIndex={0}
      onClick={() => complete(true)}
    >
      <div
        className={`cutscene-content${isReview ? ' review' : ''}`}
        key={cutscene.id}
      >
        {cutscene.kind === 'activity' && (
          <>
            <p className="cutscene-title">
              Aktivitas {cutscene.activityLabel} sedang berlangsung...
            </p>
            <StatDeltaLabel
              delta={cutscene.deltas}
              special={cutscene.special === 'stream' ? 'stream' : undefined}
            />
            {cutscene.roll && (
              <p className="cutscene-note">
                Social Media - Post: motivasi {cutscene.roll === 'positive' ? '+' : '-'} terpilih
              </p>
            )}
          </>
        )}

        {cutscene.kind === 'weeklyReview' && (
          <>
            <p className="cutscene-title">
              Review Hasil 1 Minggu (Cycle {cutscene.cycle} - Phase {cutscene.phase})
            </p>
            <div className="cutscene-list">
              {cutscene.slots.map((slot, index) => (
                <div className="wire-row" key={index}>
                  <span>Day {index + 1}</span>
                  <span>{slot ? `${slot.code} - ${slot.label}` : '-'}</span>
                </div>
              ))}
            </div>
            <div className="cutscene-list">
              {STAT_KEYS.map((stat) => (
                <div className="wire-row" key={stat}>
                  <span>{STAT_LABELS[stat]}</span>
                  <span>
                    {cutscene.weeklyDeltas[stat] > 0 ? '+' : ''}
                    {cutscene.weeklyDeltas[stat]}
                  </span>
                </div>
              ))}
            </div>
            <p className="cutscene-note">Energy telah dipulihkan ke 100.</p>
          </>
        )}

        {cutscene.kind === 'narrative' && (
          <p className="cutscene-title">Narrative #{cutscene.narrativeNumber}</p>
        )}

        {isReview ? (
          <p className="cutscene-hint">
            Klik / ketuk di mana saja untuk melanjutkan review.
          </p>
        ) : (
          <p className="cutscene-hint">
            {secondsLeft > 0
              ? `Otomatis lanjut dalam ${secondsLeft} detik (Klik / ketuk di mana saja untuk skip)`
              : 'Otomatis lanjut... (Klik / ketuk di mana saja untuk skip)'}
          </p>
        )}
      </div>
    </div>
  );
}
