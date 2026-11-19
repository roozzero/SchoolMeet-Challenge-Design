import { Award, Download, X } from 'lucide-react';
import { Contest } from '../../types/contest';
import {
  formatPersianNumber,
  getContestMetrics,
  toPersianDigits,
} from '../../data/initialData';

interface ResultsModalProps {
  contest: Contest;
  onClose: () => void;
  onToggleWinner: (participantId: string) => void;
}

export function ResultsModal({
  contest,
  onClose,
  onToggleWinner,
}: ResultsModalProps) {
  const metrics = getContestMetrics(contest);

  const ranked = [...contest.participants].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.completionTimeMinutes - b.completionTimeMinutes;
  });

  const handleExportCsv = () => {
    const header = ['رتبه', 'نام و نام خانوادگی', 'ایمیل', 'امتیاز', 'زمان تکمیل (دقیقه)', 'وضعیت برنده'];
    const rows = ranked.map((p, idx) => [
      String(idx + 1),
      p.fullName,
      p.email,
      String(p.score),
      String(p.completionTimeMinutes),
      p.isWinner ? 'برنده' : 'شرکت‌کننده',
    ]);
    const csv = '\uFEFF' + [header, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `results-${contest.code}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2A1D15]/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="results-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[24px] w-full max-w-3xl max-h-[88vh] flex flex-col overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-[#EAE2D3]">
          <div>
            <p className="text-xs text-[#7A6A5B]">{contest.title}</p>
            <h2 id="results-modal-title" className="mt-0.5 text-base font-extrabold text-[#2A1D15]">
              نتایج و جدول برندگان ({formatPersianNumber(metrics.winnersCount)} برنده تأییدشده)
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {ranked.length > 0 && (
              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-semibold text-[#4A3525] bg-[#F3ECE0] hover:bg-[#EAE0CE] border border-[#E2D9C8] rounded-xl transition-colors whitespace-nowrap cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>خروجی CSV</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="بستن جدول نتایج"
              className="p-2 text-[#7A6A5B] hover:text-[#2A1D15] hover:bg-[#EFE6D5] rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {ranked.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#7A6A5B]">
              هنوز نتیجه‌ای برای این مسابقه ثبت نشده است.
            </div>
          ) : (
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-[#E2D9C8] bg-[#F3ECE0]/80 text-xs text-[#5D3F2A]">
                  <th className="py-2.5 px-6 font-bold">رتبه</th>
                  <th className="py-2.5 px-3 font-bold">شرکت‌کننده</th>
                  <th className="py-2.5 px-3 font-bold">امتیاز کل</th>
                  <th className="py-2.5 px-3 font-bold">زمان کل</th>
                  <th className="py-2.5 px-3 font-bold">وضعیت تکمیل</th>
                  <th className="py-2.5 px-6 font-bold text-left">انتخاب برنده</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE2D3] text-xs">
                {ranked.map((p, index) => (
                  <tr
                    key={p.id}
                    className={`hover:bg-[#F3ECE0]/60 ${p.isWinner ? 'bg-[#DFEFEA]/45' : ''}`}
                  >
                    <td className="py-3 px-6 font-extrabold text-[#2A1D15] tabular-nums">
                      {toPersianDigits(index + 1)}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-[#2A1D15]">{p.fullName}</div>
                      <div className="text-[11px] text-[#8C7C6D] font-mono" dir="ltr">
                        {p.email}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-extrabold text-[#2A1D15] tabular-nums">
                      {formatPersianNumber(p.score)}
                    </td>
                    <td className="py-3 px-3 text-[#6B4C35] tabular-nums whitespace-nowrap">
                      {toPersianDigits(p.completionTimeMinutes)} دقیقه
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={
                          p.isCompleted ? 'text-[#0F766E] font-bold' : 'text-[#8C7C6D]'
                        }
                      >
                        {p.isCompleted ? 'تکمیل‌شده' : 'ناقص'}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-left whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onToggleWinner(p.id)}
                        className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                          p.isWinner
                            ? 'bg-[#5D3F2A] text-[#FAF7F0] hover:bg-[#4A3120]'
                            : 'bg-[#EFE6D5] text-[#4A3525] hover:bg-[#E7DEC9]'
                        }`}
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>{p.isWinner ? 'برنده تأییدشده' : 'انتخاب به‌عنوان برنده'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-3 bg-[#F3ECE0] border-t border-[#E2D9C8] text-xs text-[#7A6A5B]">
          <span>جایزه تعریف‌شده: {contest.prizeSummary}</span>
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
