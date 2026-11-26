import type {
  ActivityDelta,
  ActivityKey,
  ActivityMeta,
  BalancingConfig,
  CategoryKey,
  CategoryMeta,
  CycleNumber,
  GameState,
  PersonalStatKey,
  StatKey,
} from '../types/game';

export const STAT_KEYS: StatKey[] = [
  'follower',
  'energy',
  'motivation',
  'money',
  'communication',
  'gamingSkill',
  'artistry',
  'musical',
];

export const PERSONAL_STAT_KEYS: PersonalStatKey[] = [
  'communication',
  'gamingSkill',
  'artistry',
  'musical',
];

export const PERSONAL_ENDING_TITLES: Record<PersonalStatKey, string> = {
  communication: 'Charismatic Entertainer',
  gamingSkill: 'Proficient Gamer',
  artistry: 'Master Artist',
  musical: 'Virtual Diva',
};

export const STAT_LABELS: Record<StatKey, string> = {
  follower: 'Follower',
  energy: 'Energy',
  motivation: 'Motivation',
  money: 'Money',
  communication: 'Communication',
  gamingSkill: 'Gaming Skill',
  artistry: 'Artistry',
  musical: 'Musical',
};

export const STAT_LIMITS: Record<StatKey, { min: number; max: number }> = {
  follower: { min: 0, max: 9999999 },
  energy: { min: 0, max: 100 },
  motivation: { min: 0, max: 100 },
  money: { min: 0, max: 9999999 },
  communication: { min: 0, max: 100 },
  gamingSkill: { min: 0, max: 100 },
  artistry: { min: 0, max: 100 },
  musical: { min: 0, max: 100 },
};

export const ACTIVITY_META: Record<ActivityKey, ActivityMeta> = {
  stream_chill_talk: {
    key: 'stream_chill_talk',
    category: 'streaming',
    label: 'Streaming - Chill Talk',
    shortLabel: 'Chill Talk',
    code: 'S',
  },
  stream_playing_game: {
    key: 'stream_playing_game',
    category: 'streaming',
    label: 'Streaming - Playing Game',
    shortLabel: 'Playing Game',
    code: 'S',
  },
  stream_drawing: {
    key: 'stream_drawing',
    category: 'streaming',
    label: 'Streaming - Drawing',
    shortLabel: 'Drawing',
    code: 'S',
  },
  stream_singing: {
    key: 'stream_singing',
    category: 'streaming',
    label: 'Streaming - Singing',
    shortLabel: 'Singing',
    code: 'S',
  },
  ent_chit_chat: {
    key: 'ent_chit_chat',
    category: 'entertainment',
    label: 'Entertainment - Chit Chat',
    shortLabel: 'Chit Chat',
    code: 'E',
  },
  ent_gaming: {
    key: 'ent_gaming',
    category: 'entertainment',
    label: 'Entertainment - Gaming',
    shortLabel: 'Gaming',
    code: 'E',
  },
  prac_vocal: {
    key: 'prac_vocal',
    category: 'practice',
    label: 'Practice - Vocal Training',
    shortLabel: 'Vocal Training',
    code: 'P',
  },
  prac_sketching: {
    key: 'prac_sketching',
    category: 'practice',
    label: 'Practice - Sketching',
    shortLabel: 'Sketching',
    code: 'P',
  },
  stroll: {
    key: 'stroll',
    category: 'stroll',
    label: 'Take a Stroll',
    shortLabel: 'Take a Stroll',
    code: 'TS',
  },
  sm_post: {
    key: 'sm_post',
    category: 'social_media',
    label: 'Social Media - Post',
    shortLabel: 'Post',
    code: 'SM',
  },
  sm_read_comment: {
    key: 'sm_read_comment',
    category: 'social_media',
    label: 'Social Media - Read Comment',
    shortLabel: 'Read Comment',
    code: 'SM',
  },
  sm_doomscroll: {
    key: 'sm_doomscroll',
    category: 'social_media',
    label: 'Social Media - Doomscroll',
    shortLabel: 'Doomscroll',
    code: 'SM',
  },
  rest: {
    key: 'rest',
    category: 'rest',
    label: 'Rest & Relax',
    shortLabel: 'Rest & Relax',
    code: 'R',
  },
  part_time: {
    key: 'part_time',
    category: 'part_time',
    label: 'Part-Time Job',
    shortLabel: 'Part-Time Job',
    code: 'PT',
  },
};

export const CATEGORY_META: Record<CategoryKey, CategoryMeta> = {
  streaming: {
    key: 'streaming',
    label: 'Streaming',
    code: 'S',
    activityKeys: [
      'stream_chill_talk',
      'stream_playing_game',
      'stream_drawing',
      'stream_singing',
    ],
  },
  entertainment: {
    key: 'entertainment',
    label: 'Entertainment',
    code: 'E',
    activityKeys: ['ent_chit_chat', 'ent_gaming'],
  },
  practice: {
    key: 'practice',
    label: 'Practice',
    code: 'P',
    activityKeys: ['prac_vocal', 'prac_sketching'],
  },
  stroll: {
    key: 'stroll',
    label: 'Take a Stroll',
    code: 'TS',
    activityKeys: ['stroll'],
  },
  social_media: {
    key: 'social_media',
    label: 'Social Media',
    code: 'SM',
    activityKeys: ['sm_post', 'sm_read_comment', 'sm_doomscroll'],
  },
  rest: {
    key: 'rest',
    label: 'Rest & Relax',
    code: 'R',
    activityKeys: ['rest'],
  },
  part_time: {
    key: 'part_time',
    label: 'Part-Time Job',
    code: 'PT',
    activityKeys: ['part_time'],
  },
};

export const CATEGORY_ORDER: CategoryKey[] = [
  'streaming',
  'entertainment',
  'practice',
  'stroll',
  'social_media',
  'rest',
  'part_time',
];

export const ACTIVITY_KEYS_CSV_ORDER: ActivityKey[] = [
  'stream_chill_talk',
  'stream_playing_game',
  'stream_drawing',
  'stream_singing',
  'ent_chit_chat',
  'ent_gaming',
  'prac_vocal',
  'prac_sketching',
  'stroll',
  'sm_post',
  'sm_read_comment',
  'sm_doomscroll',
  'rest',
  'part_time',
];

export const CYCLE_NUMBERS: CycleNumber[] = [1, 2, 3, 4, 5, 6, 7, 8];

export const GLOBAL_LABELS = {
  monetizationThreshold: 'Syarat Follower untuk Monetisasi',
  moneyMultiplier: 'Pengali Money dari Monetisasi',
} as const;

export function zeroDelta(): ActivityDelta {
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

export function emptyWeeklyDeltas(): Record<StatKey, number> {
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

export function cloneConfig(config: BalancingConfig): BalancingConfig {
  const activities = {} as Record<ActivityKey, ActivityDelta>;
  for (const key of ACTIVITY_KEYS_CSV_ORDER) {
    activities[key] = { ...config.activities[key] };
  }

  return {
    activities,
    monetizationThreshold: config.monetizationThreshold,
    moneyMultiplier: config.moneyMultiplier,
    cycleMultipliers: { ...config.cycleMultipliers },
  };
}

export const DEFAULT_CONFIG: BalancingConfig = {
  activities: Object.fromEntries(
    ACTIVITY_KEYS_CSV_ORDER.map((key) => [key, zeroDelta()]),
  ) as Record<ActivityKey, ActivityDelta>,
  monetizationThreshold: 0,
  moneyMultiplier: 0,
  cycleMultipliers: {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
  },
};

export function createDefaultGameState(): GameState {
  return {
    follower: 0,
    energy: 100,
    motivation: 0,
    money: 0,
    communication: 0,
    gamingSkill: 0,
    artistry: 0,
    musical: 0,
    currentCycle: 1,
    currentPhase: 1,
    currentDay: 1,
    weekSlots: Array.from({ length: 7 }, () => null),
    weeklyDeltas: emptyWeeklyDeltas(),
    lockedEndingStat: null,
    isFinished: false,
  };
}

export const DEFAULT_GAME_STATE: GameState = createDefaultGameState();
