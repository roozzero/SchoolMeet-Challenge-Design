import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  Check,
  CheckCircle2,
  ClipboardCheck,
  FileEdit,
  Info,
  Layers,
  Lock,
  Play,
  RefreshCw,
  Rocket,
  Scale,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Contest } from '../../types/contest';
import {
  formatJalaliDate,
  formatPersianNumber,
  toPersianDigits,
} from '../../data/initialData';
import { DryRunModal } from './DryRunModal';
import { ImageField } from './ImageField';
import { StageBuilderStep } from './StageBuilderStep';
import {
  CONTEST_CATEGORIES,
  ContestWizardData,
  createInitialWizardData,
  STAGE_TYPE_OPTIONS,
  wizardDataToContest,
} from './wizardDefaults';

interface CreateContestPageProps {
  nextCodeNumber: number;
  onCancel: () => void;
  onComplete: (contest: Contest, publishMode: ContestWizardData['publishMode']) => void;
}

const WIZARD_STEPS = [
  { id: 0, title: 'اطلاعات عمومی', subtitle: 'عنوان، داستان، تصاویر و قوانین', icon: Info },
  { id: 1, title: 'زمان‌بندی و دسترسی', subtitle: 'بازه اجرا، ظرفیت و مخاطب', icon: CalendarClock },
  { id: 2, title: 'قوانین و امتیازدهی', subtitle: 'امتیاز مراحل، سرعت و خطا', icon: Scale },
  { id: 3, title: 'ساخت مراحل و گاوصندوق', subtitle: 'مراحل مأموریت و قفل نهایی', icon: Layers },
  { id: 4, title: 'بازبینی و انتشار', subtitle: 'بررسی، تست آزمایشی و انتشار', icon: ClipboardCheck },
] as const;

const AUDIENCE_LABELS: Record<ContestWizardData['access']['audienceType'], string> = {
  public: 'عمومی (آزاد برای همه کاربران)',
  students: 'دانش‌آموزان و فراگیران سامانه',
  invited: 'فقط افراد دارای کد دعوت اختصاصی',
  specific_class: 'کلاس یا گروه آموزشی مشخص',
};

export function CreateContestPage({
  nextCodeNumber,
  onCancel,
  onComplete,
}: CreateContestPageProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<ContestWizardData>(() =>
    createInitialWizardData(nextCodeNumber)
  );
  const [stepError, setStepError] = useState<string | null>(null);
  const [dryRunOpen, setDryRunOpen] = useState(false);

  // Automatic readiness checks for Step 5
  const readinessChecks = useMemo(() => {
    const missingStageCodes = data.stages.filter(
      (s) => !(s.passwordSettings?.correctCode ?? '').trim()
    ).length;

    return [
      {
        id: 'title',
        ok: data.title.trim().length >= 3,
        label: 'عنوان و شناسه اختصاصی مسابقه ثبت شده است',
        warning: 'عنوان مسابقه هنوز تکمیل نشده است (گام ۱).',
        targetStep: 0,
      },
      {
        id: 'dates',
        ok: Boolean(data.startDate && data.endDate && data.endDate >= data.startDate),
        label: 'بازه تاریخ شروع و پایان معتبر است',
        warning: 'تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد (گام ۲).',
        targetStep: 1,
      },
      {
        id: 'stages',
        ok: data.stages.length > 0 && data.stages.every((s) => s.title.trim().length > 0),
        label: `${toPersianDigits(data.stages.length)} مرحله با عنوان معتبر تعریف شده است`,
        warning: 'برخی مراحل هنوز عنوان مشخص ندارند (گام ۴).',
        targetStep: 3,
      },
      {
        id: 'stage_codes',
        ok: missingStageCodes === 0,
        label: 'برای تمام مراحل رمز صحیح تعیین شده است',
        warning: `برای ${toPersianDigits(missingStageCodes)} مرحله هنوز رمز صحیح وارد نشده است (گام ۴).`,
        targetStep: 3,
      },
      {
        id: 'vault',
        ok:
          data.finalVault.title.trim().length > 0 &&
          data.finalVault.finalCode.trim().length > 0 &&
          (!data.finalVault.requireKeyForCode || data.finalVault.finalKey.trim().length > 0),
        label: 'تنظیمات امنیتی گاوصندوق نهایی (رمز و کلید) کامل است',
        warning: 'رمز نهایی یا کلید نهایی گاوصندوق هنوز خالی است (گام ۴).',
        targetStep: 3,
      },
    ];
  }, [data]);

  const validateCurrentStep = (targetStep: number): boolean => {
    if (step === 0 && targetStep > 0) {
      if (!data.title.trim()) {
        setStepError('لطفاً پیش از رفتن به مرحله بعد، عنوان مسابقه را وارد کنید.');
        return false;
      }
      if (!data.code.trim()) {
        setStepError('لطفاً شناسه اختصاصی مسابقه را مشخص کنید.');
        return false;
      }
    }
    if (step === 1 && targetStep > 1) {
      if (data.startDate && data.endDate && data.endDate < data.startDate) {
        setStepError('تاریخ پایان نمی‌تواند زودتر از تاریخ شروع باشد.');
        return false;
      }
    }
    setStepError(null);
    return true;
  };

  const goToStep = (nextStep: number) => {
    if (!validateCurrentStep(nextStep)) return;
    setStep(nextStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const applyScoringToAllStages = () => {
    setData((prev) => ({
      ...prev,
      stages: prev.stages.map((st) => ({
        ...st,
        points: prev.scoring.pointsPerStage,
        passwordSettings: {
          correctCode: st.passwordSettings?.correctCode ?? '',
          caseSensitive: st.passwordSettings?.caseSensitive ?? false,
          trimWhitespace: st.passwordSettings?.trimWhitespace ?? true,
          cooldownSeconds: st.passwordSettings?.cooldownSeconds ?? 15,
          maxAttempts: prev.scoring.maxWrongAttempts,
          points: prev.scoring.pointsPerStage,
          penaltyPoints: prev.scoring.wrongAttemptPenalty,
        },
      })),
    }));
  };

  const handleFinalSubmit = (overrideMode?: ContestWizardData['publishMode']) => {
    const mode = overrideMode ?? data.publishMode;
    if (!data.title.trim()) {
      setStep(0);
      setStepError('برای ذخیره یا انتشار مسابقه، وارد کردن عنوان مسابقه الزامی است.');
      return;
    }
    if (data.startDate && data.endDate && data.endDate < data.startDate) {
      setStep(1);
      setStepError('تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد.');
      return;
    }
    const finalPayload: ContestWizardData = { ...data, publishMode: mode };
    const createdContest = wizardDataToContest(finalPayload);
    onComplete(createdContest, mode);
  };

  const totalStagesScore = data.stages.reduce(
    (sum, s) => sum + (s.passwordSettings?.points ?? s.points),
    0
  );

  return (
    <div className="space-y-5">
      {/* Top Page Header Bar */}
      <header className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[22px] px-5 sm:px-6 py-4 shadow-[0_2px_10px_rgba(78,52,34,0.04)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-bold text-[#5D3F2A] bg-[#F3ECE0] hover:bg-[#EAE0CE] border border-[#E2D9C8] rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>بازگشت به داشبورد</span>
          </button>

          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-extrabold text-[#2A1D15] truncate">
              ایجاد مسابقه جدید
            </h1>
            <p className="text-xs text-[#7A6A5B] truncate">
              گام {toPersianDigits(step + 1)} از {toPersianDigits(WIZARD_STEPS.length)} ·{' '}
              {WIZARD_STEPS[step].title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleFinalSubmit('draft')}
            className="inline-flex items-center gap-1.5 h-10 px-4 text-xs font-bold text-[#4A3525] bg-[#F3ECE0] hover:bg-[#EAE0CE] border border-[#DDD2BE] rounded-2xl transition-colors whitespace-nowrap cursor-pointer"
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>ذخیره پیش‌نویس</span>
          </button>
          <button
            type="button"
            onClick={() => setDryRunOpen(true)}
            className="inline-flex items-center gap-1.5 h-10 px-4 text-xs font-bold text-[#0F766E] bg-[#DFEFEA] hover:bg-[#D0E7E0] border border-[#C6E2DA] rounded-2xl transition-colors whitespace-nowrap cursor-pointer"
          >
            <Play className="w-3.5 h-3.5" />
            <span>اجرای آزمایشی</span>
          </button>
        </div>
      </header>

      {/* Wizard Stepper */}
      <nav
        aria-label="مراحل ساخت مسابقه"
        className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[22px] p-3 shadow-[0_2px_10px_rgba(78,52,34,0.04)]"
      >
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {WIZARD_STEPS.map((s) => {
            const Icon = s.icon;
            const isCurrent = step === s.id;
            const isCompleted = step > s.id;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => goToStep(s.id)}
                  className={`w-full text-right p-3 rounded-2xl border transition-colors flex items-center gap-3 cursor-pointer ${
                    isCurrent
                      ? 'bg-[#5D3F2A] text-[#FAF7F0] border-[#5D3F2A] shadow-[0_3px_10px_rgba(93,63,42,0.2)]'
                      : isCompleted
                        ? 'bg-[#DFEFEA]/60 text-[#2A1D15] border-[#C6E2DA] hover:bg-[#DFEFEA]'
                        : 'bg-[#FCFBF8] text-[#4A3525] border-[#EAE2D3] hover:bg-[#F3ECE0]'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isCurrent
                        ? 'bg-[#FAF7F0]/15 text-[#FAF7F0]'
                        : isCompleted
                          ? 'bg-[#0F766E] text-[#FAF7F0]'
                          : 'bg-[#EFE6D5] text-[#6B4C35]'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold truncate">
                      {toPersianDigits(s.id + 1)}. {s.title}
                    </p>
                    <p
                      className={`text-[11px] truncate mt-0.5 ${
                        isCurrent ? 'text-[#E7DEC9]' : 'text-[#7A6A5B]'
                      }`}
                    >
                      {s.subtitle}
                    </p>
                  </div>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Error Notice */}
      {stepError && (
        <div
          role="alert"
          className="bg-[#FEE2E2]/85 border border-[#FECACA] text-[#991B1B] rounded-2xl px-4 py-3 text-xs font-bold flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{stepError}</span>
        </div>
      )}

      {/* STEP 1: اطلاعات عمومی */}
      {step === 0 && (
        <section className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[24px] p-6 shadow-[0_2px_10px_rgba(78,52,34,0.04)] space-y-6">
          <div className="pb-3 border-b border-[#EAE2D3]">
            <h2 className="text-base font-extrabold text-[#2A1D15]">اطلاعات عمومی مسابقه</h2>
            <p className="mt-1 text-xs text-[#7A6A5B]">
              هویت اصلی مسابقه، داستان، تصاویر محیطی، قوانین و پیام خوش‌آمدگویی اولیه را تنظیم کنید.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="wiz-title" className="block text-xs font-bold text-[#4A3525] mb-1.5">
                عنوان مسابقه *
              </label>
              <input
                id="wiz-title"
                type="text"
                value={data.title}
                onChange={(e) => {
                  setStepError(null);
                  setData((prev) => ({ ...prev, title: e.target.value }));
                }}
                placeholder="مثال: عملیات رمزگشایی برج دانش ۱۴۰۵"
                className="w-full h-11 px-3.5 text-sm text-[#2A1D15] placeholder:text-[#9C8D7E] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-[#FCFBF8] focus:outline-none focus:border-[#5D3F2A] focus:ring-2 focus:ring-[#5D3F2A]/15"
              />
            </div>

            <div>
              <label htmlFor="wiz-code" className="block text-xs font-bold text-[#4A3525] mb-1.5">
                شناسه اختصاصی *
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  id="wiz-code"
                  type="text"
                  value={data.code}
                  onChange={(e) => setData((prev) => ({ ...prev, code: e.target.value }))}
                  dir="ltr"
                  className="flex-1 h-11 px-3 text-sm font-mono text-[#2A1D15] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-[#FCFBF8] focus:outline-none focus:border-[#5D3F2A]"
                />
                <button
                  type="button"
                  onClick={() =>
                    setData((prev) => ({
                      ...prev,
                      code: `MDN-${Math.floor(4100 + Math.random() * 5800)}`,
                    }))
                  }
                  title="تولید شناسه جدید"
                  className="h-11 w-11 inline-flex items-center justify-center bg-[#EFE6D5] hover:bg-[#E7DEC9] border border-[#DDD2BE] text-[#5D3F2A] rounded-xl shrink-0 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="wiz-cat" className="block text-xs font-bold text-[#4A3525] mb-1.5">
                دسته‌بندی موضوعی
              </label>
              <select
                id="wiz-cat"
                value={data.category}
                onChange={(e) => setData((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full h-11 px-3 text-sm text-[#2A1D15] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-[#FCFBF8] focus:outline-none focus:border-[#5D3F2A]"
              >
                {CONTEST_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="wiz-short" className="block text-xs font-bold text-[#4A3525] mb-1.5">
                توضیحات کوتاه
              </label>
              <input
                id="wiz-short"
                type="text"
                value={data.shortDescription}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, shortDescription: e.target.value }))
                }
                placeholder="یک جمله خلاصه و جذاب برای نمایش در کارت مسابقه..."
                className="w-full h-11 px-3.5 text-sm text-[#2A1D15] placeholder:text-[#9C8D7E] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-[#FCFBF8] focus:outline-none focus:border-[#5D3F2A]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="wiz-story" className="block text-xs font-bold text-[#4A3525] mb-1.5">
              داستان مسابقه
            </label>
            <textarea
              id="wiz-story"
              rows={3}
              value={data.story}
              onChange={(e) => setData((prev) => ({ ...prev, story: e.target.value }))}
              placeholder="فضاسازی و سناریوی داستانی مسابقه را شرح دهید تا انگیزه شرکت‌کنندگان افزایش یابد..."
              className="w-full p-3.5 text-sm text-[#2A1D15] placeholder:text-[#9C8D7E] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-[#FCFBF8] focus:outline-none focus:border-[#5D3F2A]"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ImageField
              id="wiz-cover-img"
              label="تصویر کاور مسابقه"
              value={data.coverImageUrl}
              onChange={(val) => setData((prev) => ({ ...prev, coverImageUrl: val }))}
              helperText="نسبت پیشنهادی ۱۶:۹ برای نمایش در صفحه معرفی و کارت مسابقه"
            />
            <ImageField
              id="wiz-env-img"
              label="تصویر محیط بازی"
              value={data.gameEnvImageUrl}
              onChange={(val) => setData((prev) => ({ ...prev, gameEnvImageUrl: val }))}
              helperText="پس‌زمینه یا نقشه فضای مراحل که در طول مسابقه دیده می‌شود"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div>
              <label htmlFor="wiz-rules" className="block text-xs font-bold text-[#4A3525] mb-1.5">
                قوانین مسابقه
              </label>
              <textarea
                id="wiz-rules"
                rows={4}
                value={data.rules}
                onChange={(e) => setData((prev) => ({ ...prev, rules: e.target.value }))}
                className="w-full p-3.5 text-xs leading-relaxed text-[#2A1D15] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-[#FCFBF8] focus:outline-none focus:border-[#5D3F2A]"
              />
            </div>

            <div>
              <label htmlFor="wiz-welcome" className="block text-xs font-bold text-[#4A3525] mb-1.5">
                پیام خوش‌آمدگویی
              </label>
              <textarea
                id="wiz-welcome"
                rows={4}
                value={data.welcomeMessage}
                onChange={(e) => setData((prev) => ({ ...prev, welcomeMessage: e.target.value }))}
                className="w-full p-3.5 text-xs leading-relaxed text-[#2A1D15] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-[#FCFBF8] focus:outline-none focus:border-[#5D3F2A]"
              />
            </div>
          </div>
        </section>
      )}

      {/* STEP 2: زمان‌بندی و دسترسی */}
      {step === 1 && (
        <section className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[24px] p-6 shadow-[0_2px_10px_rgba(78,52,34,0.04)] space-y-6">
          <div className="pb-3 border-b border-[#EAE2D3]">
            <h2 className="text-base font-extrabold text-[#2A1D15]">زمان‌بندی و دسترسی</h2>
            <p className="mt-1 text-xs text-[#7A6A5B]">
              تاریخ شروع و پایان، محدودیت ظرفیت شرکت‌کنندگان و گروه مخاطبان مجاز را مشخص کنید.
            </p>
          </div>

          {/* Dates & Times */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="wiz-start-date" className="block text-xs font-bold text-[#4A3525] mb-1.5">
                تاریخ شروع
              </label>
              <input
                id="wiz-start-date"
                type="date"
                value={data.startDate}
                onChange={(e) => setData((prev) => ({ ...prev, startDate: e.target.value }))}
                dir="ltr"
                className="w-full h-11 px-3 text-sm font-mono text-[#2A1D15] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-[#FCFBF8] focus:outline-none focus:border-[#5D3F2A]"
              />
              <p className="mt-1 text-[11px] text-[#8C7C6D] tabular-nums">
                شمسی: {formatJalaliDate(data.startDate)}
              </p>
            </div>

            <div>
              <label htmlFor="wiz-start-time" className="block text-xs font-bold text-[#4A3525] mb-1.5">
                ساعت شروع
              </label>
              <input
                id="wiz-start-time"
                type="time"
                value={data.access.startTime}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    access: { ...prev.access, startTime: e.target.value },
                  }))
                }
                dir="ltr"
                className="w-full h-11 px-3 text-sm font-mono text-[#2A1D15] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-[#FCFBF8] focus:outline-none focus:border-[#5D3F2A]"
              />
            </div>

            <div>
              <label htmlFor="wiz-end-date" className="block text-xs font-bold text-[#4A3525] mb-1.5">
                تاریخ پایان
              </label>
              <input
                id="wiz-end-date"
                type="date"
                value={data.endDate}
                onChange={(e) => setData((prev) => ({ ...prev, endDate: e.target.value }))}
                dir="ltr"
                className="w-full h-11 px-3 text-sm font-mono text-[#2A1D15] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-[#FCFBF8] focus:outline-none focus:border-[#5D3F2A]"
              />
              <p className="mt-1 text-[11px] text-[#8C7C6D] tabular-nums">
                شمسی: {formatJalaliDate(data.endDate)}
              </p>
            </div>

            <div>
              <label htmlFor="wiz-end-time" className="block text-xs font-bold text-[#4A3525] mb-1.5">
                ساعت پایان
              </label>
              <input
                id="wiz-end-time"
                type="time"
                value={data.access.endTime}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    access: { ...prev.access, endTime: e.target.value },
                  }))
                }
                dir="ltr"
                className="w-full h-11 px-3 text-sm font-mono text-[#2A1D15] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-[#FCFBF8] focus:outline-none focus:border-[#5D3F2A]"
              />
            </div>
          </div>

          {/* Participation Limit */}
          <div className="p-4 bg-[#FCFBF8] border border-[#E5DCCB] rounded-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-extrabold text-[#2A1D15]">محدودیت شرکت در مسابقه</h3>
                <p className="mt-0.5 text-[11px] text-[#7A6A5B]">
                  مشخص کنید ظرفیت ثبت‌نام شرکت‌کنندگان محدود باشد یا نامحدود.
                </p>
              </div>
              <div className="inline-flex items-center p-1 bg-[#EFE7D8] rounded-xl">
                <button
                  type="button"
                  onClick={() =>
                    setData((prev) => ({
                      ...prev,
                      access: { ...prev.access, hasParticipantLimit: false },
                    }))
                  }
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    !data.access.hasParticipantLimit
                      ? 'bg-[#5D3F2A] text-[#FAF7F0]'
                      : 'text-[#6B4C35]'
                  }`}
                >
                  نامحدود
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setData((prev) => ({
                      ...prev,
                      access: { ...prev.access, hasParticipantLimit: true },
                    }))
                  }
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                    data.access.hasParticipantLimit
                      ? 'bg-[#5D3F2A] text-[#FAF7F0]'
                      : 'text-[#6B4C35]'
                  }`}
                >
                  ظرفیت محدود
                </button>
              </div>
            </div>

            {data.access.hasParticipantLimit && (
              <div className="max-w-xs">
                <label className="block text-xs font-bold text-[#4A3525] mb-1.5">
                  حداکثر تعداد شرکت‌کنندگان مجاز (نفر)
                </label>
                <input
                  type="number"
                  min={1}
                  max={100000}
                  value={data.access.maxParticipants}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      access: {
                        ...prev.access,
                        maxParticipants: Math.max(1, Number(e.target.value) || 1),
                      },
                    }))
                  }
                  className="w-full h-10 px-3 text-sm font-bold tabular-nums text-[#2A1D15] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-white focus:outline-none focus:border-[#5D3F2A]"
                />
              </div>
            )}
          </div>

          {/* Audience */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-[#4A3525]">مخاطب مسابقه</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(
                Object.entries(AUDIENCE_LABELS) as Array<
                  [ContestWizardData['access']['audienceType'], string]
                >
              ).map(([key, label]) => {
                const active = data.access.audienceType === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() =>
                      setData((prev) => ({
                        ...prev,
                        access: { ...prev.access, audienceType: key },
                      }))
                    }
                    className={`text-right p-3.5 rounded-2xl border transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#5D3F2A] text-[#FAF7F0] border-[#5D3F2A]'
                        : 'bg-[#FCFBF8] text-[#2A1D15] border-[#E5DCCB] hover:border-[#CFC2AC]'
                    }`}
                  >
                    <p className="text-xs font-extrabold">{label}</p>
                  </button>
                );
              })}
            </div>

            <div>
              <label htmlFor="wiz-aud-detail" className="block text-xs font-bold text-[#4A3525] mb-1.5">
                جزئیات دسترسی مخاطب (نام کلاس‌ها، پایه تحصیلی یا کد دعوت)
              </label>
              <input
                id="wiz-aud-detail"
                type="text"
                value={data.access.audienceDetail}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    access: { ...prev.access, audienceDetail: e.target.value },
                  }))
                }
                placeholder="مثال: کلاس‌های ۹۰۱، ۹۰۲ و ۹۰۳ یا کد دعوت INVITE-405"
                className="w-full h-10 px-3.5 text-sm text-[#2A1D15] placeholder:text-[#9C8D7E] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-[#FCFBF8] focus:outline-none focus:border-[#5D3F2A]"
              />
            </div>
          </div>
        </section>
      )}

      {/* STEP 3: قوانین و امتیازدهی */}
      {step === 2 && (
        <section className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[24px] p-6 shadow-[0_2px_10px_rgba(78,52,34,0.04)] space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-[#EAE2D3]">
            <div>
              <h2 className="text-base font-extrabold text-[#2A1D15]">قوانین و امتیازدهی پایه</h2>
              <p className="mt-1 text-xs text-[#7A6A5B]">
                مقادیر پیش‌فرض امتیاز هر مرحله، پاداش تکمیل سریع و سقف پاسخ‌های اشتباه را مشخص کنید.
              </p>
            </div>
            <button
              type="button"
              onClick={applyScoringToAllStages}
              className="h-9 px-3.5 text-xs font-bold text-[#0F766E] bg-[#DFEFEA] hover:bg-[#D0E7E0] border border-[#C6E2DA] rounded-xl transition-colors whitespace-nowrap cursor-pointer"
            >
              اعمال مقادیر روی همه مراحل فعلی
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-[#FCFBF8] border border-[#E5DCCB] rounded-2xl space-y-2">
              <label className="block text-xs font-extrabold text-[#2A1D15]">
                امتیاز هر مرحله
              </label>
              <p className="text-[11px] text-[#7A6A5B]">
                امتیاز پایه برای تکمیل موفق هر مرحله (قابل شخصی‌سازی در هر مرحله)
              </p>
              <input
                type="number"
                min={0}
                step={10}
                value={data.scoring.pointsPerStage}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    scoring: {
                      ...prev.scoring,
                      pointsPerStage: Math.max(0, Number(e.target.value) || 0),
                    },
                  }))
                }
                className="w-full h-11 px-3 text-base font-extrabold tabular-nums text-[#2A1D15] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-white focus:outline-none focus:border-[#5D3F2A]"
              />
            </div>

            <div className="p-4 bg-[#FCFBF8] border border-[#E5DCCB] rounded-2xl space-y-2">
              <label className="block text-xs font-extrabold text-[#2A1D15]">
                امتیاز تکمیل سریع
              </label>
              <p className="text-[11px] text-[#7A6A5B]">
                پاداش تشویقی برای شرکت‌کنندگانی که زودتر از زمان معیار مسابقه را تمام کنند
              </p>
              <input
                type="number"
                min={0}
                step={10}
                value={data.scoring.fastCompletionBonus}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    scoring: {
                      ...prev.scoring,
                      fastCompletionBonus: Math.max(0, Number(e.target.value) || 0),
                    },
                  }))
                }
                className="w-full h-11 px-3 text-base font-extrabold tabular-nums text-[#0F766E] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-white focus:outline-none focus:border-[#5D3F2A]"
              />
            </div>

            <div className="p-4 bg-[#FCFBF8] border border-[#E5DCCB] rounded-2xl space-y-2">
              <label className="block text-xs font-extrabold text-[#2A1D15]">
                آستانه زمان تکمیل سریع (دقیقه)
              </label>
              <p className="text-[11px] text-[#7A6A5B]">
                حداکثر زمان کل مسابقه برای دریافت امتیاز تکمیل سریع
              </p>
              <input
                type="number"
                min={1}
                step={5}
                value={data.scoring.fastCompletionThresholdMinutes}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    scoring: {
                      ...prev.scoring,
                      fastCompletionThresholdMinutes: Math.max(1, Number(e.target.value) || 1),
                    },
                  }))
                }
                className="w-full h-11 px-3 text-base font-extrabold tabular-nums text-[#2A1D15] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-white focus:outline-none focus:border-[#5D3F2A]"
              />
            </div>

            <div className="p-4 bg-[#FCFBF8] border border-[#E5DCCB] rounded-2xl space-y-2">
              <label className="block text-xs font-extrabold text-[#2A1D15]">
                تعداد دفعات پاسخ اشتباه مجاز
              </label>
              <p className="text-[11px] text-[#7A6A5B]">
                حداکثر تعداد خطای مجاز پیش‌فرض در هر مرحله
              </p>
              <input
                type="number"
                min={1}
                max={100}
                value={data.scoring.maxWrongAttempts}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    scoring: {
                      ...prev.scoring,
                      maxWrongAttempts: Math.max(1, Number(e.target.value) || 1),
                    },
                  }))
                }
                className="w-full h-11 px-3 text-base font-extrabold tabular-nums text-[#2A1D15] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-white focus:outline-none focus:border-[#5D3F2A]"
              />
            </div>

            <div className="p-4 bg-[#FCFBF8] border border-[#E5DCCB] rounded-2xl space-y-2">
              <label className="block text-xs font-extrabold text-[#2A1D15]">
                کسر امتیاز هر پاسخ اشتباه
              </label>
              <p className="text-[11px] text-[#7A6A5B]">
                مقدار جریمه پیش‌فرض برای هر بار ثبت رمز نادرست
              </p>
              <input
                type="number"
                min={0}
                step={5}
                value={data.scoring.wrongAttemptPenalty}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    scoring: {
                      ...prev.scoring,
                      wrongAttemptPenalty: Math.max(0, Number(e.target.value) || 0),
                    },
                  }))
                }
                className="w-full h-11 px-3 text-base font-extrabold tabular-nums text-[#B45309] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-white focus:outline-none focus:border-[#5D3F2A]"
              />
            </div>

            <div className="p-4 bg-[#F3ECE0] border border-[#E2D9C8] rounded-2xl flex flex-col justify-between">
              <p className="text-xs font-bold text-[#5D3F2A]">برآورد سقف امتیاز مسابقه</p>
              <p className="mt-2 text-2xl font-extrabold text-[#2A1D15] tabular-nums">
                {formatPersianNumber(
                  totalStagesScore + data.scoring.fastCompletionBonus + data.finalVault.finalScore
                )}{' '}
                <span className="text-xs font-bold text-[#7A6A5B]">امتیاز</span>
              </p>
              <p className="mt-1 text-[11px] text-[#7A6A5B]">
                مجموع مراحل + پاداش سرعت + گاوصندوق نهایی
              </p>
            </div>
          </div>
        </section>
      )}

      {/* STEP 4: ساخت مراحل و گاوصندوق نهایی */}
      {step === 3 && (
        <StageBuilderStep
          stages={data.stages}
          scoring={data.scoring}
          finalVault={data.finalVault}
          onChangeStages={(stages) => setData((prev) => ({ ...prev, stages }))}
          onChangeFinalVault={(finalVault) => setData((prev) => ({ ...prev, finalVault }))}
        />
      )}

      {/* STEP 5: بازبینی و انتشار */}
      {step === 4 && (
        <div className="space-y-5">
          {/* Readiness Check & Dry-Run Banner */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7 bg-[#FAF7F0] border border-[#E2D9C8] rounded-[24px] p-6 shadow-[0_2px_10px_rgba(78,52,34,0.04)] space-y-4">
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#EAE2D3]">
                <h2 className="text-base font-extrabold text-[#2A1D15]">بررسی نهایی قبل از انتشار</h2>
                <span className="text-xs font-bold text-[#0F766E] tabular-nums">
                  {toPersianDigits(readinessChecks.filter((c) => c.ok).length)} از{' '}
                  {toPersianDigits(readinessChecks.length)} مورد آماده
                </span>
              </div>

              <ul className="space-y-2.5">
                {readinessChecks.map((check) => (
                  <li
                    key={check.id}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs ${
                      check.ok
                        ? 'bg-[#DFEFEA]/45 border-[#C6E2DA] text-[#2A1D15]'
                        : 'bg-[#FEF3C7]/45 border-[#FDE68A] text-[#78350F]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {check.ok ? (
                        <CheckCircle2 className="w-4 h-4 text-[#0F766E] shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-[#B45309] shrink-0" />
                      )}
                      <span className="font-semibold">
                        {check.ok ? check.label : check.warning}
                      </span>
                    </div>
                    {!check.ok && (
                      <button
                        type="button"
                        onClick={() => setStep(check.targetStep)}
                        className="text-[#5D3F2A] font-extrabold hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        تکمیل
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Dry-run & Publish Options */}
            <div className="lg:col-span-5 bg-[#FAF7F0] border border-[#E2D9C8] rounded-[24px] p-6 shadow-[0_2px_10px_rgba(78,52,34,0.04)] flex flex-col justify-between gap-5">
              <div className="space-y-4">
                <h2 className="text-base font-extrabold text-[#2A1D15]">
                  اجرای آزمایشی و نحوه انتشار
                </h2>

                <button
                  type="button"
                  onClick={() => setDryRunOpen(true)}
                  className="w-full h-11 inline-flex items-center justify-center gap-2 text-xs font-extrabold text-[#0F766E] bg-[#DFEFEA] hover:bg-[#D0E7E0] border border-[#C6E2DA] rounded-2xl transition-colors cursor-pointer"
                >
                  <Play className="w-4 h-4" />
                  <span>اجرای آزمایشی کامل مسابقه و گاوصندوق</span>
                </button>

                <div className="space-y-2">
                  {(
                    [
                      {
                        id: 'publish_now',
                        title: 'انتشار فوری مسابقه',
                        desc: 'مسابقه بلافاصله با وضعیت «فعال» در داشبورد ثبت می‌شود',
                      },
                      {
                        id: 'schedule',
                        title: 'زمان‌بندی انتشار',
                        desc: 'در تاریخ و ساعت دلخواه به‌صورت خودکار آماده انتشار می‌شود',
                      },
                      {
                        id: 'draft',
                        title: 'ذخیره به‌عنوان پیش‌نویس',
                        desc: 'برای تکمیل و ویرایش بعدی در بخش پیش‌نویس‌ها ذخیره می‌شود',
                      },
                    ] as const
                  ).map((opt) => {
                    const selectedMode = data.publishMode === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          setData((prev) => ({ ...prev, publishMode: opt.id }))
                        }
                        className={`w-full text-right p-3 rounded-2xl border transition-colors cursor-pointer ${
                          selectedMode
                            ? 'bg-[#5D3F2A] text-[#FAF7F0] border-[#5D3F2A]'
                            : 'bg-[#FCFBF8] text-[#2A1D15] border-[#E5DCCB] hover:border-[#CFC2AC]'
                        }`}
                      >
                        <p className="text-xs font-extrabold">{opt.title}</p>
                        <p
                          className={`mt-0.5 text-[11px] ${
                            selectedMode ? 'text-[#E7DEC9]' : 'text-[#7A6A5B]'
                          }`}
                        >
                          {opt.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {data.publishMode === 'schedule' && (
                  <div>
                    <label className="block text-xs font-bold text-[#4A3525] mb-1.5">
                      تاریخ و ساعت زمان‌بندی انتشار
                    </label>
                    <input
                      type="datetime-local"
                      value={data.scheduledPublishAt}
                      onChange={(e) =>
                        setData((prev) => ({ ...prev, scheduledPublishAt: e.target.value }))
                      }
                      dir="ltr"
                      className="w-full h-10 px-3 text-xs font-mono text-[#2A1D15] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-white focus:outline-none focus:border-[#5D3F2A]"
                    />
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleFinalSubmit()}
                className="w-full h-12 inline-flex items-center justify-center gap-2 text-sm font-extrabold text-[#FAF7F0] bg-[#5D3F2A] hover:bg-[#4A3120] rounded-2xl shadow-[0_3px_12px_rgba(93,63,42,0.25)] transition-colors cursor-pointer"
              >
                <Rocket className="w-4 h-4" />
                <span>
                  {data.publishMode === 'publish_now'
                    ? 'تأیید و انتشار مسابقه'
                    : data.publishMode === 'schedule'
                      ? 'ثبت زمان‌بندی انتشار'
                      : 'ذخیره در پیش‌نویس‌ها'}
                </span>
              </button>
            </div>
          </div>

          {/* Full Information Summary */}
          <div className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[24px] p-6 shadow-[0_2px_10px_rgba(78,52,34,0.04)] space-y-6">
            <h2 className="text-base font-extrabold text-[#2A1D15] pb-3 border-b border-[#EAE2D3]">
              خلاصه کل اطلاعات مسابقه
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* General Info Summary */}
              <div className="p-4 bg-[#FCFBF8] border border-[#E5DCCB] rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-[#5D3F2A]">اطلاعات عمومی</h3>
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="text-[11px] font-bold text-[#0F766E] hover:underline cursor-pointer"
                  >
                    ویرایش
                  </button>
                </div>
                <p className="text-sm font-bold text-[#2A1D15]">{data.title || '—'}</p>
                <p className="text-xs text-[#7A6A5B]">
                  شناسه: <span className="font-mono">{data.code}</span> · {data.category}
                </p>
                <p className="text-xs text-[#7A6A5B] line-clamp-2">
                  {data.shortDescription || 'بدون توضیحات کوتاه'}
                </p>
              </div>

              {/* Schedule & Access Summary */}
              <div className="p-4 bg-[#FCFBF8] border border-[#E5DCCB] rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-[#5D3F2A]">زمان‌بندی و دسترسی</h3>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-[11px] font-bold text-[#0F766E] hover:underline cursor-pointer"
                  >
                    ویرایش
                  </button>
                </div>
                <p className="text-xs text-[#2A1D15] tabular-nums">
                  شروع: {formatJalaliDate(data.startDate)} ({toPersianDigits(data.access.startTime)})
                </p>
                <p className="text-xs text-[#2A1D15] tabular-nums">
                  پایان: {formatJalaliDate(data.endDate)} ({toPersianDigits(data.access.endTime)})
                </p>
                <p className="text-xs text-[#7A6A5B]">
                  ظرفیت:{' '}
                  {data.access.hasParticipantLimit
                    ? `${formatPersianNumber(data.access.maxParticipants)} نفر`
                    : 'نامحدود'}{' '}
                  · {AUDIENCE_LABELS[data.access.audienceType]}
                </p>
              </div>

              {/* Scoring Summary */}
              <div className="p-4 bg-[#FCFBF8] border border-[#E5DCCB] rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-[#5D3F2A]">قوانین و امتیازدهی</h3>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-[11px] font-bold text-[#0F766E] hover:underline cursor-pointer"
                  >
                    ویرایش
                  </button>
                </div>
                <p className="text-xs text-[#2A1D15] tabular-nums">
                  امتیاز هر مرحله: {formatPersianNumber(data.scoring.pointsPerStage)} · تکمیل سریع: +
                  {formatPersianNumber(data.scoring.fastCompletionBonus)}
                </p>
                <p className="text-xs text-[#7A6A5B] tabular-nums">
                  سقف پاسخ اشتباه: {toPersianDigits(data.scoring.maxWrongAttempts)} بار · جریمه:{' '}
                  {formatPersianNumber(data.scoring.wrongAttemptPenalty)} امتیاز
                </p>
              </div>
            </div>

            {/* Stages & Final Vault Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-8 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-[#2A1D15]">
                    مراحل تعریف‌شده ({toPersianDigits(data.stages.length)} مرحله)
                  </h3>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="text-[11px] font-bold text-[#0F766E] hover:underline cursor-pointer"
                  >
                    مدیریت مراحل
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {data.stages.map((st, idx) => (
                    <div
                      key={st.id}
                      className="p-3.5 bg-[#FCFBF8] border border-[#E5DCCB] rounded-2xl text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-[#2A1D15] truncate">
                          {toPersianDigits(idx + 1)}. {st.title}
                        </span>
                        <span className="font-bold text-[#0F766E] tabular-nums shrink-0">
                          {formatPersianNumber(st.passwordSettings?.points ?? st.points)} امتیاز
                        </span>
                      </div>
                      <p className="text-[11px] text-[#7A6A5B]">
                        نوع:{' '}
                        {STAGE_TYPE_OPTIONS.find((t) => t.value === (st.stageType ?? 'text'))
                          ?.label ?? 'متنی'}{' '}
                        · {toPersianDigits(st.hints?.length ?? 0)} راهنمایی ·{' '}
                        {st.advancedSettings?.isActive ?? true ? 'فعال' : 'غیرفعال'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-4 p-4 bg-[#DFEFEA]/55 border border-[#C6E2DA] rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#0F766E]">
                    <Lock className="w-3.5 h-3.5" />
                    <span>گاوصندوق نهایی</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="text-[11px] font-bold text-[#5D3F2A] hover:underline cursor-pointer"
                  >
                    ویرایش
                  </button>
                </div>
                <p className="text-sm font-bold text-[#2A1D15]">{data.finalVault.title}</p>
                <p className="text-xs text-[#2D6A63] tabular-nums">
                  امتیاز نهایی: {formatPersianNumber(data.finalVault.finalScore)} · سقف برندگان:{' '}
                  {data.finalVault.winnerMode === 'first_only'
                    ? '۱ نفر (اولین فرد)'
                    : `${toPersianDigits(data.finalVault.maxWinnersCount)} نفر`}
                </p>
                <p className="text-xs text-[#4A3525]">جایزه: {data.finalVault.winnerPrize}</p>
                <p className="text-[11px] text-[#2D6A63]">
                  نیاز به کلید: {data.finalVault.requireKeyForCode ? 'بله' : 'خیر'} · توقف خودکار:{' '}
                  {data.finalVault.autoStopOnWinner ? 'فعال' : 'غیرفعال'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Wizard Footer Controls */}
      <div className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[22px] px-5 py-3.5 shadow-[0_2px_10px_rgba(78,52,34,0.04)] flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => (step === 0 ? onCancel() : goToStep(step - 1))}
          className="inline-flex items-center gap-1.5 h-10 px-4 text-xs font-bold text-[#4A3525] bg-[#F3ECE0] hover:bg-[#EAE0CE] border border-[#DDD2BE] rounded-2xl transition-colors cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>{step === 0 ? 'انصراف و بازگشت' : 'گام قبلی'}</span>
        </button>

        <div className="text-xs text-[#7A6A5B] hidden sm:block tabular-nums">
          گام {toPersianDigits(step + 1)} از {toPersianDigits(WIZARD_STEPS.length)}
        </div>

        {step < WIZARD_STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => goToStep(step + 1)}
            className="inline-flex items-center gap-1.5 h-10 px-5 text-xs font-extrabold text-[#FAF7F0] bg-[#5D3F2A] hover:bg-[#4A3120] rounded-2xl transition-colors cursor-pointer"
          >
            <span>مرحله بعد: {WIZARD_STEPS[step + 1].title}</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handleFinalSubmit()}
            className="inline-flex items-center gap-1.5 h-10 px-5 text-xs font-extrabold text-[#FAF7F0] bg-[#0F766E] hover:bg-[#115E59] rounded-2xl transition-colors cursor-pointer"
          >
            <Rocket className="w-4 h-4" />
            <span>ثبت نهایی مسابقه</span>
          </button>
        )}
      </div>

      {/* Interactive Dry-Run Test Simulator */}
      {dryRunOpen && <DryRunModal data={data} onClose={() => setDryRunOpen(false)} />}
    </div>
  );
}
