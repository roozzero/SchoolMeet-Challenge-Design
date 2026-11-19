import {
  AlertTriangle,
  ArrowRight,
  Award,
  CheckCircle2,
  Clock,
  HelpCircle,
  History,
  Layers,
  Pause,
  Play,
  RotateCcw,
  Trash2,
  User,
  X,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Contest, Participant } from '../../types/contest';
import {
  formatJalaliDate,
  formatPersianNumber,
  STATUS_META,
  toPersianDigits,
} from '../../data/initialData';
import {
  formatDurationPersian,
  getEnrichedParticipantDetails,
  getParticipantStatus,
  PARTICIPANT_STATUS_META,
} from '../../data/participantAnalytics';

interface ParticipantDetailPageProps {
  contest: Contest;
  participant: Participant;
  onBack: () => void;
  onTogglePause: () => void;
  onResetProgress: () => void;
  onRemoveWithReason: (reason: string) => void;
  onToggleWinner: () => void;
}

export function ParticipantDetailPage({
  contest,
  participant,
  onBack,
  onTogglePause,
  onResetProgress,
  onRemoveWithReason,
  onToggleWinner,
}: ParticipantDetailPageProps) {
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [removeReason, setRemoveReason] = useState('');
  const [removeError, setRemoveError] = useState('');

  const status = getParticipantStatus(participant);
  const statusMeta = PARTICIPANT_STATUS_META[status];
  const contestStatusMeta = STATUS_META[contest.status];
  const details = getEnrichedParticipantDetails(participant, contest);

  const handleConfirmRemove = () => {
    if (removeReason.trim().length < 4) {
      setRemoveError('لطفاً دلیل حذف دانش‌آموز از مسابقه را وارد کنید (حداقل ۴ کاراکتر).');
      return;
    }
    setRemoveError('');
    onRemoveWithReason(removeReason.trim());
    setRemoveModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Header Bar + Administrative Operations */}
      <header className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[22px] px-5 sm:px-6 py-4 shadow-[0_2px_10px_rgba(78,52,34,0.04)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-bold text-[#5D3F2A] bg-[#F3ECE0] hover:bg-[#EAE0CE] border border-[#E2D9C8] rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>بازگشت به فهرست شرکت‌کنندگان</span>
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold text-[#2A1D15] truncate">
                {participant.fullName}
              </h1>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-lg whitespace-nowrap ${statusMeta.badgeClass}`}
              >
                {statusMeta.label}
              </span>
            </div>
            <p className="text-xs text-[#7A6A5B] truncate mt-0.5">
              شماره دانش‌آموزی:{' '}
              <span className="font-mono">{toPersianDigits(details.studentCode)}</span> ·{' '}
              {contest.title}
            </p>
          </div>
        </div>

        {/* All Administrative Operations */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggleWinner}
            className={`inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-bold rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
              participant.isWinner
                ? 'bg-[#0F766E] text-[#FAF7F0] hover:bg-[#115E59]'
                : 'bg-[#DFEFEA] text-[#0F766E] border border-[#C6E2DA] hover:bg-[#D0E7E0]'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>{participant.isWinner ? 'برنده تأییدشده' : 'انتخاب به‌عنوان برنده'}</span>
          </button>

          <button
            type="button"
            onClick={onTogglePause}
            className={`inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-bold rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
              participant.isPaused
                ? 'bg-[#0F766E] text-[#FAF7F0] hover:bg-[#115E59]'
                : 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] hover:bg-[#FDE68A]/70'
            }`}
          >
            {participant.isPaused ? (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>ازسرگیری شرکت</span>
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>متوقف کردن شرکت دانش‌آموز</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setConfirmResetOpen(true)}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-bold text-[#4A3525] bg-[#F3ECE0] hover:bg-[#EAE0CE] border border-[#DDD2BE] rounded-xl transition-colors whitespace-nowrap cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>بازنشانی پیشرفت</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setRemoveReason('');
              setRemoveError('');
              setRemoveModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-bold text-[#B91C1C] bg-[#FEE2E2]/70 hover:bg-[#FEE2E2] border border-[#FECACA] rounded-xl transition-colors whitespace-nowrap cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>حذف از مسابقه</span>
          </button>
        </div>
      </header>

      {/* Row 1: 1. اطلاعات پروفایل دانش‌آموز + 2. اطلاعات مسابقه + 9. امتیازات & 6. تعداد رمزهای اشتباه */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* 1. پروفایل دانش‌آموز */}
        <section className="lg:col-span-4 bg-[#FAF7F0] border border-[#E2D9C8] rounded-[22px] p-5 shadow-[0_2px_10px_rgba(78,52,34,0.04)] space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#EAE2D3]">
            <div className="w-9 h-9 rounded-xl bg-[#EFE6D5] text-[#5D3F2A] flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-extrabold text-[#2A1D15]">۱. اطلاعات پروفایل دانش‌آموز</h2>
          </div>

          <dl className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between gap-2">
              <dt className="text-[#7A6A5B]">نام و نام خانوادگی</dt>
              <dd className="font-bold text-[#2A1D15]">{participant.fullName}</dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-[#7A6A5B]">شماره دانش‌آموزی</dt>
              <dd className="font-mono font-bold text-[#2A1D15]">
                {toPersianDigits(details.studentCode)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-[#7A6A5B]">کلاس / گروه</dt>
              <dd className="font-semibold text-[#4A3525]">{details.gradeClass}</dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-[#7A6A5B]">ایمیل ثبت‌شده</dt>
              <dd className="font-mono text-[#4A3525]" dir="ltr">
                {participant.email}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-[#7A6A5B]">شماره تماس</dt>
              <dd className="font-mono text-[#4A3525]" dir="ltr">
                {participant.phone}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-[#7A6A5B]">تاریخ شروع حضور</dt>
              <dd className="font-semibold text-[#2A1D15] tabular-nums">
                {formatJalaliDate(participant.joinedAt)}
              </dd>
            </div>
          </dl>
        </section>

        {/* 2. اطلاعات مسابقه */}
        <section className="lg:col-span-4 bg-[#FAF7F0] border border-[#E2D9C8] rounded-[22px] p-5 shadow-[0_2px_10px_rgba(78,52,34,0.04)] space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#EAE2D3]">
            <div className="w-9 h-9 rounded-xl bg-[#EFE6D5] text-[#5D3F2A] flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-extrabold text-[#2A1D15]">۲. اطلاعات مسابقه</h2>
          </div>

          <dl className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between gap-2">
              <dt className="text-[#7A6A5B]">عنوان مسابقه</dt>
              <dd className="font-bold text-[#2A1D15] truncate max-w-[60%]">{contest.title}</dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-[#7A6A5B]">شناسه مسابقه</dt>
              <dd className="font-mono text-[#4A3525]" dir="ltr">
                {contest.code}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-[#7A6A5B]">دسته‌بندی</dt>
              <dd className="font-semibold text-[#4A3525]">{contest.category}</dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-[#7A6A5B]">وضعیت مسابقه</dt>
              <dd className={`font-bold ${contestStatusMeta.textClass}`}>
                {contestStatusMeta.label}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-[#7A6A5B]">بازه برگزاری</dt>
              <dd className="tabular-nums text-[#2A1D15]">
                {formatJalaliDate(contest.startDate)} تا {formatJalaliDate(contest.endDate)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-[#7A6A5B]">مدت زمان سپری‌شده</dt>
              <dd className="font-bold text-[#5D3F2A] tabular-nums">
                {formatDurationPersian(participant.completionTimeMinutes)}
              </dd>
            </div>
          </dl>

          <div className="pt-2">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-[#7A6A5B]">درصد پیشرفت در مسابقه</span>
              <span className="font-extrabold text-[#2A1D15] tabular-nums">
                {toPersianDigits(details.progressPercent)}٪
              </span>
            </div>
            <div className="h-2 bg-[#E6DCC9] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#5D3F2A] rounded-full transition-all"
                style={{ width: `${details.progressPercent}%` }}
              />
            </div>
          </div>
        </section>

        {/* 9. امتیازات & 6. تعداد رمزهای اشتباه */}
        <section className="lg:col-span-4 bg-[#FAF7F0] border border-[#E2D9C8] rounded-[22px] p-5 shadow-[0_2px_10px_rgba(78,52,34,0.04)] space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#EAE2D3]">
            <div className="w-9 h-9 rounded-xl bg-[#DFEFEA] text-[#0F766E] flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-extrabold text-[#2A1D15]">
              ۹. امتیازات و ۶. تعداد رمزهای اشتباه
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-[#FCFBF8] border border-[#E5DCCB] rounded-2xl">
              <p className="text-[11px] text-[#7A6A5B]">امتیاز نهایی فعلی</p>
              <p className="mt-1 text-xl font-extrabold text-[#0F766E] tabular-nums">
                {formatPersianNumber(details.scoreBreakdown.finalScore)}
              </p>
            </div>
            <div className="p-3 bg-[#FCFBF8] border border-[#E5DCCB] rounded-2xl">
              <p className="text-[11px] text-[#7A6A5B]">تعداد رمزهای اشتباه</p>
              <p className="mt-1 text-xl font-extrabold text-[#B45309] tabular-nums">
                {formatPersianNumber(details.wrongAttempts)} بار
              </p>
            </div>
          </div>

          <dl className="space-y-2 text-xs pt-1">
            <div className="flex items-center justify-between">
              <dt className="text-[#7A6A5B]">مجموع امتیاز مراحل تکمیل‌شده</dt>
              <dd className="font-bold text-[#2A1D15] tabular-nums">
                +{formatPersianNumber(details.scoreBreakdown.stagesRawScore)}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-[#7A6A5B]">پاداش تکمیل سریع</dt>
              <dd className="font-bold text-[#0F766E] tabular-nums">
                +{formatPersianNumber(details.scoreBreakdown.fastBonus)}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-[#7A6A5B]">کسر امتیاز راهنمایی‌ها</dt>
              <dd className="font-bold text-[#B45309] tabular-nums">
                -{formatPersianNumber(details.scoreBreakdown.hintsDeduction)}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-[#7A6A5B]">جریمه رمزهای اشتباه</dt>
              <dd className="font-bold text-[#B91C1C] tabular-nums">
                -{formatPersianNumber(details.scoreBreakdown.wrongPenalty)}
              </dd>
            </div>
          </dl>
        </section>
      </div>

      {/* Row 2: 3. مراحل تکمیل‌شده + 4. مراحل باقیمانده + 7. زمان تکمیل هر مرحله */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 3 & 7: مراحل تکمیل‌شده همراه با زمان تکمیل هر مرحله */}
        <section className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[22px] p-5 shadow-[0_2px_10px_rgba(78,52,34,0.04)] space-y-3.5">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D3]">
            <h2 className="text-sm font-extrabold text-[#2A1D15] inline-flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#0F766E]" />
              <span>۳. مراحل تکمیل‌شده و ۷. زمان تکمیل هر مرحله</span>
            </h2>
            <span className="text-xs font-bold text-[#0F766E] tabular-nums">
              {toPersianDigits(details.completedStagesList.length)} مرحله
            </span>
          </div>

          {details.stageTimes.length === 0 ? (
            <p className="text-xs text-[#7A6A5B] py-6 text-center">
              هنوز هیچ مرحله‌ای توسط این دانش‌آموز تکمیل نشده است.
            </p>
          ) : (
            <ul className="space-y-2">
              {details.stageTimes.map((st, idx) => (
                <li
                  key={st.stageId}
                  className="p-3 bg-[#FCFBF8] border border-[#E5DCCB] rounded-2xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-[#2A1D15]">
                      {toPersianDigits(idx + 1)}. {st.stageTitle}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#0F766E] font-medium tabular-nums">
                      امتیاز کسب‌شده: +{formatPersianNumber(st.pointsEarned)}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[#5D3F2A] font-bold bg-[#EFE6D5] px-2.5 py-1 rounded-xl tabular-nums whitespace-nowrap shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{toPersianDigits(st.minutes)} دقیقه</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 4: مراحل باقیمانده */}
        <section className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[22px] p-5 shadow-[0_2px_10px_rgba(78,52,34,0.04)] space-y-3.5">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D3]">
            <h2 className="text-sm font-extrabold text-[#2A1D15] inline-flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#6B4C35]" />
              <span>۴. مراحل باقیمانده</span>
            </h2>
            <span className="text-xs font-bold text-[#7A6A5B] tabular-nums">
              {toPersianDigits(details.remainingStagesList.length)} مرحله
            </span>
          </div>

          {details.remainingStagesList.length === 0 ? (
            <div className="py-6 text-center text-xs font-bold text-[#0F766E] bg-[#DFEFEA]/50 border border-[#C6E2DA] rounded-2xl">
              تمامی مراحل این مسابقه با موفقیت تکمیل شده‌اند.
            </div>
          ) : (
            <ul className="space-y-2">
              {details.remainingStagesList.map((st, idx) => (
                <li
                  key={st.id}
                  className="p-3 bg-[#FCFBF8] border border-[#E5DCCB] rounded-2xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-[#2A1D15]">
                      {toPersianDigits(details.completedStagesList.length + idx + 1)}. {st.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#7A6A5B] truncate">{st.description}</p>
                  </div>
                  <span className="text-[11px] font-bold text-[#7A6A5B] tabular-nums whitespace-nowrap shrink-0">
                    {formatPersianNumber(st.points)} امتیاز
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Row 3: 5. پاسخ‌های واردشده + 8. راهنمایی‌های استفاده‌شده */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 5. پاسخ‌های واردشده */}
        <section className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[22px] p-5 shadow-[0_2px_10px_rgba(78,52,34,0.04)] space-y-3.5">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D3]">
            <h2 className="text-sm font-extrabold text-[#2A1D15]">۵. پاسخ‌های واردشده</h2>
            <span className="text-xs text-[#7A6A5B] tabular-nums">
              {toPersianDigits(details.submittedAnswers.length)} ثبت پاسخ
            </span>
          </div>

          {details.submittedAnswers.length === 0 ? (
            <p className="text-xs text-[#7A6A5B] py-6 text-center">
              هنوز پاسخی توسط این دانش‌آموز ثبت نشده است.
            </p>
          ) : (
            <div className="space-y-2">
              {details.submittedAnswers.map((ans) => (
                <div
                  key={ans.id}
                  className="p-3 bg-[#FCFBF8] border border-[#E5DCCB] rounded-2xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-[#2A1D15] truncate">{ans.stageTitle}</p>
                    <p className="mt-1 text-[11px] text-[#7A6A5B]">
                      پاسخ:{' '}
                      <code className="font-mono text-[#2A1D15] bg-[#EFE6D5] px-1.5 py-0.5 rounded">
                        {ans.answer}
                      </code>
                    </p>
                  </div>
                  <div className="text-left shrink-0">
                    <span
                      className={`inline-flex items-center gap-1 font-bold ${
                        ans.isCorrect ? 'text-[#0F766E]' : 'text-[#B91C1C]'
                      }`}
                    >
                      {ans.isCorrect ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>صحیح</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          <span>اشتباه</span>
                        </>
                      )}
                    </span>
                    <p className="text-[10px] text-[#8C7C6D] mt-0.5 tabular-nums">
                      {ans.submittedAt}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 8. راهنمایی‌های استفاده‌شده */}
        <section className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[22px] p-5 shadow-[0_2px_10px_rgba(78,52,34,0.04)] space-y-3.5">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D3]">
            <h2 className="text-sm font-extrabold text-[#2A1D15] inline-flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#5D3F2A]" />
              <span>۸. راهنمایی‌های استفاده‌شده</span>
            </h2>
            <span className="text-xs text-[#7A6A5B] tabular-nums">
              {toPersianDigits(details.usedHints.length)} مورد
            </span>
          </div>

          {details.usedHints.length === 0 ? (
            <p className="text-xs text-[#7A6A5B] py-6 text-center">
              این دانش‌آموز از هیچ راهنمایی استفاده نکرده است.
            </p>
          ) : (
            <div className="space-y-2">
              {details.usedHints.map((h) => (
                <div
                  key={h.id}
                  className="p-3 bg-[#FCFBF8] border border-[#E5DCCB] rounded-2xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-[#2A1D15]">{h.hintTitle}</p>
                    <p className="mt-0.5 text-[11px] text-[#7A6A5B]">
                      {h.stageTitle} · {h.usedAt}
                    </p>
                  </div>
                  <span className="font-bold text-[#B45309] tabular-nums whitespace-nowrap shrink-0">
                    -{formatPersianNumber(h.pointDeduction)} امتیاز
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Row 4: 10. تاریخچه فعالیت‌ها */}
      <section className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[22px] p-5 shadow-[0_2px_10px_rgba(78,52,34,0.04)] space-y-3.5">
        <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D3]">
          <h2 className="text-sm font-extrabold text-[#2A1D15] inline-flex items-center gap-2">
            <History className="w-4 h-4 text-[#5D3F2A]" />
            <span>۱۰. تاریخچه فعالیت‌های دانش‌آموز</span>
          </h2>
          <span className="text-xs text-[#7A6A5B] tabular-nums">
            {toPersianDigits(details.activityLogs.length)} رویداد
          </span>
        </div>

        <ol className="space-y-2">
          {details.activityLogs.map((log) => (
            <li
              key={log.id}
              className="p-3 bg-[#FCFBF8] border border-[#E5DCCB] rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs"
            >
              <span className="font-semibold text-[#2A1D15]">{log.action}</span>
              <span className="text-[#8C7C6D] tabular-nums">{log.timestamp}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Modal: بازنشانی پیشرفت با تأیید مدیر */}
      {confirmResetOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#2A1D15]/45 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setConfirmResetOpen(false)}
        >
          <div
            className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[24px] w-full max-w-md overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EAE2D3]">
              <h3 className="text-sm font-extrabold text-[#2A1D15] inline-flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-[#B45309]" />
                <span>تأیید مدیر برای بازنشانی پیشرفت</span>
              </h3>
              <button
                type="button"
                onClick={() => setConfirmResetOpen(false)}
                className="p-1.5 text-[#7A6A5B] hover:bg-[#EFE6D5] rounded-xl cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-2 text-xs text-[#4A3525] leading-relaxed">
              <p>
                آیا مطمئن هستید که می‌خواهید کل پیشرفت{' '}
                <strong className="font-extrabold text-[#2A1D15]">{participant.fullName}</strong> در
                مسابقه «{contest.title}» را بازنشانی کنید؟
              </p>
              <p className="text-[#7A6A5B]">
                مراحل تکمیل‌شده، امتیاز فعلی، پاسخ‌های ثبت‌شده و راهنمایی‌های استفاده‌شده صفر خواهد شد و دانش‌آموز از مرحله اول شروع می‌کند.
              </p>
            </div>
            <div className="px-6 py-3.5 bg-[#F3ECE0] border-t border-[#E2D9C8] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmResetOpen(false)}
                className="h-9 px-4 text-xs font-semibold text-[#4A3525] bg-[#FAF7F0] border border-[#DDD2BE] rounded-xl cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetProgress();
                  setConfirmResetOpen(false);
                }}
                className="h-9 px-4 text-xs font-bold text-[#FAF7F0] bg-[#B45309] hover:bg-[#92400E] rounded-xl cursor-pointer"
              >
                تأیید و بازنشانی پیشرفت
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: حذف از مسابقه با ثبت دلیل */}
      {removeModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#2A1D15]/45 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setRemoveModalOpen(false)}
        >
          <div
            className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[24px] w-full max-w-md overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EAE2D3]">
              <h3 className="text-sm font-extrabold text-[#B91C1C] inline-flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>حذف دانش‌آموز از مسابقه با ثبت دلیل</span>
              </h3>
              <button
                type="button"
                onClick={() => setRemoveModalOpen(false)}
                className="p-1.5 text-[#7A6A5B] hover:bg-[#EFE6D5] rounded-xl cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <p className="text-xs text-[#4A3525] leading-relaxed">
                حذف <strong className="font-extrabold text-[#2A1D15]">{participant.fullName}</strong>{' '}
                از مسابقه «{contest.title}» در گزارش فعالیت‌های اخیر سامانه ثبت خواهد شد.
              </p>
              <div>
                <label className="block text-xs font-bold text-[#4A3525] mb-1.5">
                  دلیل حذف از مسابقه *
                </label>
                <textarea
                  rows={3}
                  value={removeReason}
                  onChange={(e) => {
                    setRemoveReason(e.target.value);
                    setRemoveError('');
                  }}
                  placeholder="مثال: انصراف کتبی دانش‌آموز، نقض قوانین مسابقه یا ثبت‌نام تکراری..."
                  className="w-full p-3 text-xs text-[#2A1D15] placeholder:text-[#9C8D7E] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-white focus:outline-none focus:border-[#B91C1C]"
                />
                {removeError && (
                  <p className="mt-1 text-[11px] font-semibold text-[#B91C1C]">{removeError}</p>
                )}
              </div>
            </div>
            <div className="px-6 py-3.5 bg-[#F3ECE0] border-t border-[#E2D9C8] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRemoveModalOpen(false)}
                className="h-9 px-4 text-xs font-semibold text-[#4A3525] bg-[#FAF7F0] border border-[#DDD2BE] rounded-xl cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleConfirmRemove}
                className="h-9 px-4 text-xs font-bold text-[#FAF7F0] bg-[#B91C1C] hover:bg-[#991B1B] rounded-xl cursor-pointer"
              >
                ثبت دلیل و حذف از مسابقه
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
