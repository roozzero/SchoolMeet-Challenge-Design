export type ContestStatus = 'active' | 'draft' | 'paused' | 'ended';

export type StageType =
  | 'text'
  | 'image'
  | 'video'
  | 'coding'
  | 'research'
  | 'secret_code'
  | 'hybrid';

export interface StageHint {
  id: string;
  title: string;
  text: string;
  pointDeduction: number;
}

export interface StageMissionContent {
  // متنی
  bodyText: string;
  question: string;
  sampleAnswer: string;
  // تصویری
  puzzleImageUrl: string;
  imageQuestion: string;
  imageCodeClue: string;
  // ویدئویی
  videoClueUrl: string;
  videoTimestamp: string;
  videoClueText: string;
  // کدنویسی
  codeLanguage: string;
  codeSnippet: string;
  codingProblem: string;
  codingExpectedOutput: string;
  // تحقیقاتی
  researchInstructions: string;
  researchSources: string;
  researchAnswerKey: string;
  // رمز مخفی
  cipherHint: string;
  cipherMethod: string;
  secretClueNote: string;
  // ترکیبی
  hybridModules: Array<'text' | 'image' | 'video' | 'coding' | 'research' | 'secret_code'>;
  hybridNotes: string;
}

export interface StagePasswordSettings {
  correctCode: string;
  caseSensitive: boolean;
  trimWhitespace: boolean;
  maxAttempts: number;
  cooldownSeconds: number;
  points: number;
  penaltyPoints: number;
}

export interface StageAdvancedSettings {
  isActive: boolean;
  showNextAfterComplete: boolean;
  timeLimitMinutes: number;
  allowRetry: boolean;
  dependsOnPrevious: boolean;
  saveProgressState: boolean;
}

export interface ContestStage {
  id: string;
  title: string;
  description: string;
  points: number;
  required: boolean;
  completedCount: number;
  // Extended wizard fields
  imageUrl?: string;
  videoUrl?: string;
  missionText?: string;
  stageType?: StageType;
  missionContent?: StageMissionContent;
  passwordSettings?: StagePasswordSettings;
  hints?: StageHint[];
  advancedSettings?: StageAdvancedSettings;
}

export interface FinalVaultConfig {
  // اطلاعات ظاهری
  title: string;
  vaultImageUrl: string;
  openedImageUrl: string;
  beforeOpenText: string;
  successMessage: string;
  // تنظیمات امنیتی
  finalCode: string;
  finalKey: string;
  requireKeyForCode: boolean;
  maxAttempts: number;
  attemptCooldownSeconds: number;
  allowMultipleStudents: boolean;
  // تنظیمات برنده شدن
  winnerMode: 'first_only' | 'multiple';
  maxWinnersCount: number;
  winnerPrize: string;
  finalScore: number;
  autoStopOnWinner: boolean;
}

export interface ContestScoringConfig {
  pointsPerStage: number;
  fastCompletionBonus: number;
  fastCompletionThresholdMinutes: number;
  maxWrongAttempts: number;
  wrongAttemptPenalty: number;
}

export interface ContestAccessConfig {
  startTime: string;
  endTime: string;
  hasParticipantLimit: boolean;
  maxParticipants: number;
  audienceType: 'public' | 'students' | 'invited' | 'specific_class';
  audienceDetail: string;
}

export type ParticipantStatus = 'in_progress' | 'completed' | 'winner' | 'paused';

export interface ParticipantSubmittedAnswer {
  id: string;
  stageTitle: string;
  answer: string;
  isCorrect: boolean;
  submittedAt: string;
}

export interface ParticipantUsedHint {
  id: string;
  stageTitle: string;
  hintTitle: string;
  pointDeduction: number;
  usedAt: string;
}

export interface ParticipantStageTime {
  stageId: string;
  stageTitle: string;
  minutes: number;
  pointsEarned: number;
}

export interface ParticipantActivityLog {
  id: string;
  action: string;
  timestamp: string;
}

export interface Participant {
  id: string;
  fullName: string;
  studentCode?: string;
  gradeClass?: string;
  email: string;
  phone: string;
  joinedAt: string; // ISO YYYY-MM-DD
  completedStages: number;
  totalStages: number;
  score: number;
  completionTimeMinutes: number;
  isCompleted: boolean;
  isWinner: boolean;
  isPaused?: boolean;
  wrongAttempts?: number;
  submittedAnswers?: ParticipantSubmittedAnswer[];
  usedHints?: ParticipantUsedHint[];
  stageTimes?: ParticipantStageTime[];
  activityLogs?: ParticipantActivityLog[];
}

export interface SystemSettings {
  systemEnabled: boolean;
  showInStudentPanel: boolean;
  studentPanelVisibility: 'all_active' | 'enrolled_only' | 'hidden';
  showLeaderboard: boolean;
  leaderboardTopCount: number;
  winnerDisplayMode: 'public' | 'private';
  defaultContestDurationDays: number;
  defaultStageTimeLimitMinutes: number;
  defaultMaxWrongAttempts: number;
  defaultAttemptCooldownSeconds: number;
  initialBaseScore: number;
  defaultStagePoints: number;
  defaultFastBonus: number;
  defaultWrongPenalty: number;
  notifyOnStart: boolean;
  notifyOnEnd: boolean;
  notifyOnWinner: boolean;
  remindBeforeEndHours: number;
  maxCodeRequestsPerMinute: number;
  tempLockAfterFailures: number;
  enableSecurityAuditLog: boolean;
}

export interface Contest {
  id: string;
  code: string;
  title: string;
  description: string;
  category: string;
  prizeSummary: string;
  startDate: string; // ISO YYYY-MM-DD
  endDate: string;   // ISO YYYY-MM-DD
  status: ContestStatus;
  stages: ContestStage[];
  participants: Participant[];
  baseParticipantsOffset: number;
  baseCompletersOffset: number;
  baseWinnersOffset: number;
  // Extended wizard fields
  story?: string;
  coverImageUrl?: string;
  gameEnvImageUrl?: string;
  rules?: string;
  welcomeMessage?: string;
  accessConfig?: ContestAccessConfig;
  scoringConfig?: ContestScoringConfig;
  finalVault?: FinalVaultConfig;
  scheduledPublishAt?: string;
}

export type ActivityCategory = 'contest' | 'stage' | 'participant' | 'winner';

export interface ActivityItem {
  id: string;
  category: ActivityCategory;
  actor: string;
  action: string;
  contestId?: string;
  contestTitle: string;
  timestampLabel: string;
  createdAt: number;
}

export type ViewMode = 'card' | 'table';

export type DateFilterPreset = 'all' | 'active_now' | 'this_month' | 'upcoming' | 'custom';

export type ModalState =
  | { type: 'none' }
  | { type: 'details'; contestId: string }
  | { type: 'edit'; contestId: string }
  | { type: 'stages'; contestId: string }
  | { type: 'participants'; contestId: string }
  | { type: 'results'; contestId: string }
  | { type: 'delete'; contestId: string };
