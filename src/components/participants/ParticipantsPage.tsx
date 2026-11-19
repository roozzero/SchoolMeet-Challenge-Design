import { Award, Eye, Search, Trophy, Users, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Contest, Participant, ParticipantStatus } from '../../types/contest';
import {
  formatJalaliDate,
  formatPersianNumber,
  toPersianDigits,
} from '../../data/initialData';
import {
  formatDurationPersian,
  getCurrentStageLabel,
  getParticipantStatus,
  getStudentCode,
  PARTICIPANT_STATUS_META,
} from '../../data/participantAnalytics';

interface ParticipantsPageProps {
  contests: Contest[];
  onSelectParticipant: (contestId: string, participantId: string) => void;
}

interface FlatRow {
  contest: Contest;
  participant: Participant;
  studentCode: string;
  currentStageLabel: string;
  progressPercent: number;
  status: ParticipantStatus;
}

export function ParticipantsPage({
  contests,
  onSelectParticipant,
}: ParticipantsPageProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'leaderboard'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [contestFilter, setContestFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<ParticipantStatus | 'all'>('all');

  const allRows = useMemo<FlatRow[]>(() => {
    const list: FlatRow[] = [];
    for (const contest of contests) {
      const stageDenom = Math.max(1, contest.stages.length);
      for (const participant of contest.participants) {
        const done = Math.min(stageDenom, participant.completedStages);
        const progressPercent =
          contest.stages.length > 0 ? Math.min(100, Math.round((done / stageDenom) * 100)) : 0;
        list.push({
          contest,
          participant,
          studentCode: getStudentCode(participant),
          currentStageLabel: getCurrentStageLabel(participant, contest),
          progressPercent,
          status: getParticipantStatus(participant),
        });
      }
    }
    return list;
  }, [contests]);

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const base = allRows.filter((row) => {
      if (contestFilter !== 'all' && row.contest.id !== contestFilter) return false;
      if (statusFilter !== 'all' && row.status !== statusFilter) return false;
      if (q) {
        const match =
          row.participant.fullName.toLowerCase().includes(q) ||
          row.studentCode.includes(q) ||
          row.contest.title.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });

    if (activeTab === 'leaderboard') {
      return [...base].sort((a, b) => {
        if (a.participant.isWinner !== b.participant.isWinner) {
          return a.participant.isWinner ? -1 : 1;
        }
        if (b.participant.score !== a.participant.score) {
          return b.participant.score - a.participant.score;
        }
        return a.participant.completionTimeMinutes - b.participant.completionTimeMinutes;
      });
    }

    return base;
  }, [allRows, contestFilter, statusFilter, searchQuery, activeTab]);

  const winnersCount = allRows.filter((r) => r.status === 'winner').length;
  const completedCount = allRows.filter((r) => r.participant.isCompleted).length;
  const inProgressCount = allRows.filter((r) => r.status === 'in_progress').length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <header className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[22px] px-5 sm:px-6 py-4 shadow-[0_2px_10px_rgba(78,52,34,0.04)] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-base sm:text-lg font-extrabold text-[#2A1D15]">
            شرکت‌کنندگان، برندگان و رتبه‌بندی
          </h1>
          <p className="mt-0.5 text-xs text-[#7A6A5B]">
            مدیریت دانش‌آموزان ثبت‌نام‌شده، بررسی پیشرفت مراحل، مشاهده پرونده کامل و جدول رتبه‌بندی
          </p>
        </div>

        <div className="inline-flex items-center p-1 bg-[#EFE7D8] rounded-2xl border border-[#E2D9C8]">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`inline-flex items-center gap-1.5 h-9 px-4 text-xs font-bold rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#5D3F2A] text-[#FAF7F0]'
                : 'text-[#5D3F2A] hover:text-[#2A1D15]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>جدول شرکت‌کنندگان</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('leaderboard')}
            className={`inline-flex items-center gap-1.5 h-9 px-4 text-xs font-bold rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'leaderboard'
                ? 'bg-[#5D3F2A] text-[#FAF7F0]'
                : 'text-[#5D3F2A] hover:text-[#2A1D15]'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>برندگان و رتبه‌بندی</span>
          </button>
        </div>
      </header>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[20px] px-5 py-4 shadow-[0_2px_10px_rgba(78,52,34,0.04)]">
          <p className="text-xs font-medium text-[#7A6A5B]">کل پرونده‌های ثبت‌شده</p>
          <p className="mt-1.5 text-2xl font-extrabold text-[#2A1D15] tabular-nums">
            {formatPersianNumber(allRows.length)}{' '}
            <span className="text-xs font-bold text-[#6B4C35]">دانش‌آموز</span>
          </p>
        </div>
        <div className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[20px] px-5 py-4 shadow-[0_2px_10px_rgba(78,52,34,0.04)]">
          <p className="text-xs font-medium text-[#7A6A5B]">در حال انجام</p>
          <p className="mt-1.5 text-2xl font-extrabold text-[#5D3F2A] tabular-nums">
            {formatPersianNumber(inProgressCount)}{' '}
            <span className="text-xs font-bold text-[#6B4C35]">نفر</span>
          </p>
        </div>
        <div className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[20px] px-5 py-4 shadow-[0_2px_10px_rgba(78,52,34,0.04)]">
          <p className="text-xs font-medium text-[#7A6A5B]">تکمیل‌شده</p>
          <p className="mt-1.5 text-2xl font-extrabold text-[#2A1D15] tabular-nums">
            {formatPersianNumber(completedCount)}{' '}
            <span className="text-xs font-bold text-[#6B4C35]">نفر</span>
          </p>
        </div>
        <div className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[20px] px-5 py-4 shadow-[0_2px_10px_rgba(78,52,34,0.04)]">
          <p className="text-xs font-medium text-[#7A6A5B]">برندگان تأییدشده</p>
          <p className="mt-1.5 text-2xl font-extrabold text-[#0F766E] tabular-nums">
            {formatPersianNumber(winnersCount)}{' '}
            <span className="text-xs font-bold text-[#0F766E]">برنده</span>
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[20px] p-4 shadow-[0_2px_10px_rgba(78,52,34,0.04)] flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative flex-1 min-w-0">
          <Search
            className="w-4 h-4 text-[#8C7C6D] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی نام دانش‌آموز، شماره دانش‌آموزی یا نام مسابقه..."
            className="w-full h-10 pr-10 pl-9 text-xs text-[#2A1D15] placeholder:text-[#9C8D7E] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-[#FCFBF8] focus:outline-none focus:border-[#5D3F2A]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1 text-[#8C7C6D] hover:text-[#2A1D15] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <select
          value={contestFilter}
          onChange={(e) => setContestFilter(e.target.value)}
          aria-label="فیلتر بر اساس مسابقه"
          className="h-10 px-3 text-xs font-semibold text-[#3A2A1E] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-[#FCFBF8] focus:outline-none focus:border-[#5D3F2A] cursor-pointer"
        >
          <option value="all">همه مسابقات</option>
          {contests.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1 p-1 bg-[#EFE7D8] rounded-xl overflow-x-auto">
          {(
            [
              { id: 'all', label: 'همه' },
              { id: 'in_progress', label: 'در حال انجام' },
              { id: 'completed', label: 'تکمیل‌شده' },
              { id: 'winner', label: 'برنده' },
              { id: 'paused', label: 'متوقف‌شده' },
            ] as const
          ).map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                statusFilter === st.id
                  ? 'bg-[#5D3F2A] text-[#FAF7F0]'
                  : 'text-[#5D3F2A] hover:bg-[#E7DEC9]/70'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main 10-Column Table */}
      <div className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[22px] overflow-hidden shadow-[0_2px_10px_rgba(78,52,34,0.04)]">
        {filteredRows.length === 0 ? (
          <div className="py-14 text-center text-xs text-[#7A6A5B]">
            دانش‌آموزی مطابق با فیلترهای انتخابی یافت نشد.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse min-w-[1060px]">
              <thead>
                <tr className="border-b border-[#E2D9C8] bg-[#F3ECE0]/90 text-xs text-[#5D3F2A]">
                  {activeTab === 'leaderboard' && (
                    <th className="py-3.5 px-3 font-bold">رتبه</th>
                  )}
                  <th className="py-3.5 px-4 font-bold">نام دانش‌آموز</th>
                  <th className="py-3.5 px-3 font-bold">شماره دانش‌آموزی</th>
                  <th className="py-3.5 px-3 font-bold">مسابقه</th>
                  <th className="py-3.5 px-3 font-bold">مرحله فعلی</th>
                  <th className="py-3.5 px-3 font-bold">پیشرفت</th>
                  <th className="py-3.5 px-3 font-bold">امتیاز</th>
                  <th className="py-3.5 px-3 font-bold">زمان شروع</th>
                  <th className="py-3.5 px-3 font-bold">زمان سپری‌شده</th>
                  <th className="py-3.5 px-3 font-bold">وضعیت</th>
                  <th className="py-3.5 px-4 font-bold text-left">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE2D3] text-xs">
                {filteredRows.map((row, idx) => {
                  const statusMeta = PARTICIPANT_STATUS_META[row.status];
                  return (
                    <tr
                      key={`${row.contest.id}-${row.participant.id}`}
                      onClick={() => onSelectParticipant(row.contest.id, row.participant.id)}
                      className={`hover:bg-[#F3ECE0]/65 transition-colors cursor-pointer ${
                        activeTab === 'leaderboard' && row.participant.isWinner
                          ? 'bg-[#DFEFEA]/35'
                          : ''
                      }`}
                    >
                      {activeTab === 'leaderboard' && (
                        <td className="py-3.5 px-3 font-extrabold text-[#2A1D15] tabular-nums whitespace-nowrap">
                          {idx < 3 ? (
                            <span className="inline-flex items-center gap-1 text-[#0F766E]">
                              <Award className="w-3.5 h-3.5" />
                              {toPersianDigits(idx + 1)}
                            </span>
                          ) : (
                            toPersianDigits(idx + 1)
                          )}
                        </td>
                      )}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-[#2A1D15]">{row.participant.fullName}</span>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-[#6B4C35] tabular-nums whitespace-nowrap">
                        {toPersianDigits(row.studentCode)}
                      </td>
                      <td className="py-3.5 px-3 max-w-[200px]">
                        <span className="font-semibold text-[#3A2A1E] block truncate">
                          {row.contest.title}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 max-w-[180px] text-[#5D3F2A]">
                        <span className="block truncate">{row.currentStageLabel}</span>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-2 min-w-[96px]">
                          <div className="flex-1 h-1.5 bg-[#E6DCC9] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#5D3F2A] rounded-full"
                              style={{ width: `${row.progressPercent}%` }}
                            />
                          </div>
                          <span className="font-bold text-[#2A1D15] tabular-nums">
                            {toPersianDigits(row.progressPercent)}٪
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 font-extrabold text-[#2A1D15] tabular-nums whitespace-nowrap">
                        {formatPersianNumber(row.participant.score)}
                      </td>
                      <td className="py-3.5 px-3 text-[#6B4C35] tabular-nums whitespace-nowrap">
                        {formatJalaliDate(row.participant.joinedAt)}
                      </td>
                      <td className="py-3.5 px-3 text-[#6B4C35] tabular-nums whitespace-nowrap">
                        {formatDurationPersian(row.participant.completionTimeMinutes)}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={`font-bold ${statusMeta.textClass}`}>
                          {statusMeta.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-left whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectParticipant(row.contest.id, row.participant.id);
                          }}
                          className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-bold text-[#5D3F2A] bg-[#F3ECE0] hover:bg-[#EAE0CE] border border-[#DDD2BE] rounded-xl transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>مشاهده جزئیات</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
