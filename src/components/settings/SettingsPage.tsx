import {
  Bell,
  Clock,
  Eye,
  Power,
  RotateCcw,
  Save,
  Shield,
  SlidersHorizontal,
  Trophy,
} from 'lucide-react';
import { useState } from 'react';
import { SystemSettings } from '../../types/contest';
import { DEFAULT_SYSTEM_SETTINGS } from '../../data/participantAnalytics';

interface SettingsPageProps {
  settings: SystemSettings;
  onSaveSettings: (next: SystemSettings) => void;
}

function SettingSwitch({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="w-full text-right flex items-center justify-between gap-4 p-4 bg-[#FCFBF8] border border-[#E5DCCB] rounded-2xl hover:border-[#CFC2AC] transition-colors cursor-pointer"
    >
      <div className="min-w-0">
        <p className="text-xs font-extrabold text-[#2A1D15]">{label}</p>
        <p className="mt-0.5 text-[11px] text-[#7A6A5B] leading-relaxed">{description}</p>
      </div>
      <span
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          checked ? 'bg-[#5D3F2A]' : 'bg-[#D8CBB8]'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-[#FAF7F0] shadow-xs transition-transform ${
            checked ? '-translate-x-6' : '-translate-x-1'
          }`}
        />
      </span>
    </button>
  );
}

export function SettingsPage({ settings, onSaveSettings }: SettingsPageProps) {
  const [draft, setDraft] = useState<SystemSettings>(settings);

  const update = <K extends keyof SystemSettings>(key: K, value: SystemSettings[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <header className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[22px] px-5 sm:px-6 py-4 shadow-[0_2px_10px_rgba(78,52,34,0.04)] flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-base sm:text-lg font-extrabold text-[#2A1D15]">
            تنظیمات سیستم مسابقات
          </h1>
          <p className="mt-0.5 text-xs text-[#7A6A5B]">
            کنترل وضعیت کلی سامانه، نمایش در پنل دانش‌آموز، پیش‌فرض‌های زمان و امتیازدهی، اعلان‌ها و امنیت
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setDraft(DEFAULT_SYSTEM_SETTINGS);
              onSaveSettings(DEFAULT_SYSTEM_SETTINGS);
            }}
            className="inline-flex items-center gap-1.5 h-10 px-4 text-xs font-bold text-[#4A3525] bg-[#F3ECE0] hover:bg-[#EAE0CE] border border-[#DDD2BE] rounded-2xl transition-colors whitespace-nowrap cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>بازگردانی پیش‌فرض</span>
          </button>

          <button
            type="button"
            onClick={() => onSaveSettings(draft)}
            className="inline-flex items-center gap-1.5 h-10 px-5 text-xs font-extrabold text-[#FAF7F0] bg-[#5D3F2A] hover:bg-[#4A3120] rounded-2xl transition-colors whitespace-nowrap cursor-pointer shadow-[0_2px_8px_rgba(93,63,42,0.2)]"
          >
            <Save className="w-4 h-4" />
            <span>ذخیره تنظیمات</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 1, 2, 3, 4: کنترل وضعیت سیستم، پنل دانش‌آموز، رتبه‌بندی و برندگان */}
        <section className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[22px] p-5 shadow-[0_2px_10px_rgba(78,52,34,0.04)] space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#EAE2D3]">
            <div className="w-9 h-9 rounded-xl bg-[#EFE6D5] text-[#5D3F2A] flex items-center justify-center">
              <Power className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[#2A1D15]">وضعیت سیستم و کنترل نمایش</h2>
              <p className="text-[11px] text-[#7A6A5B]">
                روشن/خاموش بودن سیستم مسابقات و دسترسی در پنل دانش‌آموز
              </p>
            </div>
          </div>

          <SettingSwitch
            label="فعال بودن سیستم مسابقات"
            description={
              draft.systemEnabled
                ? 'سیستم مسابقات روشن است و دانش‌آموزان می‌توانند در مسابقات فعال شرکت کنند.'
                : 'سیستم مسابقات خاموش است و دسترسی کاربران موقتاً متوقف شده است.'
            }
            checked={draft.systemEnabled}
            onChange={(val) => update('systemEnabled', val)}
          />

          <div className="p-4 bg-[#FCFBF8] border border-[#E5DCCB] rounded-2xl space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold text-[#2A1D15] inline-flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#5D3F2A]" />
                  <span>نمایش مسابقات در پنل دانش‌آموز</span>
                </p>
                <p className="mt-0.5 text-[11px] text-[#7A6A5B]">
                  نحوه نمایش بخش مسابقات در پیشخوان کاربری دانش‌آموزان
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={draft.showInStudentPanel}
                onClick={() => update('showInStudentPanel', !draft.showInStudentPanel)}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                  draft.showInStudentPanel ? 'bg-[#5D3F2A]' : 'bg-[#D8CBB8]'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-[#FAF7F0] shadow-xs transition-transform ${
                    draft.showInStudentPanel ? '-translate-x-6' : '-translate-x-1'
                  }`}
                />
              </button>
            </div>

            {draft.showInStudentPanel && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                {(
                  [
                    { id: 'all_active', label: 'همه مسابقات فعال' },
                    { id: 'enrolled_only', label: 'فقط ثبت‌نام‌شده‌ها' },
                    { id: 'hidden', label: 'مخفی (با لینک مستقیم)' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => update('studentPanelVisibility', opt.id)}
                    className={`py-2 px-2.5 text-[11px] font-bold rounded-xl border transition-colors cursor-pointer ${
                      draft.studentPanelVisibility === opt.id
                        ? 'bg-[#5D3F2A] text-[#FAF7F0] border-[#5D3F2A]'
                        : 'bg-[#F4EEE2] text-[#5D3F2A] border-[#E2D9C8] hover:bg-[#EAE0CE]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 bg-[#FCFBF8] border border-[#E5DCCB] rounded-2xl space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold text-[#2A1D15] inline-flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-[#0F766E]" />
                  <span>نمایش جدول رتبه‌بندی</span>
                </p>
                <p className="mt-0.5 text-[11px] text-[#7A6A5B]">
                  فعال یا غیرفعال بودن جدول رتبه‌بندی امتیازات برای شرکت‌کنندگان
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={draft.showLeaderboard}
                onClick={() => update('showLeaderboard', !draft.showLeaderboard)}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                  draft.showLeaderboard ? 'bg-[#0F766E]' : 'bg-[#D8CBB8]'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-[#FAF7F0] shadow-xs transition-transform ${
                    draft.showLeaderboard ? '-translate-x-6' : '-translate-x-1'
                  }`}
                />
              </button>
            </div>

            {draft.showLeaderboard && (
              <div className="flex items-center justify-between gap-3 pt-1">
                <label className="text-xs text-[#6B4C35]">تعداد نفرات برتر نمایش‌داده‌شده</label>
                <input
                  type="number"
                  min={3}
                  max={100}
                  value={draft.leaderboardTopCount}
                  onChange={(e) =>
                    update('leaderboardTopCount', Math.max(3, Number(e.target.value) || 10))
                  }
                  className="w-24 h-9 px-2.5 text-center text-xs font-bold tabular-nums bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:outline-none focus:border-[#5D3F2A]"
                />
              </div>
            )}
          </div>

          {/* نمایش نام برندگان: عمومی یا خصوصی */}
          <div className="p-4 bg-[#FCFBF8] border border-[#E5DCCB] rounded-2xl space-y-2.5">
            <p className="text-xs font-extrabold text-[#2A1D15]">نمایش نام برندگان</p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => update('winnerDisplayMode', 'public')}
                className={`p-3 rounded-xl border text-right transition-colors cursor-pointer ${
                  draft.winnerDisplayMode === 'public'
                    ? 'bg-[#5D3F2A] text-[#FAF7F0] border-[#5D3F2A]'
                    : 'bg-[#F4EEE2] text-[#2A1D15] border-[#E2D9C8]'
                }`}
              >
                <p className="text-xs font-extrabold">عمومی</p>
                <p
                  className={`mt-0.5 text-[11px] ${
                    draft.winnerDisplayMode === 'public' ? 'text-[#E7DEC9]' : 'text-[#7A6A5B]'
                  }`}
                >
                  نام واقعی برندگان برای همه قابل مشاهده است
                </p>
              </button>
              <button
                type="button"
                onClick={() => update('winnerDisplayMode', 'private')}
                className={`p-3 rounded-xl border text-right transition-colors cursor-pointer ${
                  draft.winnerDisplayMode === 'private'
                    ? 'bg-[#5D3F2A] text-[#FAF7F0] border-[#5D3F2A]'
                    : 'bg-[#F4EEE2] text-[#2A1D15] border-[#E2D9C8]'
                }`}
              >
                <p className="text-xs font-extrabold">خصوصی</p>
                <p
                  className={`mt-0.5 text-[11px] ${
                    draft.winnerDisplayMode === 'private' ? 'text-[#E7DEC9]' : 'text-[#7A6A5B]'
                  }`}
                >
                  فقط برای مدیر و خود برنده نمایش داده می‌شود
                </p>
              </button>
            </div>
          </div>
        </section>

        {/* 5, 6, 7: تنظیمات پیش‌فرض زمان، تلاش اشتباه و امتیازدهی */}
        <section className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[22px] p-5 shadow-[0_2px_10px_rgba(78,52,34,0.04)] space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#EAE2D3]">
            <div className="w-9 h-9 rounded-xl bg-[#EFE6D5] text-[#5D3F2A] flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[#2A1D15]">
                پیش‌فرض‌های زمان، تلاش اشتباه و امتیازدهی
              </h2>
              <p className="text-[11px] text-[#7A6A5B]">
                به‌عنوان مقادیر پایه هنگام ایجاد مسابقات جدید اعمال می‌شوند
              </p>
            </div>
          </div>

          {/* تنظیمات پیش‌فرض زمان */}
          <div className="space-y-3">
            <p className="text-xs font-extrabold text-[#5D3F2A] inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>تنظیمات پیش‌فرض زمان</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#4A3525] mb-1">
                  مدت زمان پیش‌فرض مسابقه (روز)
                </label>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={draft.defaultContestDurationDays}
                  onChange={(e) =>
                    update('defaultContestDurationDays', Math.max(1, Number(e.target.value) || 7))
                  }
                  className="w-full h-10 px-3 text-sm font-bold tabular-nums text-[#2A1D15] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-white focus:outline-none focus:border-[#5D3F2A]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#4A3525] mb-1">
                  زمان مجاز پیش‌فرض هر مرحله (دقیقه)
                </label>
                <input
                  type="number"
                  min={0}
                  step={5}
                  value={draft.defaultStageTimeLimitMinutes}
                  onChange={(e) =>
                    update(
                      'defaultStageTimeLimitMinutes',
                      Math.max(0, Number(e.target.value) || 0)
                    )
                  }
                  className="w-full h-10 px-3 text-sm font-bold tabular-nums text-[#2A1D15] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-white focus:outline-none focus:border-[#5D3F2A]"
                />
              </div>
            </div>
          </div>

          {/* تنظیمات تلاش اشتباه */}
          <div className="space-y-3 pt-2 border-t border-[#EAE2D3]">
            <p className="text-xs font-extrabold text-[#5D3F2A]">تنظیمات تلاش اشتباه</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#4A3525] mb-1">
                  محدودیت پیش‌فرض تلاش اشتباه
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={draft.defaultMaxWrongAttempts}
                  onChange={(e) =>
                    update('defaultMaxWrongAttempts', Math.max(1, Number(e.target.value) || 1))
                  }
                  className="w-full h-10 px-3 text-sm font-bold tabular-nums text-[#2A1D15] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-white focus:outline-none focus:border-[#5D3F2A]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#4A3525] mb-1">
                  فاصله زمانی بین تلاش‌ها (ثانیه)
                </label>
                <input
                  type="number"
                  min={0}
                  step={5}
                  value={draft.defaultAttemptCooldownSeconds}
                  onChange={(e) =>
                    update(
                      'defaultAttemptCooldownSeconds',
                      Math.max(0, Number(e.target.value) || 0)
                    )
                  }
                  className="w-full h-10 px-3 text-sm font-bold tabular-nums text-[#2A1D15] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-white focus:outline-none focus:border-[#5D3F2A]"
                />
              </div>
            </div>
          </div>

          {/* تنظیمات امتیازدهی */}
          <div className="space-y-3 pt-2 border-t border-[#EAE2D3]">
            <p className="text-xs font-extrabold text-[#5D3F2A]">تنظیمات امتیازدهی</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#4A3525] mb-1">
                  امتیاز اولیه شروع مسابقه
                </label>
                <input
                  type="number"
                  min={0}
                  step={10}
                  value={draft.initialBaseScore}
                  onChange={(e) =>
                    update('initialBaseScore', Math.max(0, Number(e.target.value) || 0))
                  }
                  className="w-full h-10 px-3 text-sm font-bold tabular-nums text-[#2A1D15] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-white focus:outline-none focus:border-[#5D3F2A]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#4A3525] mb-1">
                  امتیاز پیش‌فرض هر مرحله
                </label>
                <input
                  type="number"
                  min={0}
                  step={10}
                  value={draft.defaultStagePoints}
                  onChange={(e) =>
                    update('defaultStagePoints', Math.max(0, Number(e.target.value) || 0))
                  }
                  className="w-full h-10 px-3 text-sm font-bold tabular-nums text-[#2A1D15] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-white focus:outline-none focus:border-[#5D3F2A]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#4A3525] mb-1">
                  پاداش پیش‌فرض تکمیل سریع
                </label>
                <input
                  type="number"
                  min={0}
                  step={10}
                  value={draft.defaultFastBonus}
                  onChange={(e) =>
                    update('defaultFastBonus', Math.max(0, Number(e.target.value) || 0))
                  }
                  className="w-full h-10 px-3 text-sm font-bold tabular-nums text-[#0F766E] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-white focus:outline-none focus:border-[#5D3F2A]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#4A3525] mb-1">
                  کسر امتیاز پیش‌فرض خطا
                </label>
                <input
                  type="number"
                  min={0}
                  step={5}
                  value={draft.defaultWrongPenalty}
                  onChange={(e) =>
                    update('defaultWrongPenalty', Math.max(0, Number(e.target.value) || 0))
                  }
                  className="w-full h-10 px-3 text-sm font-bold tabular-nums text-[#B45309] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-white focus:outline-none focus:border-[#5D3F2A]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 8: تنظیمات اعلان‌ها */}
        <section className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[22px] p-5 shadow-[0_2px_10px_rgba(78,52,34,0.04)] space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#EAE2D3]">
            <div className="w-9 h-9 rounded-xl bg-[#DFEFEA] text-[#0F766E] flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[#2A1D15]">تنظیمات اعلان‌ها</h2>
              <p className="text-[11px] text-[#7A6A5B]">
                ارسال اعلان خودکار در زمان شروع، پایان و اعلام برندگان مسابقات
              </p>
            </div>
          </div>

          <SettingSwitch
            label="اعلان شروع مسابقه"
            description="بلافاصله پس از آغاز رسمی مسابقه، اعلان برای مخاطبان مجاز ارسال شود"
            checked={draft.notifyOnStart}
            onChange={(val) => update('notifyOnStart', val)}
          />
          <SettingSwitch
            label="اعلان پایان مسابقه"
            description="هنگام اتمام مهلت مسابقه و بسته شدن ثبت پاسخ‌ها، اطلاع‌رسانی انجام شود"
            checked={draft.notifyOnEnd}
            onChange={(val) => update('notifyOnEnd', val)}
          />
          <SettingSwitch
            label="اعلان اعلام برندگان و نتایج"
            description="پس از تأیید برندگان، پیام تبریک و کارنامه امتیاز برای شرکت‌کنندگان ارسال شود"
            checked={draft.notifyOnWinner}
            onChange={(val) => update('notifyOnWinner', val)}
          />

          <div className="p-4 bg-[#FCFBF8] border border-[#E5DCCB] rounded-2xl flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold text-[#2A1D15]">یادآور قبل از پایان مسابقه (ساعت)</p>
              <p className="text-[11px] text-[#7A6A5B]">ارسال پیام یادآوری پیش از اتمام مهلت</p>
            </div>
            <input
              type="number"
              min={1}
              max={168}
              value={draft.remindBeforeEndHours}
              onChange={(e) =>
                update('remindBeforeEndHours', Math.max(1, Number(e.target.value) || 24))
              }
              className="w-20 h-9 px-2.5 text-center text-xs font-bold tabular-nums bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:outline-none focus:border-[#5D3F2A]"
            />
          </div>
        </section>

        {/* 9: تنظیمات امنیتی */}
        <section className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[22px] p-5 shadow-[0_2px_10px_rgba(78,52,34,0.04)] space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#EAE2D3]">
            <div className="w-9 h-9 rounded-xl bg-[#EFE6D5] text-[#5D3F2A] flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[#2A1D15]">تنظیمات امنیتی</h2>
              <p className="text-[11px] text-[#7A6A5B]">
                جلوگیری از حدس خودکار رمز (Brute Force) و محدودیت درخواست‌های رمز
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-4 bg-[#FCFBF8] border border-[#E5DCCB] rounded-2xl space-y-2">
              <label className="block text-xs font-extrabold text-[#2A1D15]">
                محدودیت درخواست‌های رمز (در دقیقه)
              </label>
              <p className="text-[11px] text-[#7A6A5B]">
                حداکثر تعداد بررسی رمز مجاز برای هر دانش‌آموز در هر دقیقه
              </p>
              <input
                type="number"
                min={1}
                max={120}
                value={draft.maxCodeRequestsPerMinute}
                onChange={(e) =>
                  update('maxCodeRequestsPerMinute', Math.max(1, Number(e.target.value) || 10))
                }
                className="w-full h-10 px-3 text-sm font-bold tabular-nums text-[#2A1D15] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-white focus:outline-none focus:border-[#5D3F2A]"
              />
            </div>

            <div className="p-4 bg-[#FCFBF8] border border-[#E5DCCB] rounded-2xl space-y-2">
              <label className="block text-xs font-extrabold text-[#2A1D15]">
                قفل موقت پس از خطاهای پیاپی
              </label>
              <p className="text-[11px] text-[#7A6A5B]">
                تعداد رمز اشتباه متوالی قبل از فعال شدن قفل امنیتی موقت
              </p>
              <input
                type="number"
                min={2}
                max={30}
                value={draft.tempLockAfterFailures}
                onChange={(e) =>
                  update('tempLockAfterFailures', Math.max(2, Number(e.target.value) || 5))
                }
                className="w-full h-10 px-3 text-sm font-bold tabular-nums text-[#2A1D15] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-white focus:outline-none focus:border-[#5D3F2A]"
              />
            </div>
          </div>

          <SettingSwitch
            label="ثبت گزارش امنیتی تلاش‌های مشکوک"
            description="تلاش‌های مکرر و نادرست برای باز کردن مراحل یا گاوصندوق نهایی در گزارش سامانه ثبت شود"
            checked={draft.enableSecurityAuditLog}
            onChange={(val) => update('enableSecurityAuditLog', val)}
          />
        </section>
      </div>
    </div>
  );
}
