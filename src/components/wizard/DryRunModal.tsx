import {
  CheckCircle2,
  HelpCircle,
  KeyRound,
  Lock,
  LockOpen,
  Play,
  RotateCcw,
  Trophy,
  X,
} from 'lucide-react';
import { FormEvent, useState } from 'react';
import { formatPersianNumber, toPersianDigits } from '../../data/initialData';
import { ContestWizardData, STAGE_TYPE_OPTIONS } from './wizardDefaults';

interface DryRunModalProps {
  data: ContestWizardData;
  onClose: () => void;
}

type SimPhase = 'welcome' | 'stage' | 'vault' | 'victory';

export function DryRunModal({ data, onClose }: DryRunModalProps) {
  const activeStages = data.stages.filter((s) => s.advancedSettings?.isActive ?? true);

  const [phase, setPhase] = useState<SimPhase>('welcome');
  const [stageIndex, setStageIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [codeInput, setCodeInput] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [feedback, setFeedback] = useState<{ tone: 'error' | 'success'; text: string } | null>(
    null
  );
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [unlockedHints, setUnlockedHints] = useState<Record<string, boolean>>({});

  const currentStage = activeStages[stageIndex];

  const resetSimulation = () => {
    setPhase('welcome');
    setStageIndex(0);
    setScore(0);
    setCodeInput('');
    setKeyInput('');
    setFeedback(null);
    setAttemptsUsed(0);
    setUnlockedHints({});
  };

  const handleCheckStageCode = (e: FormEvent) => {
    e.preventDefault();
    if (!currentStage) return;

    const pw = currentStage.passwordSettings;
    const expectedRaw = pw?.correctCode ?? '';
    let submitted = codeInput;
    let expected = expectedRaw;

    if (pw?.trimWhitespace ?? true) {
      submitted = submitted.trim().replace(/\s+/g, ' ');
      expected = expected.trim().replace(/\s+/g, ' ');
    }
    if (!(pw?.caseSensitive ?? false)) {
      submitted = submitted.toLowerCase();
      expected = expected.toLowerCase();
    }

    const isMatch = expected === '' ? submitted.length > 0 : submitted === expected;

    if (isMatch) {
      const gained = pw?.points ?? currentStage.points;
      setScore((prev) => prev + gained);
      setFeedback({
        tone: 'success',
        text: `پاسخ صحیح ثبت شد (+${formatPersianNumber(gained)} امتیاز).`,
      });
      setCodeInput('');
      setAttemptsUsed(0);

      window.setTimeout(() => {
        setFeedback(null);
        if (stageIndex + 1 < activeStages.length) {
          setStageIndex((prev) => prev + 1);
        } else {
          setPhase('vault');
        }
      }, 650);
    } else {
      const nextAttempts = attemptsUsed + 1;
      const penalty = pw?.penaltyPoints ?? 0;
      const maxAtt = pw?.maxAttempts ?? 5;
      setAttemptsUsed(nextAttempts);
      if (penalty > 0) {
        setScore((prev) => Math.max(0, prev - penalty));
      }
      setFeedback({
        tone: 'error',
        text: `رمز نادرست است (تلاش ${toPersianDigits(nextAttempts)} از ${toPersianDigits(maxAtt)})${
          penalty > 0 ? ` — کسر ${formatPersianNumber(penalty)} امتیاز` : ''
        }.`,
      });
    }
  };

  const handleUnlockVault = (e: FormEvent) => {
    e.preventDefault();
    const expectedCode = data.finalVault.finalCode.trim().toLowerCase();
    const expectedKey = data.finalVault.finalKey.trim().toLowerCase();

    const codeMatches =
      expectedCode === '' ? codeInput.trim().length > 0 : codeInput.trim().toLowerCase() === expectedCode;
    const keyMatches =
      !data.finalVault.requireKeyForCode ||
      expectedKey === '' ||
      keyInput.trim().toLowerCase() === expectedKey;

    if (codeMatches && keyMatches) {
      setScore((prev) => prev + data.finalVault.finalScore);
      setFeedback(null);
      setPhase('victory');
    } else {
      const nextAttempts = attemptsUsed + 1;
      setAttemptsUsed(nextAttempts);
      setFeedback({
        tone: 'error',
        text: !keyMatches
          ? 'کلید نهایی واردشده صحیح نیست.'
          : `رمز گاوصندوق اشتباه است (تلاش ${toPersianDigits(nextAttempts)} از ${toPersianDigits(
              data.finalVault.maxAttempts
            )}).`,
      });
    }
  };

  const handleRevealHint = (hintId: string, deduction: number) => {
    if (unlockedHints[hintId]) return;
    setUnlockedHints((prev) => ({ ...prev, [hintId]: true }));
    setScore((prev) => Math.max(0, prev - deduction));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2A1D15]/55 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dry-run-title"
      onClick={onClose}
    >
      <div
        className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[24px] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar */}
        <div className="px-6 py-4 bg-[#F3ECE0] border-b border-[#E2D9C8] flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold text-[#0F766E]">حالت اجرای آزمایشی مسابقه (Dry Run)</p>
            <h2 id="dry-run-title" className="text-sm font-extrabold text-[#2A1D15]">
              {data.title || 'مسابقه بدون عنوان'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-extrabold text-[#5D3F2A] bg-[#FAF7F0] border border-[#DDD2BE] px-3 py-1.5 rounded-xl tabular-nums">
              امتیاز فعلی: {formatPersianNumber(score)}
            </span>
            <button
              type="button"
              onClick={resetSimulation}
              title="شروع مجدد تست"
              className="p-2 text-[#6B4C35] hover:text-[#2A1D15] hover:bg-[#EFE6D5] rounded-xl cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="بستن اجرای آزمایشی"
              className="p-2 text-[#6B4C35] hover:text-[#2A1D15] hover:bg-[#EFE6D5] rounded-xl cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {phase === 'welcome' && (
            <div className="space-y-4">
              {data.coverImageUrl && (
                <div className="h-44 rounded-2xl overflow-hidden border border-[#E2D9C8]">
                  <img
                    src={data.coverImageUrl}
                    alt={data.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-5 bg-[#FCFBF8] border border-[#E5DCCB] rounded-2xl space-y-3">
                <h3 className="text-base font-extrabold text-[#2A1D15]">پیام خوش‌آمدگویی</h3>
                <p className="text-sm text-[#4A3525] leading-relaxed">
                  {data.welcomeMessage || 'خوش آمدید! برای شروع آزمون آزمایشی کلیک کنید.'}
                </p>
                {data.story && (
                  <p className="text-xs text-[#7A6A5B] leading-relaxed pt-2 border-t border-[#EAE2D3]">
                    {data.story}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-[#7A6A5B] px-1">
                <span>تعداد مراحل فعال: {toPersianDigits(activeStages.length)} مرحله</span>
                <span>همراه با گاوصندوق نهایی</span>
              </div>

              <button
                type="button"
                onClick={() => setPhase(activeStages.length > 0 ? 'stage' : 'vault')}
                className="w-full h-11 inline-flex items-center justify-center gap-2 text-sm font-bold text-[#FAF7F0] bg-[#5D3F2A] hover:bg-[#4A3120] rounded-2xl transition-colors cursor-pointer"
              >
                <Play className="w-4 h-4" />
                <span>شروع اجرای آزمایشی</span>
              </button>
            </div>
          )}

          {phase === 'stage' && currentStage && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-[#7A6A5B]">
                <span className="font-bold text-[#5D3F2A]">
                  مرحله {toPersianDigits(stageIndex + 1)} از {toPersianDigits(activeStages.length)}
                </span>
                <span>
                  نوع:{' '}
                  {STAGE_TYPE_OPTIONS.find((t) => t.value === (currentStage.stageType ?? 'text'))
                    ?.label ?? 'متنی'}
                </span>
              </div>

              <div className="h-2 w-full bg-[#E6DCC9] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#5D3F2A] rounded-full transition-all"
                  style={{
                    width: `${Math.round(((stageIndex + 1) / Math.max(1, activeStages.length)) * 100)}%`,
                  }}
                />
              </div>

              <div className="p-5 bg-[#FCFBF8] border border-[#E5DCCB] rounded-2xl space-y-3">
                <h3 className="text-base font-extrabold text-[#2A1D15]">{currentStage.title}</h3>
                {currentStage.missionText && (
                  <p className="text-sm text-[#4A3525] leading-relaxed">
                    {currentStage.missionText}
                  </p>
                )}
                {currentStage.description && (
                  <p className="text-xs text-[#7A6A5B]">{currentStage.description}</p>
                )}

                {currentStage.stageType === 'coding' && currentStage.missionContent?.codeSnippet && (
                  <pre
                    dir="ltr"
                    className="p-3.5 text-xs font-mono bg-[#2A1D15] text-[#FAF7F0] rounded-xl overflow-x-auto"
                  >
                    {currentStage.missionContent.codeSnippet}
                  </pre>
                )}

                {currentStage.missionContent?.question && (
                  <p className="text-xs font-bold text-[#5D3F2A] pt-2 border-t border-[#EAE2D3]">
                    سؤال: {currentStage.missionContent.question}
                  </p>
                )}
              </div>

              {/* Hints */}
              {currentStage.hints && currentStage.hints.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-[#5D3F2A] flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>راهنمایی‌های این مرحله</span>
                  </p>
                  <div className="space-y-2">
                    {currentStage.hints.map((h) => {
                      const revealed = Boolean(unlockedHints[h.id]);
                      return (
                        <div
                          key={h.id}
                          className="p-3 bg-[#F3ECE0] border border-[#E2D9C8] rounded-xl flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-[#2A1D15]">{h.title}</p>
                            {revealed && (
                              <p className="mt-1 text-xs text-[#4A3525]">
                                {h.text || 'متنی برای این راهنمایی ثبت نشده است.'}
                              </p>
                            )}
                          </div>
                          {!revealed && (
                            <button
                              type="button"
                              onClick={() => handleRevealHint(h.id, h.pointDeduction)}
                              className="px-3 py-1.5 text-[11px] font-bold text-[#5D3F2A] bg-[#FAF7F0] border border-[#DDD2BE] hover:bg-[#EFE6D5] rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
                            >
                              نمایش (-{formatPersianNumber(h.pointDeduction)} امتیاز)
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Answer Form */}
              <form onSubmit={handleCheckStageCode} className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value)}
                    placeholder={
                      currentStage.passwordSettings?.correctCode
                        ? 'رمز این مرحله را وارد کنید...'
                        : 'رمزی تنظیم نشده (هر عبارتی وارد کنید تا عبور شود)...'
                    }
                    className="flex-1 h-11 px-3.5 text-sm bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-white focus:outline-none focus:border-[#5D3F2A]"
                  />
                  <button
                    type="submit"
                    className="h-11 px-5 text-xs font-bold text-[#FAF7F0] bg-[#5D3F2A] hover:bg-[#4A3120] rounded-xl whitespace-nowrap cursor-pointer"
                  >
                    بررسی رمز
                  </button>
                </div>

                {feedback && (
                  <p
                    className={`text-xs font-semibold ${
                      feedback.tone === 'success' ? 'text-[#0F766E]' : 'text-[#B91C1C]'
                    }`}
                  >
                    {feedback.text}
                  </p>
                )}
              </form>
            </div>
          )}

          {phase === 'vault' && (
            <div className="space-y-4">
              <div className="p-5 bg-[#DFEFEA]/55 border border-[#C6E2DA] rounded-2xl space-y-3 text-center">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-[#0F766E] text-[#FAF7F0] flex items-center justify-center">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-base font-extrabold text-[#2A1D15]">{data.finalVault.title}</h3>
                <p className="text-xs text-[#2D6A63] leading-relaxed max-w-md mx-auto">
                  {data.finalVault.beforeOpenText}
                </p>
              </div>

              <form onSubmit={handleUnlockVault} className="space-y-3">
                {data.finalVault.requireKeyForCode && (
                  <div>
                    <label className="block text-xs font-bold text-[#4A3525] mb-1">
                      کلید نهایی
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-[#8C7C6D] absolute right-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={keyInput}
                        onChange={(e) => setKeyInput(e.target.value)}
                        placeholder={
                          data.finalVault.finalKey
                            ? 'کلید نهایی را وارد کنید...'
                            : 'کلید تنظیم نشده (هر عبارتی قابل قبول است)'
                        }
                        className="w-full h-10 pr-9 pl-3 text-sm font-mono bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-white focus:outline-none focus:border-[#0F766E]"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#4A3525] mb-1">
                    رمز نهایی گاوصندوق
                  </label>
                  <input
                    type="text"
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value)}
                    placeholder={
                      data.finalVault.finalCode
                        ? 'رمز نهایی را وارد کنید...'
                        : 'رمزی تنظیم نشده (هر عبارتی وارد کنید)'
                    }
                    className="w-full h-11 px-3.5 text-sm font-mono bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-white focus:outline-none focus:border-[#0F766E]"
                  />
                </div>

                {feedback && <p className="text-xs font-semibold text-[#B91C1C]">{feedback.text}</p>}

                <button
                  type="submit"
                  className="w-full h-11 inline-flex items-center justify-center gap-2 text-sm font-bold text-[#FAF7F0] bg-[#0F766E] hover:bg-[#115E59] rounded-2xl transition-colors cursor-pointer"
                >
                  <LockOpen className="w-4 h-4" />
                  <span>باز کردن گاوصندوق نهایی</span>
                </button>
              </form>
            </div>
          )}

          {phase === 'victory' && (
            <div className="p-6 bg-[#DFEFEA]/65 border border-[#C6E2DA] rounded-2xl text-center space-y-4">
              {data.finalVault.openedImageUrl ? (
                <div className="h-40 rounded-2xl overflow-hidden border border-[#C6E2DA] max-w-md mx-auto">
                  <img
                    src={data.finalVault.openedImageUrl}
                    alt="گاوصندوق بازشده"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="mx-auto w-14 h-14 rounded-2xl bg-[#0F766E] text-[#FAF7F0] flex items-center justify-center">
                  <Trophy className="w-7 h-7" />
                </div>
              )}

              <div className="space-y-1.5">
                <p className="text-xs font-bold text-[#0F766E] inline-flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>گاوصندوق نهایی با موفقیت باز شد</span>
                </p>
                <h3 className="text-lg font-extrabold text-[#2A1D15]">
                  امتیاز نهایی آزمایشی: {formatPersianNumber(score)}
                </h3>
                <p className="text-sm text-[#4A3525] leading-relaxed max-w-md mx-auto">
                  {data.finalVault.successMessage}
                </p>
              </div>

              <div className="flex items-center justify-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={resetSimulation}
                  className="h-10 px-4 text-xs font-bold text-[#4A3525] bg-[#FAF7F0] border border-[#DDD2BE] hover:bg-[#EFE6D5] rounded-xl cursor-pointer"
                >
                  اجرای مجدد
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="h-10 px-5 text-xs font-bold text-[#FAF7F0] bg-[#5D3F2A] hover:bg-[#4A3120] rounded-xl cursor-pointer"
                >
                  بازگشت به بازبینی و انتشار
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
