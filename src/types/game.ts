export type StatKey =
  | 'follower'
  | 'energy'
  | 'motivation'
  | 'money'
  | 'communication'
  | 'gamingSkill'
  | 'artistry'
  | 'musical';

export type ActivityKey =
  | 'stream_chill_talk'
  | 'stream_playing_game'
  | 'stream_drawing'
  | 'stream_singing'
  | 'ent_chit_chat'
  | 'ent_gaming'
  | 'prac_vocal'
  | 'prac_sketching'
  | 'stroll'
  | 'sm_post'
  | 'sm_read_comment'
  | 'sm_doomscroll'
  | 'rest'
  | 'part_time';

export type CategoryKey =
  | 'streaming'
  | 'entertainment'
  | 'practice'
  | 'stroll'
  | 'social_media'
  | 'rest'
  | 'part_time';

export type PersonalStatKey =
  | 'communication'
  | 'gamingSkill'
  | 'artistry'
  | 'musical';

export type CycleNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type PhaseNumber = 1 | 2 | 3 | 4;
export type DayNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type ActivityCode = 'S' | 'E' | 'P' | 'TS' | 'SM' | 'R' | 'PT';

export interface ActivityDelta {
  follower: number;
  energy: number;
  motivation: number;
  money: number;
  communication: number;
  gamingSkill: number;
  artistry: number;
  musical: number;
}

export interface BalancingConfig {
  activities: Record<ActivityKey, ActivityDelta>;
  monetizationThreshold: number;
  moneyMultiplier: number;
  cycleMultipliers: Record<CycleNumber, number>;
}

export interface WeekSlot {
  code: ActivityCode;
  label: string;
  activityKey: ActivityKey;
}

export interface GameState {
  follower: number;
  energy: number;
  motivation: number;
  money: number;
  communication: number;
  gamingSkill: number;
  artistry: number;
  musical: number;
  currentCycle: number;
  currentPhase: PhaseNumber;
  currentDay: DayNumber;
  weekSlots: Array<WeekSlot | null>;
  weeklyDeltas: Record<StatKey, number>;
  lockedEndingStat: PersonalStatKey | null;
  isFinished: boolean;
}

export type CutsceneKind = 'activity' | 'weeklyReview' | 'narrative';

export interface CutsceneBase {
  id: string;
  kind: CutsceneKind;
}

export interface ActivityCutscene extends CutsceneBase {
  kind: 'activity';
  activityLabel: string;
  deltas: Record<StatKey, number>;
  special?: 'stream' | 'post';
  roll?: 'positive' | 'negative';
}

export interface WeeklyReviewCutscene extends CutsceneBase {
  kind: 'weeklyReview';
  cycle: number;
  phase: PhaseNumber;
  slots: Array<WeekSlot | null>;
  weeklyDeltas: Record<StatKey, number>;
  energyRestored: true;
}

export interface NarrativeCutscene extends CutsceneBase {
  kind: 'narrative';
  narrativeNumber: number;
}

export type Cutscene = ActivityCutscene | WeeklyReviewCutscene | NarrativeCutscene;

export interface ActivityMeta {
  key: ActivityKey;
  category: CategoryKey;
  label: string;
  shortLabel: string;
  code: ActivityCode;
}

export interface CategoryMeta {
  key: CategoryKey;
  label: string;
  code: ActivityCode;
  activityKeys: ActivityKey[];
}

export type ConfigTab = 'manual' | 'upload' | 'csv' | 'preset';
