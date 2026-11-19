import {
  ArrowUpDown,
  Award,
  Eye,
  Layers,
  Pause,
  Pencil,
  Play,
  Trash2,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { Contest } from '../types/contest';
import {
  formatJalaliDate,
  formatPersianNumber,
  getContestMetrics,
  STATUS_META,
  toPersianDigits,
} from '../data/initialData';

interface ContestTableProps {
  contests: Contest[];
  onViewDetails: (id: string) => void;
  onEdit: (id: string) => void;
  onManageStages: (id: string) => void;
  onViewParticipants: (id: string) => void;
  onViewResults: (id: string) => void;
  onTogglePause: (id: string) => void;
  onDelete: (id: string) => void;
}

type SortKey = 'title' | 'stages' | 'participants' | 'completers' | 'winners' | 'startDate';

export function ContestTable({
  contests,
  onViewDetails,
  onEdit,
  onManageStages,
  onViewParticipants,
  onViewResults,
  onTogglePause,
  onDelete,
}: ContestTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('startDate');
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc((prev) => !prev);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const sortedContests = [...contests].sort((a, b) => {
    const ma = getContestMetrics(a);
    const mb = getContestMetrics(b);
    let cmp = 0;
    switch (sortKey) {
      case 'title':
        cmp = a.title.localeCompare(b.title, 'fa');
        break;
      case 'stages':
        cmp = ma.stageCount - mb.stageCount;
        break;
      case 'participants':
        cmp = ma.participantsCount - mb.participantsCount;
        break;
      case 'completers':
        cmp = ma.completersCount - mb.completersCount;
        break;
      case 'winners':
        cmp = ma.winnersCount - mb.winnersCount;
        break;
      case 'startDate':
        cmp = a.startDate.localeCompare(b.startDate);
        break;
    }
    return sortAsc ? cmp : -cmp;
  });

  const renderSortButton = (label: string, key: SortKey) => (
    <button
      type="button"
      onClick={() => handleSort(key)}
      className="inline-flex items-center gap-1 text-xs font-bold text-[#5D3F2A] hover:text-[#2A1D15] whitespace-nowrap cursor-pointer"
    >
      <span>{label}</span>
      <ArrowUpDown
        className={`w-3 h-3 ${sortKey === key ? 'text-[#5D3F2A]' : 'text-[#A89A8A]'}`}
        aria-hidden="true"
      />
    </button>
  );

  return (
    <div className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[22px] overflow-hidden shadow-[0_2px_10px_rgba(78,52,34,0.04)]">
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse min-w-[920px]">
          <thead>
            <tr className="border-b border-[#E2D9C8] bg-[#F3ECE0]/90">
              <th className="py-3.5 px-4">{renderSortButton('عنوان مسابقه', 'title')}</th>
              <th className="py-3.5 px-3">{renderSortButton('مراحل', 'stages')}</th>
              <th className="py-3.5 px-3">{renderSortButton('شرکت‌کنندگان', 'participants')}</th>
              <th className="py-3.5 px-3">{renderSortButton('تکمیل‌کنندگان', 'completers')}</th>
              <th className="py-3.5 px-3">{renderSortButton('برندگان', 'winners')}</th>
              <th className="py-3.5 px-3">{renderSortButton('شروع / پایان', 'startDate')}</th>
              <th className="py-3.5 px-3 text-xs font-bold text-[#5D3F2A] whitespace-nowrap">
                وضعیت
              </th>
              <th className="py-3.5 px-4 text-xs font-bold text-[#5D3F2A] whitespace-nowrap text-left">
                عملیات
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EAE2D3] text-sm">
            {sortedContests.map((contest) => {
              const metrics = getContestMetrics(contest);
              const statusInfo = STATUS_META[contest.status];
              const isActive = contest.status === 'active';
              const canPauseOrResume = contest.status !== 'ended';

              return (
                <tr
                  key={contest.id}
                  className="hover:bg-[#F3ECE0]/60 transition-colors duration-100"
                >
                  <td className="py-3.5 px-4 max-w-[260px]">
                    <button
                      type="button"
                      onClick={() => onViewDetails(contest.id)}
                      className="text-right font-bold text-[#2A1D15] hover:text-[#5D3F2A] transition-colors block truncate max-w-full cursor-pointer"
                    >
                      {contest.title}
                    </button>
                    <p className="text-xs text-[#7A6A5B] mt-0.5 truncate">
                      {contest.category} · <span className="font-mono text-[11px]">{contest.code}</span>
                    </p>
                  </td>
                  <td className="py-3.5 px-3 tabular-nums font-semibold text-[#2A1D15] whitespace-nowrap">
                    {formatPersianNumber(metrics.stageCount)}
                  </td>
                  <td className="py-3.5 px-3 tabular-nums font-semibold text-[#2A1D15] whitespace-nowrap">
                    {formatPersianNumber(metrics.participantsCount)}
                  </td>
                  <td className="py-3.5 px-3 tabular-nums whitespace-nowrap">
                    <span className="font-semibold text-[#2A1D15]">
                      {formatPersianNumber(metrics.completersCount)}
                    </span>
                    <span className="text-xs text-[#8C7C6D] mr-1.5">
                      ({toPersianDigits(metrics.completionRate)}٪)
                    </span>
                  </td>
                  <td className="py-3.5 px-3 tabular-nums font-bold text-[#0F766E] whitespace-nowrap">
                    {formatPersianNumber(metrics.winnersCount)}
                  </td>
                  <td className="py-3.5 px-3 text-xs text-[#5D3F2A] tabular-nums whitespace-nowrap">
                    <div>{formatJalaliDate(contest.startDate)}</div>
                    <div className="text-[#8C7C6D]">{formatJalaliDate(contest.endDate)}</div>
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <span className={`text-xs font-bold ${statusInfo.textClass}`}>
                      {statusInfo.label}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onViewDetails(contest.id)}
                        title="مشاهده جزئیات"
                        aria-label={`مشاهده جزئیات ${contest.title}`}
                        className="p-2 text-[#6B4C35] hover:text-[#2A1D15] hover:bg-[#EFE6D5] rounded-xl transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(contest.id)}
                        title="ویرایش"
                        aria-label={`ویرایش ${contest.title}`}
                        className="p-2 text-[#6B4C35] hover:text-[#2A1D15] hover:bg-[#EFE6D5] rounded-xl transition-colors cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onManageStages(contest.id)}
                        title="مدیریت مراحل"
                        aria-label={`مدیریت مراحل ${contest.title}`}
                        className="p-2 text-[#6B4C35] hover:text-[#2A1D15] hover:bg-[#EFE6D5] rounded-xl transition-colors cursor-pointer"
                      >
                        <Layers className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onViewParticipants(contest.id)}
                        title="مشاهده شرکت‌کنندگان"
                        aria-label={`مشاهده شرکت‌کنندگان ${contest.title}`}
                        className="p-2 text-[#6B4C35] hover:text-[#2A1D15] hover:bg-[#EFE6D5] rounded-xl transition-colors cursor-pointer"
                      >
                        <Users className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onViewResults(contest.id)}
                        title="مشاهده نتایج"
                        aria-label={`مشاهده نتایج ${contest.title}`}
                        className="p-2 text-[#0F766E] hover:bg-[#DFEFEA] rounded-xl transition-colors cursor-pointer"
                      >
                        <Award className="w-4 h-4" />
                      </button>
                      {canPauseOrResume && (
                        <button
                          type="button"
                          onClick={() => onTogglePause(contest.id)}
                          title={isActive ? 'توقف مسابقه' : 'ادامه یا فعال‌سازی مسابقه'}
                          aria-label={isActive ? `توقف ${contest.title}` : `فعال‌سازی ${contest.title}`}
                          className={`p-2 rounded-xl transition-colors cursor-pointer ${
                            isActive
                              ? 'text-[#B45309] hover:bg-[#FEF3C7]/70'
                              : 'text-[#0F766E] hover:bg-[#DFEFEA]'
                          }`}
                        >
                          {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onDelete(contest.id)}
                        title="حذف مسابقه"
                        aria-label={`حذف ${contest.title}`}
                        className="p-2 text-[#B91C1C] hover:bg-[#FEE2E2]/70 rounded-xl transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
