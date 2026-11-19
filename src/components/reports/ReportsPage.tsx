import {
  AlertOctagon,
  Award,
  BarChart3,
  Clock,
  Download,
  Eye,
  HelpCircle,
  PlayCircle,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Contest } from '../../types/contest';
import {
  formatPersianNumber,
  getContestMetrics,
  STATUS_META,
  toPersianDigits,
} from '../../data/initialData';
import {
  computeAnalyticsSummary,
  formatDurationPersian,
} from '../../data/participantAnalytics';

interface ReportsPageProps {
  contests: Contest[];
  onInspectContestDetails: (contestId: string) => void;
  onInspectContestResults: (contestId: string) => void;
}

export function ReportsPage({
  contests,
  onInspectContestDetails,
  onInspectContestResults,
}: ReportsPageProps) {
  const [selectedContestId, setSelectedContestId] = useState<string | 'all'>('all');

  const summary = useMemo(
    () => computeAnalyticsSummary(contests, selectedContestId),
    [contests, selectedContestId]
  );

  const maxParticipation = Math.max(
    1,
    ...summary.participationByContest.map((item) => item.participants)
  );

  const handleExportReportCsv = (targetContest?: Contest) => {
    const list = targetContest ? [targetContest] : contests;
    const header = [
      'عنوان مسابقه',
      'کد',
      'تعداد مراحل',
      'تعداد شرکت‌کنندگان',
      'تکمیل‌کنندگان',
      'نرخ تکمیل (%)',
      'برندگان',
      'وضعیت',
    ];
    const rows = list.map((c) => {
      const m = getContestMetrics(c);
      return [
        c.title,
        c.code,
        String(m.stageCount),
        String(m.participantsCount),
        String(m.completersCount),
        String(m.completionRate),
        String(m.winnersCount),
        STATUS_META[c.status].label,
      ];
    });
    const csv = '\uFEFF' + [header, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = targetContest ? `report-${targetContest.code}.csv` : 'contests-analytics-report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <header className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[22px] px-5 sm:px-6 py-4 shadow-[0_2px_10px_rgba(78,52,34,0.04)] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-base sm:text-lg font-extrabold text-[#2A1D15]">گزارش‌ها و آمارها</h1>
          <p className="mt-0.5 text-xs text-[#7A6A5B]">
            تحلیل جامع نرخ شروع و تکمیل، سخت‌ترین مراحل، توقف دانش‌آموزان، خطاها و مشارکت هر مسابقه
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedContestId}
            onChange={(e) => setSelectedContestId(e.target.value)}
            aria-label="فیلتر گزارش بر اساس مسابقه"
            className="h-10 px-3.5 text-xs font-bold text-[#3A2A1E] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-[#FCFBF8] focus:outline-none focus:border-[#5D3F2A] cursor-pointer"
          >
            <option value="all">گزارش تجمیعی کل مسابقات</option>
            {contests.map((c) => (
              <option key={c.id} value={c.id}>
                تحلیل: {c.title}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => handleExportReportCsv()}
            className="inline-flex items-center gap-1.5 h-10 px-4 text-xs font-bold text-[#FAF7F0] bg-[#5D3F2A] hover:bg-[#4A3120] rounded-2xl transition-colors whitespace-nowrap cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>خروجی CSV گزارش</span>
          </button>
        </div>
      </header>

      {/* 9 Quantitative Analytics KPI Cards */}
      <section aria-label="شاخص‌های تحلیلی مسابقات" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <div className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[20px] p-5 flex items-center justify-between gap-3 shadow-[0_2px_10px_rgba(78,52,34,0.04)]">
          <div>
            <p className="text-xs font-medium text-[#7A6A5B]">تعداد کل شرکت‌کنندگان</p>
            <p className="mt-1.5 text-2xl font-extrabold text-[#2A1D15] tabular-nums">
              {formatPersianNumber(summary.totalParticipants)}{' '}
              <span className="text-xs font-bold text-[#6B4C35]">نفر</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#EFE6D5] text-[#5D3F2A] flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[20px] p-5 flex items-center justify-between gap-3 shadow-[0_2px_10px_rgba(78,52,34,0.04)]">
          <div>
            <p className="text-xs font-medium text-[#7A6A5B]">نرخ شروع مسابقه</p>
            <p className="mt-1.5 text-2xl font-extrabold text-[#0F766E] tabular-nums">
              {toPersianDigits(summary.startRate)}٪
            </p>
            <p className="mt-1 text-[11px] text-[#7A6A5B]">نسبت آغازکنندگان به کل ثبت‌نامی‌ها</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#DFEFEA] text-[#0F766E] flex items-center justify-center shrink-0">
            <PlayCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[20px] p-5 flex items-center justify-between gap-3 shadow-[0_2px_10px_rgba(78,52,34,0.04)]">
          <div>
            <p className="text-xs font-medium text-[#7A6A5B]">نرخ تکمیل مسابقه</p>
            <p className="mt-1.5 text-2xl font-extrabold text-[#2A1D15] tabular-nums">
              {toPersianDigits(summary.completionRate)}٪
            </p>
            <p className="mt-1 text-[11px] text-[#0F766E] font-medium tabular-nums">
              {formatPersianNumber(summary.totalCompleters)} تکمیل‌کننده موفق
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#DFEFEA] text-[#0F766E] flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[20px] p-5 flex items-center justify-between gap-3 shadow-[0_2px_10px_rgba(78,52,34,0.04)]">
          <div>
            <p className="text-xs font-medium text-[#7A6A5B]">میانگین زمان تکمیل</p>
            <p className="mt-1.5 text-lg font-extrabold text-[#2A1D15] tabular-nums">
              {formatDurationPersian(summary.avgCompletionMinutes)}
            </p>
            <p className="mt-1 text-[11px] text-[#7A6A5B]">بر اساس دانش‌آموزان تکمیل‌کننده</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#EFE6D5] text-[#5D3F2A] flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[20px] p-5 flex items-center justify-between gap-3 shadow-[0_2px_10px_rgba(78,52,34,0.04)]">
          <div className="min-w-0">
            <p className="text-xs font-medium text-[#7A6A5B]">سخت‌ترین مرحله</p>
            <p className="mt-1.5 text-sm font-extrabold text-[#2A1D15] truncate">
              {summary.hardestStage?.title ?? '—'}
            </p>
            <p className="mt-1 text-[11px] text-[#B45309] font-medium truncate">
              {summary.hardestStage
                ? `نرخ ریزش ${toPersianDigits(summary.hardestStage.dropRate)}٪ · ${summary.hardestStage.contestTitle}`
                : 'داده‌ای ثبت نشده'}
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#FEF3C7] text-[#B45309] flex items-center justify-center shrink-0">
            <AlertOctagon className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[20px] p-5 flex items-center justify-between gap-3 shadow-[0_2px_10px_rgba(78,52,34,0.04)]">
          <div className="min-w-0">
            <p className="text-xs font-medium text-[#7A6A5B]">
              مرحله‌ای که بیشترین دانش‌آموز در آن متوقف شده‌اند
            </p>
            <p className="mt-1.5 text-sm font-extrabold text-[#2A1D15] truncate">
              {summary.mostStoppedStage?.title ?? '—'}
            </p>
            <p className="mt-1 text-[11px] text-[#B91C1C] font-medium truncate tabular-nums">
              {summary.mostStoppedStage
                ? `${formatPersianNumber(summary.mostStoppedStage.stoppedCount)} توقف · ${summary.mostStoppedStage.contestTitle}`
                : 'داده‌ای ثبت نشده'}
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#FEE2E2]/70 text-[#B91C1C] flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[20px] p-5 flex items-center justify-between gap-3 shadow-[0_2px_10px_rgba(78,52,34,0.04)]">
          <div>
            <p className="text-xs font-medium text-[#7A6A5B]">میانگین تعداد تلاش‌های اشتباه</p>
            <p className="mt-1.5 text-2xl font-extrabold text-[#2A1D15] tabular-nums">
              {toPersianDigits(summary.avgWrongAttempts)}{' '}
              <span className="text-xs font-bold text-[#6B4C35]">بار / دانش‌آموز</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#EFE6D5] text-[#5D3F2A] flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[20px] p-5 flex items-center justify-between gap-3 shadow-[0_2px_10px_rgba(78,52,34,0.04)]">
          <div>
            <p className="text-xs font-medium text-[#7A6A5B]">تعداد دفعات استفاده از راهنمایی</p>
            <p className="mt-1.5 text-2xl font-extrabold text-[#2A1D15] tabular-nums">
              {formatPersianNumber(summary.totalHintsUsed)}{' '}
              <span className="text-xs font-bold text-[#6B4C35]">مرتبه</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#EFE6D5] text-[#5D3F2A] flex items-center justify-center shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[20px] p-5 flex items-center justify-between gap-3 shadow-[0_2px_10px_rgba(78,52,34,0.04)]">
          <div>
            <p className="text-xs font-medium text-[#7A6A5B]">تعداد برندگان</p>
            <p className="mt-1.5 text-2xl font-extrabold text-[#0F766E] tabular-nums">
              {formatPersianNumber(summary.totalWinners)}{' '}
              <span className="text-xs font-bold text-[#0F766E]">برنده</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-[#DFEFEA] text-[#0F766E] flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </section>

      {/* 10th Metric: میزان مشارکت در هر مسابقه (Horizontal Visual Comparison) */}
      <section className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[22px] p-5 shadow-[0_2px_10px_rgba(78,52,34,0.04)] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D3]">
          <h2 className="text-sm font-extrabold text-[#2A1D15] inline-flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#5D3F2A]" />
            <span>میزان مشارکت در هر مسابقه</span>
          </h2>
          <span className="text-xs text-[#7A6A5B]">مقایسه تعداد شرکت‌کنندگان و نرخ تکمیل</span>
        </div>

        <div className="space-y-3.5">
          {summary.participationByContest.map((item) => {
            const widthPct = Math.max(4, Math.round((item.participants / maxParticipation) * 100));
            return (
              <div key={item.contestId} className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-bold text-[#2A1D15]">{item.title}</span>
                  <span className="text-[#6B4C35] tabular-nums">
                    <strong className="text-[#2A1D15]">
                      {formatPersianNumber(item.participants)}
                    </strong>{' '}
                    شرکت‌کننده · {formatPersianNumber(item.completers)} تکمیل ({toPersianDigits(item.completionRate)}٪)
                  </span>
                </div>
                <div className="h-2.5 w-full bg-[#E6DCC9] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#5D3F2A] rounded-full transition-all"
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Required Contests Report Table: عنوان مسابقه / مراحل / تعداد شرکت‌کنندگان / وضعیت / عملیات */}
      <section className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[22px] overflow-hidden shadow-[0_2px_10px_rgba(78,52,34,0.04)]">
        <div className="px-5 py-4 border-b border-[#EAE2D3] flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-[#2A1D15]">جدول گزارش مسابقات</h2>
          {selectedContestId !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedContestId('all')}
              className="text-xs font-bold text-[#0F766E] hover:underline cursor-pointer"
            >
              نمایش آمار کل مسابقات
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse min-w-[760px]">
            <thead>
              <tr className="border-b border-[#E2D9C8] bg-[#F3ECE0]/90 text-xs text-[#5D3F2A]">
                <th className="py-3.5 px-5 font-bold">عنوان مسابقه</th>
                <th className="py-3.5 px-4 font-bold">مراحل</th>
                <th className="py-3.5 px-4 font-bold">تعداد شرکت‌کنندگان</th>
                <th className="py-3.5 px-4 font-bold">وضعیت</th>
                <th className="py-3.5 px-5 font-bold text-left">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE2D3] text-xs">
              {contests.map((contest) => {
                const m = getContestMetrics(contest);
                const statusMeta = STATUS_META[contest.status];
                const isSelected = selectedContestId === contest.id;
                return (
                  <tr
                    key={contest.id}
                    className={`hover:bg-[#F3ECE0]/60 transition-colors ${
                      isSelected ? 'bg-[#DFEFEA]/40' : ''
                    }`}
                  >
                    <td className="py-3.5 px-5">
                      <p className="font-bold text-[#2A1D15]">{contest.title}</p>
                      <p className="text-[11px] text-[#7A6A5B] mt-0.5">
                        {contest.category} · <span className="font-mono">{contest.code}</span>
                      </p>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#2A1D15] tabular-nums whitespace-nowrap">
                      {formatPersianNumber(m.stageCount)} مرحله
                    </td>
                    <td className="py-3.5 px-4 tabular-nums whitespace-nowrap">
                      <span className="font-extrabold text-[#2A1D15]">
                        {formatPersianNumber(m.participantsCount)} نفر
                      </span>
                      <span className="text-[#8C7C6D] mr-1.5">
                        (تکمیل {toPersianDigits(m.completionRate)}٪)
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`font-bold ${statusMeta.textClass}`}>{statusMeta.label}</span>
                    </td>
                    <td className="py-3.5 px-5 text-left whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedContestId(isSelected ? 'all' : contest.id)
                          }
                          className={`h-8 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[#0F766E] text-[#FAF7F0]'
                              : 'bg-[#DFEFEA] text-[#0F766E] hover:bg-[#D0E7E0]'
                          }`}
                        >
                          {isSelected ? 'در حال تحلیل' : 'تحلیل آماری'}
                        </button>
                        <button
                          type="button"
                          onClick={() => onInspectContestDetails(contest.id)}
                          title="مشاهده جزئیات"
                          className="h-8 px-2.5 text-[#5D3F2A] bg-[#F3ECE0] hover:bg-[#EAE0CE] border border-[#DDD2BE] rounded-xl inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>جزئیات</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onInspectContestResults(contest.id)}
                          title="مشاهده نتایج"
                          className="h-8 px-2.5 text-[#5D3F2A] bg-[#F3ECE0] hover:bg-[#EAE0CE] border border-[#DDD2BE] rounded-xl inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>نتایج</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleExportReportCsv(contest)}
                          title="خروجی CSV"
                          className="p-2 text-[#6B4C35] hover:bg-[#EFE6D5] rounded-xl cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
