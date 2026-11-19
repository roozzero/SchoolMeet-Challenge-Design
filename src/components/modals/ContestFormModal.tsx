import { X } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Contest, ContestStatus } from '../../types/contest';

interface ContestFormValues {
  title: string;
  category: string;
  description: string;
  prizeSummary: string;
  startDate: string;
  endDate: string;
  status: ContestStatus;
}

interface ContestFormModalProps {
  mode: 'create' | 'edit';
  initialContest?: Contest;
  onClose: () => void;
  onSubmit: (values: ContestFormValues) => void;
}

const CATEGORIES = [
  'فناوری و توسعه',
  'طراحی محصول',
  'بازاریابی و رشد',
  'علم داده',
  'هنر و رسانه',
  'امنیت سایبری',
  'آموزش و محتوا',
];

export function ContestFormModal({
  mode,
  initialContest,
  onClose,
  onSubmit,
}: ContestFormModalProps) {
  const [title, setTitle] = useState(initialContest?.title ?? '');
  const [category, setCategory] = useState(initialContest?.category ?? CATEGORIES[0]);
  const [description, setDescription] = useState(initialContest?.description ?? '');
  const [prizeSummary, setPrizeSummary] = useState(initialContest?.prizeSummary ?? '');
  const [startDate, setStartDate] = useState(initialContest?.startDate ?? '2026-11-20');
  const [endDate, setEndDate] = useState(initialContest?.endDate ?? '2026-12-20');
  const [status, setStatus] = useState<ContestStatus>(initialContest?.status ?? 'draft');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('وارد کردن عنوان مسابقه الزامی است.');
      return;
    }
    if (startDate && endDate && endDate < startDate) {
      setError('تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد.');
      return;
    }
    setError('');
    onSubmit({
      title: title.trim(),
      category,
      description: description.trim() || 'توضیحات این مسابقه هنوز تکمیل نشده است.',
      prizeSummary: prizeSummary.trim() || 'جایزه پس از نهایی‌سازی اعلام می‌شود',
      startDate,
      endDate,
      status,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2A1D15]/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contest-form-title"
      onClick={onClose}
    >
      <div
        className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[24px] w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EAE2D3]">
          <h2 id="contest-form-title" className="text-base font-extrabold text-[#2A1D15]">
            {mode === 'create' ? 'ایجاد مسابقه جدید' : 'ویرایش اطلاعات مسابقه'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن فرم"
            className="p-2 text-[#7A6A5B] hover:text-[#2A1D15] hover:bg-[#EFE6D5] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="text-xs text-[#991B1B] bg-[#FEE2E2]/80 border border-[#FECACA] rounded-xl px-3.5 py-2.5">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="cf-title" className="block text-xs font-bold text-[#4A3525] mb-1.5">
              عنوان مسابقه
            </label>
            <input
              id="cf-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: چالش طراحی رابط کاربری زمستان ۱۴۰۵"
              className="w-full h-10 px-3 text-sm text-[#2A1D15] placeholder:text-[#9C8D7E] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-[#FCFBF8] focus:outline-none focus:border-[#5D3F2A] focus:ring-2 focus:ring-[#5D3F2A]/15"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label htmlFor="cf-category" className="block text-xs font-bold text-[#4A3525] mb-1.5">
                دسته‌بندی
              </label>
              <select
                id="cf-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 text-sm text-[#2A1D15] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-[#FCFBF8] focus:outline-none focus:border-[#5D3F2A]"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="cf-status" className="block text-xs font-bold text-[#4A3525] mb-1.5">
                وضعیت
              </label>
              <select
                id="cf-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as ContestStatus)}
                className="w-full h-10 px-3 text-sm text-[#2A1D15] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-[#FCFBF8] focus:outline-none focus:border-[#5D3F2A]"
              >
                <option value="draft">پیش‌نویس</option>
                <option value="active">فعال</option>
                <option value="paused">متوقف‌شده</option>
                <option value="ended">پایان‌یافته</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label htmlFor="cf-start" className="block text-xs font-bold text-[#4A3525] mb-1.5">
                تاریخ شروع
              </label>
              <input
                id="cf-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                dir="ltr"
                className="w-full h-10 px-3 text-sm font-mono text-[#2A1D15] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-[#FCFBF8] focus:outline-none focus:border-[#5D3F2A]"
                required
              />
            </div>

            <div>
              <label htmlFor="cf-end" className="block text-xs font-bold text-[#4A3525] mb-1.5">
                تاریخ پایان
              </label>
              <input
                id="cf-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                dir="ltr"
                className="w-full h-10 px-3 text-sm font-mono text-[#2A1D15] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-[#FCFBF8] focus:outline-none focus:border-[#5D3F2A]"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="cf-prize" className="block text-xs font-bold text-[#4A3525] mb-1.5">
              خلاصه جوایز
            </label>
            <input
              id="cf-prize"
              type="text"
              value={prizeSummary}
              onChange={(e) => setPrizeSummary(e.target.value)}
              placeholder="مثال: ۱۰۰ میلیون تومان جایزه نقدی برای ۳ نفر برتر"
              className="w-full h-10 px-3 text-sm text-[#2A1D15] placeholder:text-[#9C8D7E] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-[#FCFBF8] focus:outline-none focus:border-[#5D3F2A]"
            />
          </div>

          <div>
            <label htmlFor="cf-desc" className="block text-xs font-bold text-[#4A3525] mb-1.5">
              توضیحات مسابقه
            </label>
            <textarea
              id="cf-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="شرح اهداف مسابقه، نحوه داوری و قوانین کلی..."
              className="w-full p-3 text-sm text-[#2A1D15] placeholder:text-[#9C8D7E] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-[#FCFBF8] focus:outline-none focus:border-[#5D3F2A] resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#EAE2D3]">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 text-xs font-semibold text-[#5D3F2A] hover:bg-[#EFE6D5] rounded-xl transition-colors cursor-pointer"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="h-10 px-5 text-xs font-bold text-[#FAF7F0] bg-[#5D3F2A] hover:bg-[#4A3120] rounded-xl transition-colors cursor-pointer"
            >
              {mode === 'create' ? 'ثبت و ایجاد مسابقه' : 'ذخیره تغییرات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
