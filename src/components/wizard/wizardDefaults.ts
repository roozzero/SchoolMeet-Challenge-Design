import {
  Contest,
  ContestAccessConfig,
  ContestScoringConfig,
  ContestStage,
  FinalVaultConfig,
  StageHint,
  StageMissionContent,
  StageType,
} from '../../types/contest';
import { toPersianDigits } from '../../data/initialData';

export interface ContestWizardData {
  // Step 1: اطلاعات عمومی
  title: string;
  code: string;
  category: string;
  shortDescription: string;
  story: string;
  coverImageUrl: string;
  gameEnvImageUrl: string;
  rules: string;
  welcomeMessage: string;

  // Step 2: زمان‌بندی و دسترسی
  startDate: string;
  endDate: string;
  access: ContestAccessConfig;

  // Step 3: قوانین و امتیازدهی
  scoring: ContestScoringConfig;

  // Step 4: مراحل و گاوصندوق نهایی
  stages: ContestStage[];
  finalVault: FinalVaultConfig;

  // Step 5: انتشار
  publishMode: 'publish_now' | 'schedule' | 'draft';
  scheduledPublishAt: string;
}

export const STAGE_TYPE_OPTIONS: Array<{
  value: StageType;
  label: string;
  summary: string;
}> = [
  { value: 'text', label: 'متنی', summary: 'متن، سؤال و پاسخ' },
  { value: 'image', label: 'تصویری', summary: 'تصویر، سؤال و رمز' },
  { value: 'video', label: 'ویدئویی', summary: 'ویدئو و سرنخ' },
  { value: 'coding', label: 'کدنویسی', summary: 'کد، صورت مسئله و پاسخ' },
  { value: 'research', label: 'تحقیقاتی', summary: 'دستورالعمل و پاسخ' },
  { value: 'secret_code', label: 'رمز مخفی', summary: 'سرنخ و رمز' },
  { value: 'hybrid', label: 'ترکیبی', summary: 'ترکیب چند محتوای مختلف' },
];

export const CONTEST_CATEGORIES = [
  'فناوری و توسعه',
  'طراحی محصول',
  'علم داده و هوش مصنوعی',
  'امنیت سایبری',
  'آموزش و مهارت',
  'بازاریابی و رشد',
  'هنر و خلاقیت',
];

export function createDefaultMissionContent(): StageMissionContent {
  return {
    bodyText: '',
    question: '',
    sampleAnswer: '',
    puzzleImageUrl: '',
    imageQuestion: '',
    imageCodeClue: '',
    videoClueUrl: '',
    videoTimestamp: '00:45',
    videoClueText: '',
    codeLanguage: 'JavaScript',
    codeSnippet: '// کد چالش را اینجا بنویسید\nfunction solve(input) {\n  return input;\n}',
    codingProblem: '',
    codingExpectedOutput: '',
    researchInstructions: '',
    researchSources: '',
    researchAnswerKey: '',
    cipherHint: '',
    cipherMethod: 'رمزنگاری جابه‌جایی / معما',
    secretClueNote: '',
    hybridModules: ['text', 'image'],
    hybridNotes: '',
  };
}

export function createDefaultHints(stageNumber: number): StageHint[] {
  return [
    {
      id: `hint-${Date.now()}-${stageNumber}-1`,
      title: 'راهنمایی اول: یک سرنخ کوچک',
      text: '',
      pointDeduction: 10,
    },
    {
      id: `hint-${Date.now()}-${stageNumber}-2`,
      title: 'راهنمایی دوم: راهنمایی دقیق‌تر',
      text: '',
      pointDeduction: 25,
    },
    {
      id: `hint-${Date.now()}-${stageNumber}-3`,
      title: 'راهنمایی سوم: راهنمایی تقریباً مستقیم',
      text: '',
      pointDeduction: 45,
    },
  ];
}

export function createDefaultStage(
  index: number,
  defaultPoints = 100,
  defaultMaxAttempts = 5,
  defaultPenalty = 10
): ContestStage {
  const num = index + 1;
  return {
    id: `stage-${Date.now()}-${num}-${Math.random().toString(36).slice(2, 6)}`,
    title: `مرحله ${toPersianDigits(num)}`,
    description: '',
    points: defaultPoints,
    required: true,
    completedCount: 0,
    imageUrl: '',
    videoUrl: '',
    missionText: '',
    stageType: 'text',
    missionContent: createDefaultMissionContent(),
    passwordSettings: {
      correctCode: '',
      caseSensitive: false,
      trimWhitespace: true,
      maxAttempts: defaultMaxAttempts,
      cooldownSeconds: 15,
      points: defaultPoints,
      penaltyPoints: defaultPenalty,
    },
    hints: createDefaultHints(num),
    advancedSettings: {
      isActive: true,
      showNextAfterComplete: true,
      timeLimitMinutes: 20,
      allowRetry: true,
      dependsOnPrevious: index > 0,
      saveProgressState: true,
    },
  };
}

export function createDefaultFinalVault(): FinalVaultConfig {
  return {
    title: 'گاوصندوق نهایی مسابقه',
    vaultImageUrl: '',
    openedImageUrl: '',
    beforeOpenText:
      'با جمع‌آوری سرنخ‌ها و کلید مراحل قبل، رمز نهایی را وارد کنید تا درِ گاوصندوق باز شود.',
    successMessage:
      'تبریک! شما با موفقیت قفل گاوصندوق نهایی را باز کردید و این مأموریت را به پایان رساندید.',
    finalCode: '',
    finalKey: '',
    requireKeyForCode: true,
    maxAttempts: 3,
    attemptCooldownSeconds: 30,
    allowMultipleStudents: true,
    winnerMode: 'multiple',
    maxWinnersCount: 3,
    winnerPrize: 'جایزه ویژه و لوح تقدیر نفرات برتر',
    finalScore: 300,
    autoStopOnWinner: false,
  };
}

export function createInitialWizardData(nextCodeNumber: number): ContestWizardData {
  const scoring: ContestScoringConfig = {
    pointsPerStage: 100,
    fastCompletionBonus: 50,
    fastCompletionThresholdMinutes: 30,
    maxWrongAttempts: 5,
    wrongAttemptPenalty: 10,
  };

  return {
    title: '',
    code: `MDN-${nextCodeNumber}`,
    category: CONTEST_CATEGORIES[0],
    shortDescription: '',
    story: '',
    coverImageUrl: '',
    gameEnvImageUrl: '',
    rules:
      '۱. شرکت‌کنندگان موظف به پاسخگویی فردی در هر مرحله هستند.\n۲. استفاده از راهنمایی‌ها موجب کسر امتیاز مطابق تعرفه همان مرحله می‌شود.\n۳. پس از تکمیل تمام مراحل، دسترسی به گاوصندوق نهایی فعال خواهد شد.',
    welcomeMessage:
      'خوش آمدید! برای شروع مأموریت آماده شوید و سرنخ‌های هر مرحله را با دقت بررسی کنید.',
    startDate: '2026-11-22',
    endDate: '2026-12-22',
    access: {
      startTime: '09:00',
      endTime: '23:59',
      hasParticipantLimit: true,
      maxParticipants: 100,
      audienceType: 'students',
      audienceDetail: 'همه کلاس‌های دوره پاییز ۱۴۰۵',
    },
    scoring,
    stages: [
      createDefaultStage(0, scoring.pointsPerStage, scoring.maxWrongAttempts, scoring.wrongAttemptPenalty),
      createDefaultStage(1, scoring.pointsPerStage, scoring.maxWrongAttempts, scoring.wrongAttemptPenalty),
      createDefaultStage(2, scoring.pointsPerStage, scoring.maxWrongAttempts, scoring.wrongAttemptPenalty),
    ],
    finalVault: createDefaultFinalVault(),
    publishMode: 'publish_now',
    scheduledPublishAt: '2026-11-22T09:00',
  };
}

export function wizardDataToContest(data: ContestWizardData): Contest {
  const status =
    data.publishMode === 'publish_now'
      ? 'active'
      : 'draft';

  const normalizedStages: ContestStage[] = data.stages.map((st) => ({
    ...st,
    points: st.passwordSettings?.points ?? st.points ?? data.scoring.pointsPerStage,
  }));

  return {
    id: `cnt-${Date.now()}`,
    code: data.code.trim() || `MDN-${Math.floor(4000 + Math.random() * 5000)}`,
    title: data.title.trim(),
    description:
      data.shortDescription.trim() ||
      data.story.trim() ||
      'مسابقه چندمرحله‌ای تعاملی همراه با گاوصندوق نهایی.',
    category: data.category,
    prizeSummary: data.finalVault.winnerPrize.trim() || 'جایزه برگزیدگان مسابقه',
    startDate: data.startDate,
    endDate: data.endDate,
    status,
    stages: normalizedStages,
    participants: [],
    baseParticipantsOffset: 0,
    baseCompletersOffset: 0,
    baseWinnersOffset: 0,
    story: data.story,
    coverImageUrl: data.coverImageUrl,
    gameEnvImageUrl: data.gameEnvImageUrl,
    rules: data.rules,
    welcomeMessage: data.welcomeMessage,
    accessConfig: data.access,
    scoringConfig: data.scoring,
    finalVault: data.finalVault,
    scheduledPublishAt:
      data.publishMode === 'schedule' ? data.scheduledPublishAt : undefined,
  };
}
