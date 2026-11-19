import { useState } from 'react';
import { ActivityCategory, ActivityItem } from '../types/contest';
import { toPersianDigits } from '../data/initialData';

interface RecentActivitiesProps {
  activities: ActivityItem[];
  onSelectContest: (contestId: string) => void;
  existingContestIds: Set<string>;
}

const CATEGORY_TABS: Array<{ value: ActivityCategory | 'all'; label: string }> = [
  { value: 'all', label: 'همه' },
  { value: 'contest', label: 'مسابقات' },
  { value: 'stage', label: 'مراحل' },
  { value: 'participant', label: 'شرکت‌کنندگان' },
  { value: 'winner', label: 'برندگان' },
];

const CATEGORY_LABEL: Record<ActivityCategory, string> = {
  contest: 'مسابقه',
  stage: 'مراحل',
  participant: 'شرکت‌کنندگان',
  winner: 'نتایج و برندگان',
};

export function RecentActivities({
  activities,
  onSelectContest,
  existingContestIds,
}: RecentActivitiesProps) {
  const [filter, setFilter] = useState<ActivityCategory | 'all'>('all');

  const visibleActivities =
    filter === 'all'
      ? activities
      : activities.filter((item) => item.category === filter);

  return (
    <section
      id="recent-activities"
      aria-label="فعالیت‌های اخیر سامانه"
      className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[24px] p-5 shadow-[0_2px_10px_rgba(78,52,34,0.04)]"
    >
      {/* Header matching screenshot: Title right, subtle label/filter left */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-extrabold text-[#2A1D15]">فعالیت‌های اخیر سامانه</h2>
          <span className="text-xs text-[#8C7C6D] tabular-nums">
            ({toPersianDigits(visibleActivities.length)} رویداد)
          </span>
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#EFE7D8] rounded-xl overflow-x-auto max-w-full">
          {CATEGORY_TABS.map((tab) => {
            const isActive = filter === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setFilter(tab.value)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#5D3F2A] text-[#FAF7F0]'
                    : 'text-[#6B4C35] hover:text-[#2A1D15]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Activity Rows matching the rounded horizontal cards in screenshot */}
      {visibleActivities.length === 0 ? (
        <div className="py-10 text-center text-xs text-[#7A6A5B] bg-[#FCFBF8] border border-[#E5DCCB] rounded-2xl">
          هنوز فعالیتی در این دسته ثبت نشده است.
        </div>
      ) : (
        <ol className="space-y-2.5">
          {visibleActivities.slice(0, 10).map((item) => {
            const canOpenContest =
              item.contestId !== undefined && existingContestIds.has(item.contestId);

            return (
              <li
                key={item.id}
                className="bg-[#FCFBF8] border border-[#E5DCCB] rounded-2xl px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:border-[#CFC2AC] transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#2A1D15] leading-snug">
                    {item.action}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#7A6A5B]">
                    <span>{item.actor}</span>
                    <span aria-hidden="true">·</span>
                    <span>{CATEGORY_LABEL[item.category]}</span>
                    <span aria-hidden="true">·</span>
                    {canOpenContest ? (
                      <button
                        type="button"
                        onClick={() => onSelectContest(item.contestId!)}
                        className="text-[#5D3F2A] hover:underline font-semibold text-right cursor-pointer"
                      >
                        {item.contestTitle}
                      </button>
                    ) : (
                      <span>{item.contestTitle}</span>
                    )}
                  </div>
                </div>

                <span className="text-xs text-[#8C7C6D] tabular-nums whitespace-nowrap shrink-0">
                  {item.timestampLabel}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
