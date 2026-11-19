import { ArrowDown, ArrowUp, Plus, Trash2, X } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Contest, ContestStage } from '../../types/contest';
import { formatPersianNumber, toPersianDigits } from '../../data/initialData';

interface StagesManagerModalProps {
  contest: Contest;
  onClose: () => void;
  onSaveStages: (stages: ContestStage[], changeSummary: string) => void;
}

export function StagesManagerModal({
  contest,
  onClose,
  onSaveStages,
}: StagesManagerModalProps) {
  const [stages, setStages] = useState<ContestStage[]>(contest.stages);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPoints, setNewPoints] = useState(100);
  const [newRequired, setNewRequired] = useState(true);

  const handleAddStage = (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const stage: ContestStage = {
      id: `st-${Date.now()}`,
      title: newTitle.trim(),
      description: newDescription.trim() || 'تکمیل فعالیت تعیین‌شده در این مرحله',
      points: Math.max(10, Number(newPoints) || 100),
      required: newRequired,
      completedCount: 0,
    };
    const updated = [...stages, stage];
    setStages(updated);
    onSaveStages(updated, `مرحله «${stage.title}» را اضافه کرد`);
    setNewTitle('');
    setNewDescription('');
    setNewPoints(100);
    setNewRequired(true);
  };

  const handleMove = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= stages.length) return;
    const updated = [...stages];
    const [moved] = updated.splice(index, 1);
    updated.splice(target, 0, moved);
    setStages(updated);
    onSaveStages(updated, `ترتیب مرحله «${moved.title}» را تغییر داد`);
  };

  const handleToggleRequired = (id: string) => {
    let stageName = '';
    const updated = stages.map((st) => {
      if (st.id === id) {
        stageName = st.title;
        return { ...st, required: !st.required };
      }
      return st;
    });
    setStages(updated);
    onSaveStages(updated, `وضعیت الزامی مرحله «${stageName}» را به‌روزرسانی کرد`);
  };

  const handleRemoveStage = (id: string) => {
    const removed = stages.find((s) => s.id === id);
    const updated = stages.filter((s) => s.id !== id);
    setStages(updated);
    if (removed) {
      onSaveStages(updated, `مرحله «${removed.title}» را حذف کرد`);
    }
  };

  const totalPoints = stages.reduce((acc, st) => acc + st.points, 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2A1D15]/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="stages-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[24px] w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-[#EAE2D3]">
          <div>
            <p className="text-xs text-[#7A6A5B]">{contest.title}</p>
            <h2 id="stages-modal-title" className="mt-0.5 text-base font-extrabold text-[#2A1D15]">
              مدیریت مراحل مسابقه ({toPersianDigits(stages.length)} مرحله ·{' '}
              {formatPersianNumber(totalPoints)} امتیاز)
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن مدیریت مراحل"
            className="p-2 text-[#7A6A5B] hover:text-[#2A1D15] hover:bg-[#EFE6D5] rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          {stages.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#7A6A5B] border border-dashed border-[#D8CBB8] rounded-2xl bg-[#FCFBF8]">
              هنوز مرحله‌ای تعریف نشده است. از فرم زیر اولین مرحله مسابقه را اضافه کنید.
            </div>
          ) : (
            <div className="space-y-2.5">
              {stages.map((stage, index) => (
                <div
                  key={stage.id}
                  className="p-3.5 bg-[#FCFBF8] border border-[#E5DCCB] rounded-2xl flex items-start justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className="text-xs font-extrabold text-[#8C7C6D] tabular-nums">
                        {toPersianDigits(index + 1)}.
                      </span>
                      <span className="text-sm font-bold text-[#2A1D15]">{stage.title}</span>
                      <span className="text-xs text-[#A89A8A]" aria-hidden="true">
                        ·
                      </span>
                      <span className="text-xs text-[#0F766E] font-bold tabular-nums">
                        {formatPersianNumber(stage.points)} امتیاز
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[#7A6A5B]">{stage.description}</p>
                    <div className="mt-2 flex items-center gap-3 text-[11px] text-[#7A6A5B]">
                      <button
                        type="button"
                        onClick={() => handleToggleRequired(stage.id)}
                        className="text-[#5D3F2A] hover:text-[#2A1D15] underline decoration-[#CFC2AC] cursor-pointer"
                      >
                        {stage.required ? 'الزامی (تغییر به اختیاری)' : 'اختیاری (تغییر به الزامی)'}
                      </button>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">
                        {formatPersianNumber(stage.completedCount)} تکمیل‌کننده
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMove(index, -1)}
                      aria-label="انتقال به بالا"
                      className="p-1.5 text-[#6B4C35] hover:text-[#2A1D15] hover:bg-[#EFE6D5] disabled:opacity-30 rounded-lg cursor-pointer disabled:cursor-not-allowed"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === stages.length - 1}
                      onClick={() => handleMove(index, 1)}
                      aria-label="انتقال به پایین"
                      className="p-1.5 text-[#6B4C35] hover:text-[#2A1D15] hover:bg-[#EFE6D5] disabled:opacity-30 rounded-lg cursor-pointer disabled:cursor-not-allowed"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveStage(stage.id)}
                      aria-label={`حذف مرحله ${stage.title}`}
                      className="p-1.5 text-[#B91C1C] hover:bg-[#FEE2E2]/70 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add New Stage Form */}
          <form onSubmit={handleAddStage} className="pt-4 border-t border-[#EAE2D3] space-y-3">
            <h3 className="text-xs font-extrabold text-[#2A1D15]">افزودن مرحله جدید</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="عنوان مرحله (مثال: ارسال پروژه نهایی)"
                  className="w-full h-9 px-3 text-xs text-[#2A1D15] placeholder:text-[#9C8D7E] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-[#FCFBF8] focus:outline-none focus:border-[#5D3F2A]"
                  required
                />
              </div>
              <div>
                <input
                  type="number"
                  min={10}
                  step={10}
                  value={newPoints}
                  onChange={(e) => setNewPoints(Number(e.target.value))}
                  placeholder="امتیاز"
                  aria-label="امتیاز مرحله"
                  className="w-full h-9 px-3 text-xs tabular-nums text-[#2A1D15] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-[#FCFBF8] focus:outline-none focus:border-[#5D3F2A]"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <input
                type="text"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="توضیح کوتاه برای راهنمایی شرکت‌کنندگان..."
                className="flex-1 h-9 px-3 text-xs text-[#2A1D15] placeholder:text-[#9C8D7E] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-[#FCFBF8] focus:outline-none focus:border-[#5D3F2A]"
              />
              <label className="inline-flex items-center gap-2 text-xs text-[#5D3F2A] whitespace-nowrap cursor-pointer">
                <input
                  type="checkbox"
                  checked={newRequired}
                  onChange={(e) => setNewRequired(e.target.checked)}
                  className="rounded border-[#CFC2AC] accent-[#5D3F2A]"
                />
                <span>مرحله الزامی</span>
              </label>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-1.5 h-9 px-4 text-xs font-bold text-[#FAF7F0] bg-[#5D3F2A] hover:bg-[#4A3120] rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>افزودن مرحله</span>
              </button>
            </div>
          </form>
        </div>

        <div className="flex items-center justify-end px-6 py-3.5 bg-[#F3ECE0] border-t border-[#E2D9C8]">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 text-xs font-bold text-[#4A3525] bg-[#FAF7F0] border border-[#DDD2BE] hover:bg-[#EFE6D5] rounded-xl transition-colors cursor-pointer"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
}
