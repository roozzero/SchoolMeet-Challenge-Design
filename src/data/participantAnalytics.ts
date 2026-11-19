import {
  Contest,
  Participant,
  ParticipantActivityLog,
  ParticipantStageTime,
  ParticipantStatus,
  ParticipantSubmittedAnswer,
  ParticipantUsedHint,
  SystemSettings,
} from '../types/contest';
import { formatJalaliDate, getContestMetrics, toPersianDigits } from './initialData';

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  systemEnabled: true,
  showInStudentPanel: true,
  studentPanelVisibility: 'all_active',
  showLeaderboard: true,
  leaderboardTopCount: 20,
  winnerDisplayMode: 'public',
  defaultContestDurationDays: 30,
  defaultStageTimeLimitMinutes: 20,
  defaultMaxWrongAttempts: 5,
  defaultAttemptCooldownSeconds: 15,
  initialBaseScore: 0,
  defaultStagePoints: 100,
  defaultFastBonus: 50,
  defaultWrongPenalty: 10,
  notifyOnStart: true,
  notifyOnEnd: true,
  notifyOnWinner: true,
  remindBeforeEndHours: 24,
  maxCodeRequestsPerMinute: 12,
  tempLockAfterFailures: 5,
  enableSecurityAuditLog: true,
};

export const PARTICIPANT_STATUS_META: Record<
  ParticipantStatus,
  { label: string; textClass: string; badgeClass: string }
> = {
  winner: {
    label: 'برنده',
    textClass: 'text-[#0F766E]',
    badgeClass: 'bg-[#DFEFEA] text-[#0F766E]',
  },
  completed: {
    label: 'تکمیل‌شده',
    textClass: 'text-[#5D3F2A]',
    badgeClass: 'bg-[#EFE6D5] text-[#5D3F2A]',
  },
  in_progress: {
    label: 'در حال انجام',
    textClass: 'text-[#7A6A5B]',
    badgeClass: 'bg-[#F3ECE0] text-[#5D3F2A]',
  },
  paused: {
    label: 'متوقف‌شده',
    textClass: 'text-[#B45309]',
    badgeClass: 'bg-[#FEF3C7] text-[#B45309]',
  },
};

export function getParticipantStatus(p: Participant): ParticipantStatus {
  if (p.isPaused) return 'paused';
  if (p.isWinner) return 'winner';
  if (p.isCompleted) return 'completed';
  return 'in_progress';
}

export function formatDurationPersian(minutes: number): string {
  if (!minutes || minutes <= 0) return 'کمتر از ۱ دقیقه';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${toPersianDigits(mins)} دقیقه`;
  if (mins === 0) return `${toPersianDigits(hrs)} ساعت`;
  return `${toPersianDigits(hrs)} ساعت و ${toPersianDigits(mins)} دقیقه`;
}

function hashNumber(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) % 10000;
  }
  return Math.abs(h);
}

const SAMPLE_CLASSES = ['کلاس ۹۰۱', 'کلاس ۹۰۲', 'کلاس ۹۰۳', 'گروه پژوهشی الف', 'گروه پژوهشی ب'];
const SAMPLE_WRONG_CODES = ['CODE-404', 'PASS-120', 'KEY-BETA', 'TRY-99', 'ANS-07'];
const SAMPLE_RIGHT_CODES = ['ALGO-2026', 'UX-FLOW-9', 'GROWTH-88', 'DATA-MAPE', 'EDU-TOP'];

export function getStudentCode(p: Participant): string {
  if (p.studentCode) return p.studentCode;
  const seed = hashNumber(p.id + p.fullName);
  return `405${String(1000 + (seed % 8999))}`;
}

export function getCurrentStageLabel(p: Participant, contest: Contest): string {
  if (contest.stages.length === 0) return 'بدون مرحله';
  if (p.isCompleted) return `تکمیل همه (${toPersianDigits(contest.stages.length)} مرحله)`;
  const nextIndex = Math.min(p.completedStages, contest.stages.length - 1);
  return `مرحله ${toPersianDigits(nextIndex + 1)}: ${contest.stages[nextIndex].title}`;
}

export function getEnrichedParticipantDetails(p: Participant, contest: Contest) {
  const seed = hashNumber(p.id + contest.id);
  const studentCode = getStudentCode(p);
  const gradeClass = p.gradeClass ?? SAMPLE_CLASSES[seed % SAMPLE_CLASSES.length];

  const totalStages = contest.stages.length;
  const doneCount = Math.min(totalStages, Math.max(0, p.completedStages));
  const completedStagesList = contest.stages.slice(0, doneCount);
  const remainingStagesList = contest.stages.slice(doneCount);

  const progressPercent =
    totalStages > 0 ? Math.min(100, Math.round((doneCount / totalStages) * 100)) : 0;

  // Stage completion times
  const stageTimes: ParticipantStageTime[] =
    p.stageTimes ??
    completedStagesList.map((st, idx) => {
      const avg = Math.max(
        8,
        Math.round((p.completionTimeMinutes || doneCount * 22) / Math.max(1, doneCount))
      );
      const variance = ((seed + idx * 7) % 11) - 5;
      return {
        stageId: st.id,
        stageTitle: st.title,
        minutes: Math.max(5, avg + variance),
        pointsEarned: st.points,
      };
    });

  // Wrong attempts count
  const wrongAttempts =
    p.wrongAttempts !== undefined
      ? p.wrongAttempts
      : doneCount === 0 && p.score === 0
        ? 0
        : (seed % 4) + (p.isWinner ? 0 : 1);

  // Used hints
  const usedHints: ParticipantUsedHint[] =
    p.usedHints ??
    (doneCount === 0
      ? []
      : completedStagesList.slice(0, Math.min(2, (seed % 2) + 1)).map((st, idx) => ({
          id: `uh-${p.id}-${idx}`,
          stageTitle: st.title,
          hintTitle: idx === 0 ? 'راهنمایی اول: سرنخ کوچک' : 'راهنمایی دوم: راهنمایی دقیق‌تر',
          pointDeduction: idx === 0 ? 10 : 20,
          usedAt: `${formatJalaliDate(p.joinedAt)} · ساعت ${toPersianDigits(10 + idx)}:${toPersianDigits(15 + (seed % 40))}`,
        })));

  // Submitted answers
  const submittedAnswers: ParticipantSubmittedAnswer[] =
    p.submittedAnswers ??
    [
      ...completedStagesList.flatMap((st, idx) => {
        const items: ParticipantSubmittedAnswer[] = [];
        if (idx === 0 && wrongAttempts > 0) {
          items.push({
            id: `ans-w-${p.id}-${idx}`,
            stageTitle: st.title,
            answer: SAMPLE_WRONG_CODES[(seed + idx) % SAMPLE_WRONG_CODES.length],
            isCorrect: false,
            submittedAt: `${formatJalaliDate(p.joinedAt)} · ${toPersianDigits(10 + idx)}:۱۲`,
          });
        }
        items.push({
          id: `ans-r-${p.id}-${idx}`,
          stageTitle: st.title,
          answer:
            st.passwordSettings?.correctCode ||
            SAMPLE_RIGHT_CODES[(seed + idx) % SAMPLE_RIGHT_CODES.length],
          isCorrect: true,
          submittedAt: `${formatJalaliDate(p.joinedAt)} · ${toPersianDigits(10 + idx)}:۲۸`,
        });
        return items;
      }),
    ];

  // Score breakdown
  const stagesRawScore = stageTimes.reduce((acc, s) => acc + s.pointsEarned, 0);
  const hintsDeduction = usedHints.reduce((acc, h) => acc + h.pointDeduction, 0);
  const wrongPenalty = wrongAttempts * 10;
  const fastBonus = p.isCompleted && p.completionTimeMinutes > 0 && p.completionTimeMinutes < 160 ? 35 : 0;

  // Activity timeline
  const activityLogs: ParticipantActivityLog[] = p.activityLogs ?? [
    ...(p.isPaused
      ? [
          {
            id: `log-pause-${p.id}`,
            action: 'شرکت دانش‌آموز توسط مدیر سامانه به‌صورت موقت متوقف شد',
            timestamp: 'امروز',
          },
        ]
      : []),
    ...(p.isWinner
      ? [
          {
            id: `log-win-${p.id}`,
            action: 'به‌عنوان برنده رسمی در جدول نتایج مسابقه تأیید شد',
            timestamp: formatJalaliDate(contest.endDate),
          },
        ]
      : []),
    ...(p.isCompleted
      ? [
          {
            id: `log-done-${p.id}`,
            action: `تمامی ${toPersianDigits(totalStages)} مرحله مسابقه را با موفقیت تکمیل کرد`,
            timestamp: formatJalaliDate(p.joinedAt),
          },
        ]
      : []),
    ...completedStagesList.map((st, idx) => ({
      id: `log-st-${p.id}-${idx}`,
      action: `مرحله «${st.title}» را با موفقیت پشت سر گذاشت (+${toPersianDigits(st.points)} امتیاز)`,
      timestamp: formatJalaliDate(p.joinedAt),
    })),
    {
      id: `log-join-${p.id}`,
      action: `در مسابقه «${contest.title}» ثبت‌نام و مأموریت را آغاز کرد`,
      timestamp: formatJalaliDate(p.joinedAt),
    },
  ];

  return {
    studentCode,
    gradeClass,
    progressPercent,
    completedStagesList,
    remainingStagesList,
    stageTimes,
    wrongAttempts,
    usedHints,
    submittedAnswers,
    scoreBreakdown: {
      stagesRawScore,
      fastBonus,
      hintsDeduction,
      wrongPenalty,
      finalScore: p.score,
    },
    activityLogs,
  };
}

export function computeAnalyticsSummary(contests: Contest[], selectedContestId: string | 'all') {
  const scope =
    selectedContestId === 'all'
      ? contests
      : contests.filter((c) => c.id === selectedContestId);

  let totalParticipants = 0;
  let totalCompleters = 0;
  let totalWinners = 0;
  let totalStarted = 0;

  let completionTimeSum = 0;
  let completionTimeCount = 0;

  let wrongAttemptsSum = 0;
  let wrongAttemptsParticipants = 0;
  let totalHintsUsed = 0;

  let hardestStage: { title: string; contestTitle: string; dropRate: number } | null = null;
  let mostStoppedStage: { title: string; contestTitle: string; stoppedCount: number } | null = null;

  const participationByContest: Array<{
    contestId: string;
    title: string;
    participants: number;
    completers: number;
    completionRate: number;
    status: Contest['status'];
    stagesCount: number;
  }> = [];

  for (const contest of scope) {
    const m = getContestMetrics(contest);
    totalParticipants += m.participantsCount;
    totalCompleters += m.completersCount;
    totalWinners += m.winnersCount;

    // Estimate started participants from stage 1 completedCount or participant roster
    const stage1Done = contest.stages[0]?.completedCount ?? 0;
    const startedInContest =
      m.participantsCount === 0
        ? 0
        : Math.min(
            m.participantsCount,
            Math.max(
              stage1Done,
              Math.round(m.participantsCount * 0.88),
              contest.participants.filter((p) => p.completedStages > 0 || p.score > 0).length
            )
          );
    totalStarted += startedInContest;

    participationByContest.push({
      contestId: contest.id,
      title: contest.title,
      participants: m.participantsCount,
      completers: m.completersCount,
      completionRate: m.completionRate,
      status: contest.status,
      stagesCount: m.stageCount,
    });

    // Participant-level averages
    for (const p of contest.participants) {
      const enriched = getEnrichedParticipantDetails(p, contest);
      if (p.isCompleted && p.completionTimeMinutes > 0) {
        completionTimeSum += p.completionTimeMinutes;
        completionTimeCount += 1;
      }
      wrongAttemptsSum += enriched.wrongAttempts;
      wrongAttemptsParticipants += 1;
      totalHintsUsed += enriched.usedHints.length;
    }

    // Scale hints slightly for large base participant contests so macro numbers feel realistic
    if (contest.baseParticipantsOffset > 0) {
      totalHintsUsed += Math.round(contest.baseParticipantsOffset * 0.42);
    }

    // Analyze stage drop-off to identify hardest stage & most-stopped stage
    if (contest.stages.length > 0 && m.participantsCount > 0) {
      let prevCount = m.participantsCount;
      for (const stage of contest.stages) {
        const done = Math.min(prevCount, stage.completedCount);
        const stoppedHere = Math.max(0, prevCount - done);
        const dropRate = prevCount > 0 ? Math.round((stoppedHere / prevCount) * 100) : 0;

        if (!hardestStage || dropRate > hardestStage.dropRate) {
          hardestStage = {
            title: stage.title,
            contestTitle: contest.title,
            dropRate,
          };
        }
        if (!mostStoppedStage || stoppedHere > mostStoppedStage.stoppedCount) {
          mostStoppedStage = {
            title: stage.title,
            contestTitle: contest.title,
            stoppedCount: stoppedHere,
          };
        }
        prevCount = done > 0 ? done : prevCount;
      }
    }
  }

  const startRate =
    totalParticipants > 0 ? Math.min(100, Math.round((totalStarted / totalParticipants) * 100)) : 0;
  const completionRate =
    totalParticipants > 0 ? Math.min(100, Math.round((totalCompleters / totalParticipants) * 100)) : 0;
  const avgCompletionMinutes =
    completionTimeCount > 0 ? Math.round(completionTimeSum / completionTimeCount) : 0;
  const avgWrongAttempts =
    wrongAttemptsParticipants > 0
      ? Number((wrongAttemptsSum / wrongAttemptsParticipants).toFixed(1))
      : 0;

  return {
    totalParticipants,
    totalCompleters,
    totalWinners,
    startRate,
    completionRate,
    avgCompletionMinutes,
    hardestStage,
    mostStoppedStage,
    avgWrongAttempts,
    totalHintsUsed,
    participationByContest: participationByContest.sort((a, b) => b.participants - a.participants),
  };
}
