import {
  Award,
  CheckCircle2,
  FileEdit,
  PlayCircle,
  Trophy,
  Users,
} from 'lucide-react';
import { Contest, ContestStatus } from '../types/contest';
import { formatPersianNumber, getContestMetrics, toPersianDigits } from '../data/initialData';

interface StatCardsProps {
  contests: Contest[];
  activeStatusFilter: ContestStatus | 'all';
  onFilterByStatus: (status: ContestStatus | 'all') => void;
}

export function StatCards({
  contests,
  activeStatusFilter,
  onFilterByStatus,
}: StatCardsProps) {
  const totalContests = contests.length;
  const activeContests = contests.filter((c) => c.status === 'active').length;
  const draftContests = contests.filter((c) => c.status === 'draft').length;

  let totalParticipants = 0;
  let totalCompleters = 0;
  let totalWinners = 0;

  for (const contest of contests) {
    const m = getContestMetrics(contest);
    totalParticipants += m.participantsCount;
    totalCompleters += m.completersCount;
    totalWinners += m.winnersCount;
  }

  const overallCompletionRate =
    totalParticipants > 0 ? Math.round((totalCompleters / totalParticipants) * 100) : 0;

  const cards: Array<{
    id: string;
    label: string;
    value: string;
    unit: string;
    subtext: string;
    subtextTeal?: boolean;
    iconTone: 'sand' | 'teal';
    icon: typeof Trophy;
    filterTarget?: ContestStatus | 'all';
  }> = [
    {
      id: 'total',
      label: 'کل مسابقات',
      value: formatPersianNumber(totalContests),
      unit: 'مسابقه',
      subtext: `${toPersianDigits(contests.filter((c) => c.status === 'ended').length)} مسابقه پایان‌یافته`,
      iconTone: 'sand',
      icon: Trophy,
      filterTarget: 'all',
    },
    {
      id: 'active',
      label: 'مسابقات فعال',
      value: formatPersianNumber(activeContests),
      unit: 'مسابقه',
      subtext: 'در حال اجرا و پذیرش',
      subtextTeal: true,
      iconTone: 'teal',
      icon: PlayCircle,
      filterTarget: 'active',
    },
    {
      id: 'draft',
      label: 'مسابقات پیش‌نویس',
      value: formatPersianNumber(draftContests),
      unit: 'مسابقه',
      subtext: 'در انتظار انتشار نهایی',
      iconTone: 'sand',
      icon: FileEdit,
      filterTarget: 'draft',
    },
    {
      id: 'participants',
      label: 'کل شرکت‌کنندگان',
      value: formatPersianNumber(totalParticipants),
      unit: 'نفر',
      subtext: 'عضو ثبت‌نام‌شده در مسابقات',
      subtextTeal: true,
      iconTone: 'sand',
      icon: Users,
    },
    {
      id: 'completers',
      label: 'تعداد تکمیل‌کنندگان',
      value: formatPersianNumber(totalCompleters),
      unit: 'نفر',
      subtext: `نرخ تکمیل ${toPersianDigits(overallCompletionRate)}٪`,
      iconTone: 'teal',
      icon: CheckCircle2,
    },
    {
      id: 'winners',
      label: 'تعداد برندگان',
      value: formatPersianNumber(totalWinners),
      unit: 'نفر',
      subtext: 'تأییدشده در جدول نتایج',
      iconTone: 'sand',
      icon: Award,
    },
  ];

  return (
    <section aria-label="آمار کلی مسابقات">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          const isFilterable = card.filterTarget !== undefined;
          const isSelected =
            isFilterable &&
            activeStatusFilter === card.filterTarget &&
            card.filterTarget !== 'all';

          const baseClass = `w-full text-right bg-[#FAF7F0] rounded-[20px] border px-5 py-4 flex items-center justify-between gap-4 shadow-[0_2px_10px_rgba(78,52,34,0.04)] transition-colors duration-150 ${
            isSelected
              ? 'border-[#5D3F2A] ring-1 ring-[#5D3F2A]/25'
              : 'border-[#E2D9C8] hover:border-[#CFC2AC]'
          }`;

          const innerContent = (
            <>
              <div className="min-w-0">
                <p className="text-xs font-medium text-[#7A6A5B] whitespace-nowrap truncate">
                  {card.label}
                </p>
                <p className="mt-1.5 text-2xl font-extrabold tracking-tight text-[#2A1D15] tabular-nums whitespace-nowrap">
                  {card.value}{' '}
                  <span className="text-sm font-bold text-[#4A3525]">{card.unit}</span>
                </p>
                <p
                  className={`mt-1.5 text-xs font-medium truncate ${
                    card.subtextTeal ? 'text-[#0F766E]' : 'text-[#8C7C6D]'
                  }`}
                >
                  {card.subtext}
                </p>
              </div>

              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                  card.iconTone === 'teal'
                    ? 'bg-[#DFEFEA] text-[#0F766E]'
                    : 'bg-[#EFE6D5] text-[#6B4C35]'
                }`}
                aria-hidden="true"
              >
                <Icon className="w-5 h-5" />
              </div>
            </>
          );

          if (isFilterable) {
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => onFilterByStatus(card.filterTarget!)}
                className={`${baseClass} cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5D3F2A] focus-visible:ring-offset-1`}
              >
                {innerContent}
              </button>
            );
          }

          return (
            <div key={card.id} className={baseClass}>
              {innerContent}
            </div>
          );
        })}
      </div>
    </section>
  );
}
