import { Award, Layers, Pause, Pencil, Play, Users, X } from 'lucide-react';
import { Contest } from '../../types/contest';
import {
  formatJalaliLongDate,
  formatPersianNumber,
  getContestMetrics,
  STATUS_META,
  toPersianDigits,
} from '../../data/initialData';

interface ContestDetailsModalProps {
  contest: Contest;
  onClose: () => void;
  onEdit: () => void;
  onManageStages: () => void;
  onViewParticipants: () => void;
  onViewResults: () => void;
  onTogglePause: () => void;
}

export function ContestDetailsModal({
  contest,
  onClose,
  onEdit,
  onManageStages,
  onViewParticipants,
  onViewResults,
  onTogglePause,
}: ContestDetailsModalProps) {
  const metrics = getContestMetrics(contest);
  const statusInfo = STATUS_META[contest.status];
  const maxStagePoints = contest.stages.reduce((acc, s) => acc + s.points, 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2A1D15]/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contest-details-title"
      onClick={onClose}
    >
      <div
        className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[24px] w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-[#EAE2D3]">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#7A6A5B]">
              <span>{contest.category}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono" dir="ltr">
                {contest.code}
              </span>
              <span aria-hidden="true">·</span>
              <span className={`font-bold ${statusInfo.textClass}`}>{statusInfo.label}</span>
            </div>
            <h2 id="contest-details-title" className="mt-1 text-lg font-extrabold text-[#2A1D15]">
              {contest.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن جزئیات"
            className="p-2 text-[#7A6A5B] hover:text-[#2A1D15] hover:bg-[#EFE6D5] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Description & Prize */}
          <div className="space-y-2.5">
            <p className="text-sm text-[#4A3525] leading-relaxed">{contest.description}</p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-[#7A6A5B] pt-1">
              <span>
                شروع:{' '}
                <strong className="font-bold text-[#2A1D15]">
                  {formatJalaliLongDate(contest.startDate)}
                </strong>
              </span>
              <span>
                پایان:{' '}
                <strong className="font-bold text-[#2A1D15]">
                  {formatJalaliLongDate(contest.endDate)}
                </strong>
              </span>
              <span>
                جایزه:{' '}
                <strong className="font-bold text-[#2A1D15]">{contest.prizeSummary}</strong>
              </span>
            </div>
          </div>

          {/* Summary Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-[#EAE2D3]">
            <div>
              <p className="text-xs text-[#7A6A5B]">تعداد مراحل</p>
              <p className="mt-1 text-lg font-extrabold text-[#2A1D15] tabular-nums">
                {formatPersianNumber(metrics.stageCount)}
              </p>
              <p className="text-[11px] text-[#8C7C6D] tabular-nums">
                مجموع {formatPersianNumber(maxStagePoints)} امتیاز
              </p>
            </div>
            <div>
              <p className="text-xs text-[#7A6A5B]">شرکت‌کنندگان</p>
              <p className="mt-1 text-lg font-extrabold text-[#2A1D15] tabular-nums">
                {formatPersianNumber(metrics.participantsCount)}
              </p>
              <p className="text-[11px] text-[#8C7C6D]">ثبت‌نام قطعی</p>
            </div>
            <div>
              <p className="text-xs text-[#7A6A5B]">تکمیل‌کنندگان</p>
              <p className="mt-1 text-lg font-extrabold text-[#2A1D15] tabular-nums">
                {formatPersianNumber(metrics.completersCount)}
              </p>
              <p className="text-[11px] text-[#0F766E] font-medium tabular-nums">
                {toPersianDigits(metrics.completionRate)}٪ نرخ تکمیل
              </p>
            </div>
            <div>
              <p className="text-xs text-[#7A6A5B]">برندگان</p>
              <p className="mt-1 text-lg font-extrabold text-[#0F766E] tabular-nums">
                {formatPersianNumber(metrics.winnersCount)}
              </p>
              <p className="text-[11px] text-[#8C7C6D]">منتخب نهایی</p>
            </div>
          </div>

          {/* Stage Funnel Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-extrabold text-[#2A1D15]">ساختار و پیشرفت مراحل</h3>
              <button
                type="button"
                onClick={onManageStages}
                className="text-xs font-bold text-[#5D3F2A] hover:underline cursor-pointer"
              >
                ویرایش مراحل
              </button>
            </div>

            {contest.stages.length === 0 ? (
              <p className="text-xs text-[#7A6A5B] py-4">هنوز مرحله‌ای برای این مسابقه تعریف نشده است.</p>
            ) : (
              <div className="space-y-2.5">
                {contest.stages.map((stage, idx) => {
                  const stageRate =
                    metrics.participantsCount > 0
                      ? Math.min(100, Math.round((stage.completedCount / metrics.participantsCount) * 100))
                      : 0;
                  return (
                    <div
                      key={stage.id}
                      className="p-3.5 bg-[#FCFBF8] border border-[#E5DCCB] rounded-2xl"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-[#2A1D15]">
                          {toPersianDigits(idx + 1)}. {stage.title}
                        </p>
                        <span className="text-xs text-[#7A6A5B] tabular-nums whitespace-nowrap">
                          {formatPersianNumber(stage.points)} امتیاز ·{' '}
                          {stage.required ? 'الزامی' : 'اختیاری'}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[#7A6A5B]">{stage.description}</p>
                      <div className="mt-2.5 flex items-center gap-3">
                        <div className="flex-1 h-2 bg-[#E6DCC9] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#5D3F2A] rounded-full"
                            style={{ width: `${stageRate}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-medium text-[#6B4C35] tabular-nums whitespace-nowrap">
                          {formatPersianNumber(stage.completedCount)} تکمیل ({toPersianDigits(stageRate)}٪)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Quick Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-3.5 bg-[#F3ECE0] border-t border-[#E2D9C8]">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-[#4A3525] bg-[#FAF7F0] border border-[#DDD2BE] hover:bg-[#EFE6D5] rounded-xl transition-colors whitespace-nowrap cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>ویرایش</span>
            </button>
            <button
              type="button"
              onClick={onManageStages}
              className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-[#4A3525] bg-[#FAF7F0] border border-[#DDD2BE] hover:bg-[#EFE6D5] rounded-xl transition-colors whitespace-nowrap cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>مدیریت مراحل</span>
            </button>
            <button
              type="button"
              onClick={onViewParticipants}
              className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-[#4A3525] bg-[#FAF7F0] border border-[#DDD2BE] hover:bg-[#EFE6D5] rounded-xl transition-colors whitespace-nowrap cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>شرکت‌کنندگان</span>
            </button>
            <button
              type="button"
              onClick={onViewResults}
              className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-bold text-[#0F766E] bg-[#DFEFEA] border border-[#C6E2DA] hover:bg-[#D0E7E0] rounded-xl transition-colors whitespace-nowrap cursor-pointer"
            >
              <Award className="w-3.5 h-3.5" />
              <span>نتایج</span>
            </button>
          </div>

          {contest.status !== 'ended' && (
            <button
              type="button"
              onClick={onTogglePause}
              className={`inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-bold rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
                contest.status === 'active'
                  ? 'bg-[#B45309] text-[#FAF7F0] hover:bg-[#92400E]'
                  : 'bg-[#0F766E] text-[#FAF7F0] hover:bg-[#115E59]'
              }`}
            >
              {contest.status === 'active' ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>توقف مسابقه</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>فعال‌سازی مسابقه</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
