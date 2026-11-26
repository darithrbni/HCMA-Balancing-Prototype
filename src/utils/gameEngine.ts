import {
  ACTIVITY_META,
  PERSONAL_STAT_KEYS,
  STAT_KEYS,
  STAT_LABELS,
  STAT_LIMITS,
  emptyWeeklyDeltas,
} from '../constants/defaultConfig';
import type {
  ActivityCutscene,
  ActivityKey,
  BalancingConfig,
  Cutscene,
  CycleNumber,
  DayNumber,
  GameState,
  PersonalStatKey,
  PhaseNumber,
  StatKey,
  WeekSlot,
  WeeklyReviewCutscene,
} from '../types/game';

export interface ActivityExecutionResult {
  nextState: GameState;
  cutscenes: Cutscene[];
}

let cutsceneCounter = 0;

function nextCutsceneId(): string {
  cutsceneCounter += 1;
  return `cutscene-${cutsceneCounter}`;
}

function clamp(value: number, min: number, max: number): number {
  const safe = Number.isFinite(value) ? value : 0;
  return Math.min(max, Math.max(min, safe));
}

function clampStat(stat: StatKey, value: number): number {
  const { min, max } = STAT_LIMITS[stat];
  return clamp(value, min, max);
}

function rounded(value: number): number {
  return Math.round(value * 1e6) / 1e6;
}

function emptyStatDeltas(): Record<StatKey, number> {
  return {
    follower: 0,
    energy: 0,
    motivation: 0,
    money: 0,
    communication: 0,
    gamingSkill: 0,
    artistry: 0,
    musical: 0,
  };
}

function isStreamingActivity(activityKey: ActivityKey): boolean {
  return activityKey.startsWith('stream_');
}

export function getActivityBlockers(
  activityKey: ActivityKey,
  gameState: GameState,
  config: BalancingConfig,
): StatKey[] {
  const delta = config.activities[activityKey];
  if (!delta) return [];

  const blockers: StatKey[] = [];

  for (const stat of STAT_KEYS) {
    const value = delta[stat] ?? 0;
    if (value < 0 && gameState[stat] + value < 0) {
      blockers.push(stat);
    }
  }

  if (isStreamingActivity(activityKey) && gameState.motivation <= 0) {
    if (!blockers.includes('motivation')) blockers.push('motivation');
  }

  if (activityKey === 'sm_post') {
    const motivationMagnitude = Math.abs(delta.motivation ?? 0);
    if (
      gameState.motivation - motivationMagnitude < 0 &&
      !blockers.includes('motivation')
    ) {
      blockers.push('motivation');
    }
  }

  return blockers;
}

export function formatBlockerLabel(blockers: StatKey[]): string {
  if (blockers.length === 0) return '';

  const labels = blockers
    .map((stat) => STAT_LABELS[stat].toUpperCase())
    .join(', ');
  return `${labels} KURANG!`;
}

export function getActivityBlockerLabel(
  activityKey: ActivityKey,
  gameState: GameState,
  config: BalancingConfig,
): string {
  return formatBlockerLabel(
    getActivityBlockers(activityKey, gameState, config),
  );
}

function resolveEndingLock(
  gameState: GameState,
  nextState: GameState,
  rng: () => number,
): void {
  if (gameState.lockedEndingStat != null) return;

  const reached = PERSONAL_STAT_KEYS.filter((stat) => nextState[stat] >= 100);
  if (reached.length === 0) return;

  let chosen: PersonalStatKey = reached[0];
  if (reached.length > 1) {
    const index = Math.min(
      reached.length - 1,
      Math.max(0, Math.floor(rng() * reached.length)),
    );
    chosen = reached[index];
  }

  nextState.lockedEndingStat = chosen;
}

export function isMonetizationUnlocked(
  gameState: GameState,
  config: BalancingConfig,
): boolean {
  return gameState.follower >= config.monetizationThreshold;
}

export function canExecuteActivity(
  activityKey: ActivityKey,
  gameState: GameState,
  config: BalancingConfig,
): boolean {
  if (gameState.isFinished) return false;
  if (!config.activities[activityKey]) return false;

  return getActivityBlockers(activityKey, gameState, config).length === 0;
}

export function executeActivity(
  activityKey: ActivityKey,
  gameState: GameState,
  config: BalancingConfig,
  rng: () => number = Math.random,
): ActivityExecutionResult | null {
  if (!canExecuteActivity(activityKey, gameState, config)) return null;

  const delta = config.activities[activityKey];
  const nextState: GameState = {
    ...gameState,
    weekSlots: [...gameState.weekSlots],
    weeklyDeltas: { ...gameState.weeklyDeltas },
  };

  let special: ActivityCutscene['special'];
  let roll: ActivityCutscene['roll'];

  if (isStreamingActivity(activityKey)) {
    const motivationAwal = gameState.motivation;
    const activeCycle = Math.min(gameState.currentCycle, 8) as CycleNumber;
    const cycleMultiplier = config.cycleMultipliers[activeCycle] ?? 1;
    const followerGain =
      Math.floor(motivationAwal * cycleMultiplier) + (delta.follower ?? 0);
    const followerBaru = clampStat('follower', gameState.follower + followerGain);
    const moneyGain =
      followerBaru >= config.monetizationThreshold
        ? Math.floor(followerBaru * config.moneyMultiplier) + (delta.money ?? 0)
        : delta.money ?? 0;

    nextState.motivation = 0;
    nextState.follower = followerBaru;
    nextState.money = clampStat('money', gameState.money + moneyGain);

    for (const stat of STAT_KEYS) {
      if (stat === 'follower' || stat === 'money' || stat === 'motivation') {
        continue;
      }
      nextState[stat] = clampStat(stat, gameState[stat] + (delta[stat] ?? 0));
    }

    special = 'stream';
  } else if (activityKey === 'sm_post') {
    const magnitude = Math.abs(delta.motivation ?? 0);
    const appliedMotivation = rng() < 0.5 ? magnitude : -magnitude;
    roll = appliedMotivation >= 0 ? 'positive' : 'negative';

    for (const stat of STAT_KEYS) {
      const appliedDelta =
        stat === 'motivation' ? appliedMotivation : delta[stat] ?? 0;
      nextState[stat] = clampStat(stat, gameState[stat] + appliedDelta);
    }

    special = 'post';
  } else {
    for (const stat of STAT_KEYS) {
      nextState[stat] = clampStat(stat, gameState[stat] + (delta[stat] ?? 0));
    }
  }

  resolveEndingLock(gameState, nextState, rng);

  const actualDeltas = emptyStatDeltas();
  for (const stat of STAT_KEYS) {
    actualDeltas[stat] = rounded(nextState[stat] - gameState[stat]);
  }

  const meta = ACTIVITY_META[activityKey];
  const slot: WeekSlot = {
    code: meta.code,
    label: meta.shortLabel,
    activityKey,
  };
  const slots: Array<WeekSlot | null> = Array.from(
    { length: 7 },
    (_, index) => nextState.weekSlots[index] ?? null,
  );
  slots[gameState.currentDay - 1] = slot;

  for (const stat of STAT_KEYS) {
    nextState.weeklyDeltas[stat] = rounded(
      gameState.weeklyDeltas[stat] + actualDeltas[stat],
    );
  }

  const activityCutscene: ActivityCutscene = {
    id: nextCutsceneId(),
    kind: 'activity',
    activityLabel: meta.label,
    deltas: actualDeltas,
    ...(special ? { special } : {}),
    ...(roll ? { roll } : {}),
  };
  const cutscenes: Cutscene[] = [activityCutscene];

  if (gameState.currentDay < 7) {
    nextState.currentDay = (gameState.currentDay + 1) as DayNumber;
    nextState.weekSlots = slots;
  } else {
    const reviewCutscene: WeeklyReviewCutscene = {
      id: nextCutsceneId(),
      kind: 'weeklyReview',
      cycle: gameState.currentCycle,
      phase: gameState.currentPhase,
      slots,
      weeklyDeltas: { ...nextState.weeklyDeltas },
      energyRestored: true,
    };
    cutscenes.push(reviewCutscene);

    if (gameState.currentPhase === 4) {
      cutscenes.push({
        id: nextCutsceneId(),
        kind: 'narrative',
        narrativeNumber: gameState.currentCycle,
      });
    }

    nextState.energy = 100;
    nextState.currentDay = 1;
    nextState.weekSlots = Array.from({ length: 7 }, () => null);
    nextState.weeklyDeltas = emptyWeeklyDeltas();

    if (gameState.currentPhase < 4) {
      nextState.currentPhase = (gameState.currentPhase + 1) as PhaseNumber;
    } else {
      const nextCycle = gameState.currentCycle + 1;
      nextState.currentCycle = nextCycle;
      nextState.currentPhase = 1;
      nextState.isFinished = nextCycle > 8;
    }
  }

  return { nextState, cutscenes };
}
