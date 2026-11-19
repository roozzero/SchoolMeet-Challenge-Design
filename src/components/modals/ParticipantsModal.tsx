import { Check, Search, UserPlus, X } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Contest, Participant } from '../../types/contest';
import {
  formatJalaliDate,
  formatPersianNumber,
  getContestMetrics,
  toPersianDigits,
} from '../../data/initialData';

interface ParticipantsModalProps {
  contest: Contest;
  onClose: () => void;
  onAddParticipant: (participant: Participant) => void;
  onMarkCompleted: (participantId: string) => void;
}

export function ParticipantsModal({
  contest,
  onClose,
  onAddParticipant,
  onMarkCompleted,
}: ParticipantsModalProps) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'in_progress'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const metrics = getContestMetrics(contest);
  const totalStages = Math.max(1, contest.stages.length);

  const filtered = contest.participants.filter((p) => {
    const matchesSearch =
      !query.trim() ||
      p.fullName.toLowerCase().includes(query.trim().toLowerCase()) ||
      p.email.toLowerCase().includes(query.trim().toLowerCase()) ||
      p.phone.includes(query.trim());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'completed' && p.isCompleted) ||
      (statusFilter === 'in_progress' && !p.isCompleted);
    return matchesSearch && matchesStatus;
  });

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    const newParticipant: Participant = {
      id: `p-${Date.now()}`,
      fullName: fullName.trim(),
      email: email.trim() || 'user@example.ir',
      phone: phone.trim() || '09120000000',
      joinedAt: '2026-11-19',
      completedStages: 0,
      totalStages,
      score: 0,
      completionTimeMinutes: 0,
      isCompleted: false,
      isWinner: false,
    };
    onAddParticipant(newParticipant);
    setFullName('');
    setEmail('');
    setPhone('');
    setShowAddForm(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2A1D15]/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="participants-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[24px] w-full max-w-3xl max-h-[88vh] flex flex-col overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-[#EAE2D3]">
          <div>
            <p className="text-xs text-[#7A6A5B]">{contest.title}</p>
            <h2 id="participants-modal-title" className="mt-0.5 text-base font-extrabold text-[#2A1D15]">
              فهرست شرکت‌کنندگان ({formatPersianNumber(metrics.participantsCount)} نفر ·{' '}
              {formatPersianNumber(metrics.completersCount)} تکمیل‌کننده)
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن فهرست شرکت‌کنندگان"
            className="p-2 text-[#7A6A5B] hover:text-[#2A1D15] hover:bg-[#EFE6D5] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Controls */}
        <div className="px-6 py-3.5 border-b border-[#EAE2D3] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
            <div className="relative flex-1 min-w-[200px]">
              <Search
                className="w-3.5 h-3.5 text-[#8C7C6D] absolute right-3 top-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="جستجوی نام، ایمیل یا شماره تماس..."
                className="w-full h-9 pr-9 pl-3 text-xs text-[#2A1D15] placeholder:text-[#9C8D7E] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-[#FCFBF8] focus:outline-none focus:border-[#5D3F2A]"
              />
            </div>

            <div className="inline-flex items-center p-0.5 bg-[#EFE7D8] rounded-xl">
              {(
                [
                  { id: 'all', label: 'همه' },
                  { id: 'completed', label: 'تکمیل‌کرده' },
                  { id: 'in_progress', label: 'در حال انجام' },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setStatusFilter(item.id)}
                  className={`px-2.5 py-1 text-xs rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                    statusFilter === item.id
                      ? 'bg-[#5D3F2A] text-[#FAF7F0] font-semibold'
                      : 'text-[#6B4C35] hover:text-[#2A1D15]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAddForm((prev) => !prev)}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-bold text-[#FAF7F0] bg-[#5D3F2A] hover:bg-[#4A3120] rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>ثبت شرکت‌کننده</span>
          </button>
        </div>

        {/* Optional Add Participant Inline Form */}
        {showAddForm && (
          <form
            onSubmit={handleAdd}
            className="px-6 py-3.5 bg-[#F3ECE0] border-b border-[#E2D9C8] grid grid-cols-1 sm:grid-cols-4 gap-2.5"
          >
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="نام و نام خانوادگی"
              className="h-9 px-3 text-xs bg-[#FCFBF8] border border-[#E2D9C8] rounded-xl focus:outline-none focus:border-[#5D3F2A]"
              required
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ایمیل"
              dir="ltr"
              className="h-9 px-3 text-xs bg-[#FCFBF8] border border-[#E2D9C8] rounded-xl focus:outline-none focus:border-[#5D3F2A]"
            />
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="شماره موبایل"
              dir="ltr"
              className="h-9 px-3 text-xs bg-[#FCFBF8] border border-[#E2D9C8] rounded-xl focus:outline-none focus:border-[#5D3F2A]"
            />
            <button
              type="submit"
              className="h-9 px-3 text-xs font-bold text-[#FAF7F0] bg-[#0F766E] hover:bg-[#115E59] rounded-xl transition-colors cursor-pointer"
            >
              تأیید ثبت‌نام
            </button>
          </form>
        )}

        {/* Table */}
        <div className="overflow-y-auto flex-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#7A6A5B]">
              {contest.participants.length === 0
                ? 'هنوز شرکت‌کننده‌ای برای این مسابقه ثبت نشده است.'
                : 'شرکت‌کننده‌ای با این مشخصات یافت نشد.'}
            </div>
          ) : (
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-[#E2D9C8] bg-[#F3ECE0]/80 text-xs text-[#5D3F2A]">
                  <th className="py-2.5 px-6 font-bold">شرکت‌کننده</th>
                  <th className="py-2.5 px-3 font-bold">پیشرفت مراحل</th>
                  <th className="py-2.5 px-3 font-bold">امتیاز</th>
                  <th className="py-2.5 px-3 font-bold">تاریخ عضویت</th>
                  <th className="py-2.5 px-6 font-bold text-left">وضعیت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE2D3] text-xs">
                {filtered.map((p) => {
                  const stageDenom = Math.max(1, contest.stages.length || p.totalStages);
                  const done = Math.min(stageDenom, p.completedStages);
                  return (
                    <tr key={p.id} className="hover:bg-[#F3ECE0]/60">
                      <td className="py-3 px-6">
                        <div className="font-bold text-[#2A1D15]">{p.fullName}</div>
                        <div className="text-[11px] text-[#8C7C6D] mt-0.5 font-mono" dir="ltr">
                          {p.email} · {p.phone}
                        </div>
                      </td>
                      <td className="py-3 px-3 tabular-nums text-[#4A3525] whitespace-nowrap">
                        {toPersianDigits(done)} از {toPersianDigits(stageDenom)} مرحله
                      </td>
                      <td className="py-3 px-3 tabular-nums font-bold text-[#2A1D15] whitespace-nowrap">
                        {formatPersianNumber(p.score)}
                      </td>
                      <td className="py-3 px-3 tabular-nums text-[#7A6A5B] whitespace-nowrap">
                        {formatJalaliDate(p.joinedAt)}
                      </td>
                      <td className="py-3 px-6 text-left whitespace-nowrap">
                        {p.isCompleted ? (
                          <span className="font-bold text-[#0F766E]">تکمیل‌شده</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onMarkCompleted(p.id)}
                            className="inline-flex items-center gap-1 text-[#5D3F2A] hover:text-[#2A1D15] font-bold cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>ثبت تکمیل</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-3 bg-[#F3ECE0] border-t border-[#E2D9C8] text-xs text-[#7A6A5B]">
          <span>
            {contest.baseParticipantsOffset > 0
              ? `نمایش نمونه شرکت‌کنندگان اخیر از مجموع ${formatPersianNumber(metrics.participantsCount)} شرکت‌کننده`
              : `مجموع ${formatPersianNumber(contest.participants.length)} شرکت‌کننده`}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-4 font-bold text-[#4A3525] bg-[#FAF7F0] border border-[#DDD2BE] hover:bg-[#EFE6D5] rounded-xl cursor-pointer"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
}
