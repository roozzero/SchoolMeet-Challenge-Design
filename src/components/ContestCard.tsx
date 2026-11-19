import {
  ArrowLeft,
  Award,
  Layers,
  Pause,
  Pencil,
  Play,
  Trash2,
  Users,
} from 'lucide-react';
import { Contest } from '../types/contest';
import {
  formatJalaliDate,
  formatPersianNumber,
  getContestMetrics,
  STATUS_META,
  toPersianDigits,
} from '../data/initialData';

interface ContestCardProps {
  contest: Contest;
  onViewDetails: (id: string) => void;
  onEdit: (id: string) => void;
  onManageStages: (id: string) => void;
  onViewParticipants: (id: string) => void;
  onViewResults: (id: string) => void;
  onTogglePause: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ContestCard({
  contest,
  onViewDetails,
  onEdit,
  onManageStages,
  onViewParticipants,
  onViewResults,
  onTogglePause,
  onDelete,
}: ContestCardProps) {
  const metrics = getContestMetrics(contest);
  const statusInfo = STATUS_META[contest.status];
  const canPauseOrResume = contest.status !== 'ended';
  const isActive = contest.status === 'active';

  return (
    <article className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[22px] p-5 flex flex-col justify-between shadow-[0_2px_10px_rgba(78,52,34,0.04)] hover:border-[#CFC2AC] transition-colors duration-150">
      <div>
        {/* Card Header: Title leads directly + quiet inline status */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => onViewDetails(contest.id)}
              className="text-right text-base font-extrabold text-[#2A1D15] hover:text-[#5D3F2A] transition-colors leading-snug cursor-pointer"
            >
              {contest.title}
            </button>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#7A6A5B]">
              <span>{contest.category}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-[11px] text-[#8C7C6D]" dir="ltr">
                {contest.code}
              </span>
            </div>
          </div>

          <span
            className={`text-xs font-bold whitespace-nowrap shrink-0 ${statusInfo.textClass}`}
          >
            {statusInfo.label}
          </span>
        </div>

        {/* Date Range Metadata */}
        <div className="mt-3.5 pt-3 border-t border-[#EAE2D3] flex flex-wrap items-center justify-between gap-2 text-xs text-[#7A6A5B] tabular-nums">
          <span>
            شروع: <strong className="font-semibold text-[#3A2A1E]">{formatJalaliDate(contest.startDate)}</strong>
          </span>
          <span>
            پایان: <strong className="font-semibold text-[#3A2A1E]">{formatJalaliDate(contest.endDate)}</strong>
          </span>
        </div>

        {/* Progress Bar matching reference espresso bar on sand track */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-[#7A6A5B]">تکمیل‌کنندگان مسابقه</span>
            <span className="font-bold text-[#2A1D15] tabular-nums">
              {formatPersianNumber(metrics.completersCount)} از {formatPersianNumber(metrics.participantsCount)} نفر
            </span>
          </div>
          <div className="h-2 w-full bg-[#E6DCC9] rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-200 ${
                contest.status === 'paused'
                  ? 'bg-[#B45309]'
                  : contest.status === 'ended'
                    ? 'bg-[#9C8D7E]'
                    : 'bg-[#5D3F2A]'
              }`}
              style={{ width: `${metrics.completionRate}%` }}
            />
          </div>
          <p className="mt-1.5 text-[11px] text-[#8C7C6D] tabular-nums">
            نرخ تکمیل مراحل: {toPersianDigits(metrics.completionRate)}٪
          </p>
        </div>

        {/* Hairline-divided Metric Strip */}
        <div className="mt-3.5 py-3 border-y border-[#EAE2D3] grid grid-cols-4 gap-2">
          <div>
            <p className="text-[11px] text-[#8C7C6D] whitespace-nowrap">مراحل</p>
            <p className="mt-0.5 text-sm font-extrabold text-[#2A1D15] tabular-nums">
              {formatPersianNumber(metrics.stageCount)}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-[#8C7C6D] whitespace-nowrap">شرکت‌کنندگان</p>
            <p className="mt-0.5 text-sm font-extrabold text-[#2A1D15] tabular-nums">
              {formatPersianNumber(metrics.participantsCount)}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-[#8C7C6D] whitespace-nowrap">تکمیل‌کنندگان</p>
            <p className="mt-0.5 text-sm font-extrabold text-[#2A1D15] tabular-nums">
              {formatPersianNumber(metrics.completersCount)}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-[#8C7C6D] whitespace-nowrap">برندگان</p>
            <p className="mt-0.5 text-sm font-extrabold text-[#0F766E] tabular-nums">
              {formatPersianNumber(metrics.winnersCount)}
            </p>
          </div>
        </div>
      </div>

      {/* Operations Footer: All 7 required actions */}
      <div className="mt-3.5 space-y-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => onEdit(contest.id)}
            className="inline-flex items-center gap-1.5 h-8 px-2.5 text-xs font-medium text-[#4A3525] bg-[#F3ECE0] hover:bg-[#EAE0CE] border border-[#E2D9C8] rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5 text-[#6B4C35]" aria-hidden="true" />
            <span>ویرایش</span>
          </button>

          <button
            type="button"
            onClick={() => onManageStages(contest.id)}
            className="inline-flex items-center gap-1.5 h-8 px-2.5 text-xs font-medium text-[#4A3525] bg-[#F3ECE0] hover:bg-[#EAE0CE] border border-[#E2D9C8] rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-[#6B4C35]" aria-hidden="true" />
            <span>مدیریت مراحل</span>
          </button>

          <button
            type="button"
            onClick={() => onViewParticipants(contest.id)}
            className="inline-flex items-center gap-1.5 h-8 px-2.5 text-xs font-medium text-[#4A3525] bg-[#F3ECE0] hover:bg-[#EAE0CE] border border-[#E2D9C8] rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-[#6B4C35]" aria-hidden="true" />
            <span>شرکت‌کنندگان</span>
          </button>

          <button
            type="button"
            onClick={() => onViewResults(contest.id)}
            className="inline-flex items-center gap-1.5 h-8 px-2.5 text-xs font-semibold text-[#0F766E] bg-[#DFEFEA] hover:bg-[#D0E7E0] border border-[#C6E2DA] rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Award className="w-3.5 h-3.5" aria-hidden="true" />
            <span>مشاهده نتایج</span>
          </button>
        </div>

        {/* Bottom row matching reference "مشاهده کلاس ←" link style + pause & delete */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#EAE2D3]">
          <button
            type="button"
            onClick={() => onViewDetails(contest.id)}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#5D3F2A] hover:text-[#2A1D15] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>مشاهده جزئیات</span>
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          </button>

          <div className="flex items-center gap-3">
            {canPauseOrResume && (
              <button
                type="button"
                onClick={() => onTogglePause(contest.id)}
                className={`inline-flex items-center gap-1 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'text-[#B45309] hover:text-[#92400E]'
                    : 'text-[#0F766E] hover:text-[#115E59]'
                }`}
              >
                {isActive ? (
                  <>
                    <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>توقف مسابقه</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{contest.status === 'draft' ? 'فعال‌سازی' : 'ادامه'}</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => onDelete(contest.id)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#B91C1C] hover:text-[#991B1B] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>حذف</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
