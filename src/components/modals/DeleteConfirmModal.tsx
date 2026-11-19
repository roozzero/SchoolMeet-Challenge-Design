import { AlertTriangle, X } from 'lucide-react';
import { Contest } from '../../types/contest';
import { formatPersianNumber, getContestMetrics } from '../../data/initialData';

interface DeleteConfirmModalProps {
  contest: Contest;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmModal({
  contest,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  const metrics = getContestMetrics(contest);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2A1D15]/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[24px] w-full max-w-md overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EAE2D3]">
          <div className="flex items-center gap-2 text-[#B91C1C]">
            <AlertTriangle className="w-4 h-4" aria-hidden="true" />
            <h2 id="delete-modal-title" className="text-sm font-extrabold">
              حذف مسابقه
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="p-1.5 text-[#7A6A5B] hover:text-[#2A1D15] hover:bg-[#EFE6D5] rounded-xl cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-2">
          <p className="text-sm text-[#2A1D15] leading-relaxed">
            آیا از حذف مسابقه <strong className="font-extrabold">«{contest.title}»</strong> مطمئن هستید؟
          </p>
          <p className="text-xs text-[#7A6A5B] leading-relaxed">
            با حذف این مسابقه، اطلاعات {formatPersianNumber(metrics.stageCount)} مرحله و آمار{' '}
            {formatPersianNumber(metrics.participantsCount)} شرکت‌کننده از فهرست داشبورد حذف خواهد شد.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 px-6 py-3.5 bg-[#F3ECE0] border-t border-[#E2D9C8]">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 text-xs font-semibold text-[#4A3525] bg-[#FAF7F0] border border-[#DDD2BE] hover:bg-[#EFE6D5] rounded-xl cursor-pointer"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-9 px-4 text-xs font-bold text-[#FAF7F0] bg-[#B91C1C] hover:bg-[#991B1B] rounded-xl transition-colors cursor-pointer"
          >
            حذف قطعی مسابقه
          </button>
        </div>
      </div>
    </div>
  );
}
