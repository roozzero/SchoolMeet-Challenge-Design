import {
  CheckSquare,
  Code2,
  FileSearch,
  FileText,
  HelpCircle,
  Image as ImageIcon,
  KeyRound,
  Layers,
  Lock,
  Minus,
  Plus,
  Settings2,
  ShieldCheck,
  Sliders,
  Trash2,
  Trophy,
  Video,
} from 'lucide-react';
import { useState } from 'react';
import {
  ContestScoringConfig,
  ContestStage,
  FinalVaultConfig,
  StageHint,
  StageMissionContent,
  StageType,
} from '../../types/contest';
import { formatPersianNumber, toPersianDigits } from '../../data/initialData';
import { ImageField } from './ImageField';
import {
  createDefaultMissionContent,
  createDefaultStage,
  STAGE_TYPE_OPTIONS,
} from './wizardDefaults';

interface StageBuilderStepProps {
  stages: ContestStage[];
  scoring: ContestScoringConfig;
  finalVault: FinalVaultConfig;
  onChangeStages: (stages: ContestStage[]) => void;
  onChangeFinalVault: (vault: FinalVaultConfig) => void;
}

type StageTab = 'info' | 'content' | 'password' | 'hints' | 'advanced';
type SelectedPanel = { kind: 'stage'; index: number } | { kind: 'vault' };

const STAGE_TABS: Array<{ id: StageTab; label: string; icon: typeof FileText }> = [
  { id: 'info', label: 'اطلاعات مرحله', icon: FileText },
  { id: 'content', label: 'محتوای مأموریت', icon: Layers },
  { id: 'password', label: 'تنظیمات رمز', icon: KeyRound },
  { id: 'hints', label: 'راهنمایی‌ها', icon: HelpCircle },
  { id: 'advanced', label: 'تنظیمات پیشرفته', icon: Sliders },
];

const HYBRID_MODULE_OPTIONS: Array<{
  id: 'text' | 'image' | 'video' | 'coding' | 'research' | 'secret_code';
  label: string;
}> = [
  { id: 'text', label: 'متن و سؤال' },
  { id: 'image', label: 'تصویر معما' },
  { id: 'video', label: 'ویدئو و سرنخ' },
  { id: 'coding', label: 'بلوک کدنویسی' },
  { id: 'research', label: 'دستورالعمل تحقیقاتی' },
  { id: 'secret_code', label: 'سرنخ رمز مخفی' },
];

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="w-full text-right flex items-center justify-between gap-4 p-3.5 bg-[#FCFBF8] border border-[#E5DCCB] rounded-2xl hover:border-[#CFC2AC] transition-colors cursor-pointer"
    >
      <div className="min-w-0">
        <p className="text-xs font-bold text-[#2A1D15]">{label}</p>
        {description && <p className="mt-0.5 text-[11px] text-[#7A6A5B]">{description}</p>}
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

export function StageBuilderStep({
  stages,
  scoring,
  finalVault,
  onChangeStages,
  onChangeFinalVault,
}: StageBuilderStepProps) {
  const [selected, setSelected] = useState<SelectedPanel>({ kind: 'stage', index: 0 });
  const [activeTab, setActiveTab] = useState<StageTab>('info');

  const safeStageIndex =
    selected.kind === 'stage' ? Math.min(selected.index, Math.max(0, stages.length - 1)) : 0;
  const currentStage = selected.kind === 'stage' ? stages[safeStageIndex] : undefined;

  // Dynamically resize stage list when stage count changes
  const handleStageCountChange = (targetCount: number) => {
    const clamped = Math.max(1, Math.min(15, targetCount));
    if (clamped === stages.length) return;

    if (clamped > stages.length) {
      const additions: ContestStage[] = [];
      for (let i = stages.length; i < clamped; i++) {
        additions.push(
          createDefaultStage(
            i,
            scoring.pointsPerStage,
            scoring.maxWrongAttempts,
            scoring.wrongAttemptPenalty
          )
        );
      }
      onChangeStages([...stages, ...additions]);
    } else {
      const trimmed = stages.slice(0, clamped);
      onChangeStages(trimmed);
      if (selected.kind === 'stage' && selected.index >= clamped) {
        setSelected({ kind: 'stage', index: clamped - 1 });
      }
    }
  };

  const updateCurrentStage = (updater: (stage: ContestStage) => ContestStage) => {
    if (selected.kind !== 'stage') return;
    onChangeStages(
      stages.map((st, idx) => (idx === safeStageIndex ? updater(st) : st))
    );
  };

  const updateMissionContent = (patch: Partial<StageMissionContent>) => {
    updateCurrentStage((st) => ({
      ...st,
      missionContent: {
        ...(st.missionContent ?? createDefaultMissionContent()),
        ...patch,
      },
    }));
  };

  const renderMissionFieldsForType = (
    type: 'text' | 'image' | 'video' | 'coding' | 'research' | 'secret_code',
    content: StageMissionContent
  ) => {
    switch (type) {
      case 'text':
        return (
          <div className="space-y-4 p-4 bg-[#FCFBF8] border border-[#E5DCCB] rounded-2xl">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#5D3F2A]">
              <FileText className="w-4 h-4" />
              <span>محتوای مأموریت متنی (متن، سؤال و پاسخ)</span>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#4A3525] mb-1.5">
                متن اصلی مأموریت
              </label>
              <textarea
                rows={3}
                value={content.bodyText}
                onChange={(e) => updateMissionContent({ bodyText: e.target.value })}
                placeholder="داستان کوتاه یا متن حاوی اطلاعات مورد نیاز شرکت‌کننده را بنویسید..."
                className="w-full p-3 text-xs text-[#2A1D15] placeholder:text-[#9C8D7E] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-white focus:outline-none focus:border-[#5D3F2A]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#4A3525] mb-1.5">
                سؤال مرحله
              </label>
              <input
                type="text"
                value={content.question}
                onChange={(e) => updateMissionContent({ question: e.target.value })}
                placeholder="چه سؤالی از متن بالا باید پاسخ داده شود؟"
                className="w-full h-10 px-3 text-xs text-[#2A1D15] placeholder:text-[#9C8D7E] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-white focus:outline-none focus:border-[#5D3F2A]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#4A3525] mb-1.5">
                پاسخ نمونه / توضیح پاسخ صحیح
              </label>
              <input
                type="text"
                value={content.sampleAnswer}
                onChange={(e) => updateMissionContent({ sampleAnswer: e.target.value })}
                placeholder="پاسخ مورد انتظار برای راهنمای داوری یا بازخورد..."
                className="w-full h-10 px-3 text-xs text-[#2A1D15] placeholder:text-[#9C8D7E] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-white focus:outline-none focus:border-[#5D3F2A]"
              />
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="space-y-4 p-4 bg-[#FCFBF8] border border-[#E5DCCB] rounded-2xl">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#5D3F2A]">
              <ImageIcon className="w-4 h-4" />
              <span>محتوای مأموریت تصویری (تصویر، سؤال و رمز)</span>
            </div>
            <ImageField
              id={`puzzle-img-${currentStage?.id}`}
              label="تصویر معما یا نقشه مأموریت"
              value={content.puzzleImageUrl}
              onChange={(val) => updateMissionContent({ puzzleImageUrl: val })}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-[#4A3525] mb-1.5">
                  سؤال مرتبط با تصویر
                </label>
                <input
                  type="text"
                  value={content.imageQuestion}
                  onChange={(e) => updateMissionContent({ imageQuestion: e.target.value })}
                  placeholder="مثال: عدد مخفی روی تابلوی گوشه تصویر چیست؟"
                  className="w-full h-10 px-3 text-xs text-[#2A1D15] placeholder:text-[#9C8D7E] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-white focus:outline-none focus:border-[#5D3F2A]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#4A3525] mb-1.5">
                  رمز استخراج‌شده از تصویر
                </label>
                <input
                  type="text"
                  value={content.imageCodeClue}
                  onChange={(e) => updateMissionContent({ imageCodeClue: e.target.value })}
                  placeholder="مثال: ARCH-204"
                  className="w-full h-10 px-3 text-xs font-mono text-[#2A1D15] placeholder:text-[#9C8D7E] placeholder:font-sans bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-white focus:outline-none focus:border-[#5D3F2A]"
                />
              </div>
            </div>
          </div>
        );

      case 'video':
        return (
          <div className="space-y-4 p-4 bg-[#FCFBF8] border border-[#E5DCCB] rounded-2xl">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#5D3F2A]">
              <Video className="w-4 h-4" />
              <span>محتوای مأموریت ویدئویی (ویدئو و سرنخ)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#4A3525] mb-1.5">
                  لینک ویدئوی مأموریت
                </label>
                <input
                  type="text"
                  value={content.videoClueUrl}
                  onChange={(e) => updateMissionContent({ videoClueUrl: e.target.value })}
                  placeholder="https://..."
                  dir="ltr"
                  className="w-full h-10 px-3 text-xs font-mono text-[#2A1D15] placeholder:text-[#9C8D7E] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-white focus:outline-none focus:border-[#5D3F2A]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#4A3525] mb-1.5">
                  لحظه دقیق سرنخ (دقیقه:ثانیه)
                </label>
                <input
                  type="text"
                  value={content.videoTimestamp}
                  onChange={(e) => updateMissionContent({ videoTimestamp: e.target.value })}
                  placeholder="01:25"
                  dir="ltr"
                  className="w-full h-10 px-3 text-xs font-mono text-[#2A1D15] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-white focus:outline-none focus:border-[#5D3F2A]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#4A3525] mb-1.5">
                سرنخ و توضیح ویدئو
              </label>
              <textarea
                rows={3}
                value={content.videoClueText}
                onChange={(e) => updateMissionContent({ videoClueText: e.target.value })}
                placeholder="شرکت‌کننده در ویدئو باید به چه جزئیات یا دیالوگی توجه کند؟"
                className="w-full p-3 text-xs text-[#2A1D15] placeholder:text-[#9C8D7E] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-white focus:outline-none focus:border-[#5D3F2A]"
              />
            </div>
          </div>
        );

      case 'coding':
        return (
          <div className="space-y-4 p-4 bg-[#FCFBF8] border border-[#E5DCCB] rounded-2xl">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#5D3F2A]">
              <Code2 className="w-4 h-4" />
              <span>محتوای مأموریت کدنویسی (کد، صورت مسئله و پاسخ)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-[#4A3525] mb-1.5">
                  زبان برنامه‌نویسی
                </label>
                <select
                  value={content.codeLanguage}
                  onChange={(e) => updateMissionContent({ codeLanguage: e.target.value })}
                  className="w-full h-10 px-3 text-xs font-mono text-[#2A1D15] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-white focus:outline-none focus:border-[#5D3F2A]"
                >
                  <option value="JavaScript">JavaScript</option>
                  <option value="TypeScript">TypeScript</option>
                  <option value="Python">Python</option>
                  <option value="C++">C++</option>
                  <option value="SQL">SQL</option>
                  <option value="HTML/CSS">HTML / CSS</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#4A3525] mb-1.5">
                  خروجی / پاسخ مورد انتظار
                </label>
                <input
                  type="text"
                  value={content.codingExpectedOutput}
                  onChange={(e) => updateMissionContent({ codingExpectedOutput: e.target.value })}
                  placeholder="مثال: 42 یا خروجی تابع پس از رفع باگ"
                  className="w-full h-10 px-3 text-xs font-mono text-[#2A1D15] placeholder:font-sans placeholder:text-[#9C8D7E] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-white focus:outline-none focus:border-[#5D3F2A]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#4A3525] mb-1.5">
                صورت مسئله کدنویسی
              </label>
              <textarea
                rows={2}
                value={content.codingProblem}
                onChange={(e) => updateMissionContent({ codingProblem: e.target.value })}
                placeholder="شرح دقیق چالش الگوریتمی یا خطای موجود در کد..."
                className="w-full p-3 text-xs text-[#2A1D15] placeholder:text-[#9C8D7E] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-white focus:outline-none focus:border-[#5D3F2A]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#4A3525] mb-1.5">
                قطعه کد آغازین یا کد معما
              </label>
              <textarea
                rows={5}
                value={content.codeSnippet}
                onChange={(e) => updateMissionContent({ codeSnippet: e.target.value })}
                dir="ltr"
                className="w-full p-3 text-xs font-mono text-[#FAF7F0] bg-[#2A1D15] border border-[#4A3120] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5D3F2A]/30"
              />
            </div>
          </div>
        );

      case 'research':
        return (
          <div className="space-y-4 p-4 bg-[#FCFBF8] border border-[#E5DCCB] rounded-2xl">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#5D3F2A]">
              <FileSearch className="w-4 h-4" />
              <span>محتوای مأموریت تحقیقاتی (دستورالعمل و پاسخ)</span>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#4A3525] mb-1.5">
                دستورالعمل تحقیق و جستجو
              </label>
              <textarea
                rows={3}
                value={content.researchInstructions}
                onChange={(e) => updateMissionContent({ researchInstructions: e.target.value })}
                placeholder="مراحل پژوهش، پرسش کلیدی و معیار اعتبارسنجی یافته را بنویسید..."
                className="w-full p-3 text-xs text-[#2A1D15] placeholder:text-[#9C8D7E] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-white focus:outline-none focus:border-[#5D3F2A]"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-[#4A3525] mb-1.5">
                  منابع پیشنهادی یا کلیدواژه‌ها
                </label>
                <input
                  type="text"
                  value={content.researchSources}
                  onChange={(e) => updateMissionContent({ researchSources: e.target.value })}
                  placeholder="مثال: مستندات MDN، مقاله سال ۱۴۰۴..."
                  className="w-full h-10 px-3 text-xs text-[#2A1D15] placeholder:text-[#9C8D7E] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-white focus:outline-none focus:border-[#5D3F2A]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#4A3525] mb-1.5">
                  پاسخ کلیدی پژوهش
                </label>
                <input
                  type="text"
                  value={content.researchAnswerKey}
                  onChange={(e) => updateMissionContent({ researchAnswerKey: e.target.value })}
                  placeholder="واژه یا عدد نهایی به‌دست‌آمده از پژوهش..."
                  className="w-full h-10 px-3 text-xs text-[#2A1D15] placeholder:text-[#9C8D7E] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-white focus:outline-none focus:border-[#5D3F2A]"
                />
              </div>
            </div>
          </div>
        );

      case 'secret_code':
        return (
          <div className="space-y-4 p-4 bg-[#FCFBF8] border border-[#E5DCCB] rounded-2xl">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#5D3F2A]">
              <KeyRound className="w-4 h-4" />
              <span>محتوای مأموریت رمز مخفی (سرنخ و رمز)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-[#4A3525] mb-1.5">
                  روش رمزنگاری یا الگوی سرنخ
                </label>
                <input
                  type="text"
                  value={content.cipherMethod}
                  onChange={(e) => updateMissionContent({ cipherMethod: e.target.value })}
                  placeholder="مثال: رمز سزار (+۳)، کد مورس، آکروستیک"
                  className="w-full h-10 px-3 text-xs text-[#2A1D15] placeholder:text-[#9C8D7E] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-white focus:outline-none focus:border-[#5D3F2A]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#4A3525] mb-1.5">
                  یادداشت کلید رمزگشایی
                </label>
                <input
                  type="text"
                  value={content.secretClueNote}
                  onChange={(e) => updateMissionContent({ secretClueNote: e.target.value })}
                  placeholder="مثال: حرف اول هر سطر را کنار هم بگذارید"
                  className="w-full h-10 px-3 text-xs text-[#2A1D15] placeholder:text-[#9C8D7E] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-white focus:outline-none focus:border-[#5D3F2A]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#4A3525] mb-1.5">
                متن سرنخ رمزنگاری‌شده
              </label>
              <textarea
                rows={3}
                value={content.cipherHint}
                onChange={(e) => updateMissionContent({ cipherHint: e.target.value })}
                placeholder="رشته رمزشده یا متن سرنخ مخفی را اینجا وارد کنید..."
                className="w-full p-3 text-xs font-mono text-[#2A1D15] placeholder:font-sans placeholder:text-[#9C8D7E] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-white focus:outline-none focus:border-[#5D3F2A]"
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* Stage Count Bar */}
      <div className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[22px] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-[0_2px_10px_rgba(78,52,34,0.04)]">
        <div>
          <h2 className="text-sm font-extrabold text-[#2A1D15]">
            تعداد مراحل مسابقه و ساختار مأموریت‌ها
          </h2>
          <p className="mt-0.5 text-xs text-[#7A6A5B]">
            با تغییر تعداد مراحل، منوی هر مرحله به‌صورت خودکار ساخته می‌شود. گاوصندوق نهایی به‌عنوان بخش مستقل همیشه در انتهای منو قرار دارد.
          </p>
        </div>

        <div className="flex items-center gap-2.5 bg-[#F3ECE0] border border-[#E2D9C8] rounded-2xl p-1.5">
          <span className="text-xs font-bold text-[#4A3525] px-2 whitespace-nowrap">
            تعداد مراحل:
          </span>
          <button
            type="button"
            onClick={() => handleStageCountChange(stages.length - 1)}
            disabled={stages.length <= 1}
            aria-label="کاهش تعداد مراحل"
            className="w-8 h-8 rounded-xl bg-[#FAF7F0] border border-[#DDD2BE] text-[#5D3F2A] hover:bg-[#EFE6D5] disabled:opacity-40 inline-flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <input
            type="number"
            min={1}
            max={15}
            value={stages.length}
            onChange={(e) => handleStageCountChange(Number(e.target.value) || 1)}
            aria-label="تعداد مراحل"
            className="w-12 h-8 text-center text-sm font-extrabold tabular-nums text-[#2A1D15] bg-[#FAF7F0] border border-[#DDD2BE] rounded-xl focus:outline-none focus:border-[#5D3F2A]"
          />
          <button
            type="button"
            onClick={() => handleStageCountChange(stages.length + 1)}
            disabled={stages.length >= 15}
            aria-label="افزایش تعداد مراحل"
            className="w-8 h-8 rounded-xl bg-[#5D3F2A] text-[#FAF7F0] hover:bg-[#4A3120] disabled:opacity-40 inline-flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Split: Right Stage Menu + Left Stage Form / Final Vault Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Per-Stage Navigation Menu + Independent Final Vault Item */}
        <aside className="lg:col-span-3 bg-[#FAF7F0] border border-[#E2D9C8] rounded-[22px] p-3.5 shadow-[0_2px_10px_rgba(78,52,34,0.04)] space-y-3">
          <div className="px-2 pt-1 flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#5D3F2A]">منوی مراحل</span>
            <span className="text-[11px] text-[#8C7C6D] tabular-nums">
              {toPersianDigits(stages.length)} مرحله
            </span>
          </div>

          <div className="space-y-1.5">
            {stages.map((st, idx) => {
              const isSelected = selected.kind === 'stage' && safeStageIndex === idx;
              const typeMeta =
                STAGE_TYPE_OPTIONS.find((t) => t.value === (st.stageType ?? 'text')) ??
                STAGE_TYPE_OPTIONS[0];
              const isActive = st.advancedSettings?.isActive ?? true;
              const pts = st.passwordSettings?.points ?? st.points;

              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSelected({ kind: 'stage', index: idx })}
                  className={`w-full text-right px-3.5 py-3 rounded-2xl transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#5D3F2A] text-[#FAF7F0] shadow-[0_3px_10px_rgba(93,63,42,0.2)]'
                      : 'bg-[#FCFBF8] hover:bg-[#F3ECE0] text-[#2A1D15] border border-[#EAE2D3]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold truncate">
                      {toPersianDigits(idx + 1)}. {st.title || `مرحله ${toPersianDigits(idx + 1)}`}
                    </span>
                    <span
                      className={`text-[11px] tabular-nums shrink-0 ${
                        isSelected ? 'text-[#E7DEC9]' : 'text-[#8C7C6D]'
                      }`}
                    >
                      {formatPersianNumber(pts)} امت
                    </span>
                  </div>
                  <div
                    className={`mt-1 flex items-center justify-between text-[11px] ${
                      isSelected ? 'text-[#E7DEC9]' : 'text-[#7A6A5B]'
                    }`}
                  >
                    <span>{typeMeta.label}</span>
                    <span>{isActive ? 'فعال' : 'غیرفعال'}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Independent Final Vault Section in Stage Menu */}
          <div className="pt-3 border-t border-[#EAE2D3] space-y-2">
            <p className="px-2 text-[11px] font-bold text-[#8C7C6D]">بخش مستقل پایان مسابقه</p>
            <button
              type="button"
              onClick={() => setSelected({ kind: 'vault' })}
              className={`w-full text-right px-3.5 py-3.5 rounded-2xl flex items-center justify-between gap-2.5 transition-colors cursor-pointer ${
                selected.kind === 'vault'
                  ? 'bg-[#0F766E] text-[#FAF7F0] shadow-[0_3px_10px_rgba(15,118,110,0.25)]'
                  : 'bg-[#DFEFEA]/80 hover:bg-[#DFEFEA] text-[#0F766E] border border-[#C6E2DA]'
              }`}
            >
              <div className="min-w-0">
                <p className="text-xs font-extrabold truncate">گاوصندوق نهایی</p>
                <p
                  className={`mt-0.5 text-[11px] truncate ${
                    selected.kind === 'vault' ? 'text-[#D6F1EA]' : 'text-[#2D6A63]'
                  }`}
                >
                  Final Vault · {formatPersianNumber(finalVault.finalScore)} امتیاز
                </p>
              </div>
              <Lock className="w-4 h-4 shrink-0" aria-hidden="true" />
            </button>
          </div>
        </aside>

        {/* Editor Area */}
        <div className="lg:col-span-9 min-w-0">
          {selected.kind === 'stage' && currentStage ? (
            <div className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[22px] shadow-[0_2px_10px_rgba(78,52,34,0.04)] overflow-hidden">
              {/* Stage Form Header + 5 Tabs */}
              <div className="px-5 pt-5 pb-4 border-b border-[#EAE2D3] space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs text-[#7A6A5B]">
                      تنظیمات مرحله {toPersianDigits(safeStageIndex + 1)} از{' '}
                      {toPersianDigits(stages.length)}
                    </p>
                    <h3 className="text-base font-extrabold text-[#2A1D15] mt-0.5">
                      {currentStage.title || `مرحله ${toPersianDigits(safeStageIndex + 1)}`}
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-[#0F766E] bg-[#DFEFEA] px-3 py-1 rounded-xl">
                    نوع مأموریت:{' '}
                    {STAGE_TYPE_OPTIONS.find((t) => t.value === (currentStage.stageType ?? 'text'))
                      ?.label ?? 'متنی'}
                  </span>
                </div>

                {/* 5 Stage Tabs */}
                <div
                  role="tablist"
                  aria-label="تب‌های فرم ساخت مرحله"
                  className="flex items-center gap-1.5 p-1.5 bg-[#EFE7D8] rounded-2xl overflow-x-auto"
                >
                  {STAGE_TABS.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setActiveTab(tab.id)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          isActive
                            ? 'bg-[#5D3F2A] text-[#FAF7F0] shadow-xs'
                            : 'text-[#5D3F2A] hover:bg-[#E7DEC9]/80'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tab Body */}
              <div className="p-5 sm:p-6">
                {/* TAB 1: اطلاعات مرحله */}
                {activeTab === 'info' && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-[#4A3525] mb-1.5">
                          عنوان مرحله
                        </label>
                        <input
                          type="text"
                          value={currentStage.title}
                          onChange={(e) =>
                            updateCurrentStage((st) => ({ ...st, title: e.target.value }))
                          }
                          placeholder="مثال: دروازه نخست — رمز کتابخانه"
                          className="w-full h-10 px-3 text-sm text-[#2A1D15] placeholder:text-[#9C8D7E] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-[#FCFBF8] focus:outline-none focus:border-[#5D3F2A]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#4A3525] mb-1.5">
                          لینک ویدئوی معرفی مرحله (اختیاری)
                        </label>
                        <input
                          type="text"
                          value={currentStage.videoUrl ?? ''}
                          onChange={(e) =>
                            updateCurrentStage((st) => ({ ...st, videoUrl: e.target.value }))
                          }
                          placeholder="https://..."
                          dir="ltr"
                          className="w-full h-10 px-3 text-xs font-mono text-[#2A1D15] placeholder:text-[#9C8D7E] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-[#FCFBF8] focus:outline-none focus:border-[#5D3F2A]"
                        />
                      </div>
                    </div>

                    {/* Stage Type Selector (7 Exact Types) */}
                    <div>
                      <label className="block text-xs font-bold text-[#4A3525] mb-2">
                        نوع مرحله (تعیین‌کننده امکانات تب «محتوای مأموریت»)
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5">
                        {STAGE_TYPE_OPTIONS.map((opt) => {
                          const isSelected = (currentStage.stageType ?? 'text') === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() =>
                                updateCurrentStage((st) => ({ ...st, stageType: opt.value }))
                              }
                              className={`text-right p-3 rounded-2xl border transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-[#5D3F2A] text-[#FAF7F0] border-[#5D3F2A]'
                                  : 'bg-[#FCFBF8] text-[#2A1D15] border-[#E5DCCB] hover:border-[#CFC2AC]'
                              }`}
                            >
                              <p className="text-xs font-extrabold">{opt.label}</p>
                              <p
                                className={`mt-0.5 text-[11px] ${
                                  isSelected ? 'text-[#E7DEC9]' : 'text-[#7A6A5B]'
                                }`}
                              >
                                {opt.summary}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#4A3525] mb-1.5">
                        توضیحات مرحله
                      </label>
                      <textarea
                        rows={2}
                        value={currentStage.description}
                        onChange={(e) =>
                          updateCurrentStage((st) => ({ ...st, description: e.target.value }))
                        }
                        placeholder="توضیح کوتاه درباره هدف و ساختار این مرحله..."
                        className="w-full p-3 text-sm text-[#2A1D15] placeholder:text-[#9C8D7E] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-[#FCFBF8] focus:outline-none focus:border-[#5D3F2A]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#4A3525] mb-1.5">
                        متن مأموریت (نمایش‌داده‌شده برای شرکت‌کننده)
                      </label>
                      <textarea
                        rows={3}
                        value={currentStage.missionText ?? ''}
                        onChange={(e) =>
                          updateCurrentStage((st) => ({ ...st, missionText: e.target.value }))
                        }
                        placeholder="شرح مأموریت و روایت داستانی این مرحله را بنویسید..."
                        className="w-full p-3 text-sm text-[#2A1D15] placeholder:text-[#9C8D7E] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-[#FCFBF8] focus:outline-none focus:border-[#5D3F2A]"
                      />
                    </div>

                    <ImageField
                      id={`stage-img-${currentStage.id}`}
                      label="تصویر مرحله"
                      value={currentStage.imageUrl ?? ''}
                      onChange={(val) =>
                        updateCurrentStage((st) => ({ ...st, imageUrl: val }))
                      }
                    />
                  </div>
                )}

                {/* TAB 2: محتوای مأموریت (Dynamic by stageType) */}
                {activeTab === 'content' && (() => {
                  const stageType: StageType = currentStage.stageType ?? 'text';
                  const content = currentStage.missionContent ?? createDefaultMissionContent();

                  if (stageType !== 'hybrid') {
                    return (
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#7A6A5B] pb-2 border-b border-[#EAE2D3]">
                          <span>
                            فرم زیر به‌طور اختصاصی متناسب با نوع مرحله{' '}
                            <strong className="text-[#2A1D15]">
                              «{STAGE_TYPE_OPTIONS.find((t) => t.value === stageType)?.label}»
                            </strong>{' '}
                            نمایش داده شده است.
                          </span>
                          <button
                            type="button"
                            onClick={() => setActiveTab('info')}
                            className="text-[#5D3F2A] font-bold hover:underline cursor-pointer"
                          >
                            تغییر نوع مرحله
                          </button>
                        </div>

                        {renderMissionFieldsForType(stageType, content)}
                      </div>
                    );
                  }

                  // Hybrid mode: compose multiple content modules
                  const activeModules = content.hybridModules ?? ['text', 'image'];
                  const toggleHybridModule = (
                    mod: 'text' | 'image' | 'video' | 'coding' | 'research' | 'secret_code'
                  ) => {
                    const exists = activeModules.includes(mod);
                    const next = exists
                      ? activeModules.filter((m) => m !== mod)
                      : [...activeModules, mod];
                    updateMissionContent({ hybridModules: next });
                  };

                  return (
                    <div className="space-y-5">
                      <div className="p-4 bg-[#F3ECE0] border border-[#E2D9C8] rounded-2xl space-y-3">
                        <div className="flex items-center gap-2 text-xs font-extrabold text-[#2A1D15]">
                          <CheckSquare className="w-4 h-4 text-[#5D3F2A]" />
                          <span>انتخاب بخش‌های ترکیبی این مرحله</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {HYBRID_MODULE_OPTIONS.map((mod) => {
                            const checked = activeModules.includes(mod.id);
                            return (
                              <button
                                key={mod.id}
                                type="button"
                                onClick={() => toggleHybridModule(mod.id)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                                  checked
                                    ? 'bg-[#5D3F2A] text-[#FAF7F0] border-[#5D3F2A]'
                                    : 'bg-[#FAF7F0] text-[#5D3F2A] border-[#DDD2BE] hover:bg-[#EFE6D5]'
                                }`}
                              >
                                {checked ? '✓ ' : '+ '}
                                {mod.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {activeModules.length === 0 ? (
                        <div className="py-8 text-center text-xs text-[#7A6A5B] border border-dashed border-[#D8CBB8] rounded-2xl">
                          حداقل یک نوع محتوا از گزینه‌های بالا انتخاب کنید تا بخش‌های آن نمایش داده شود.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {activeModules.map((mod) => (
                            <div key={mod}>{renderMissionFieldsForType(mod, content)}</div>
                          ))}
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-bold text-[#4A3525] mb-1.5">
                          یادداشت نحوه ترکیب سرنخ‌ها
                        </label>
                        <textarea
                          rows={2}
                          value={content.hybridNotes}
                          onChange={(e) => updateMissionContent({ hybridNotes: e.target.value })}
                          placeholder="توضیح دهید شرکت‌کننده چگونه باید داده‌های بخش‌های مختلف را به رمز نهایی برساند..."
                          className="w-full p-3 text-xs text-[#2A1D15] placeholder:text-[#9C8D7E] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-white focus:outline-none focus:border-[#5D3F2A]"
                        />
                      </div>
                    </div>
                  );
                })()}

                {/* TAB 3: تنظیمات رمز */}
                {activeTab === 'password' && (() => {
                  const pw = currentStage.passwordSettings ?? {
                    correctCode: '',
                    caseSensitive: false,
                    trimWhitespace: true,
                    maxAttempts: scoring.maxWrongAttempts,
                    cooldownSeconds: 15,
                    points: currentStage.points,
                    penaltyPoints: scoring.wrongAttemptPenalty,
                  };
                  const updatePw = (patch: Partial<typeof pw>) => {
                    updateCurrentStage((st) => ({
                      ...st,
                      points: patch.points ?? pw.points,
                      passwordSettings: { ...pw, ...patch },
                    }));
                  };

                  return (
                    <div className="space-y-5">
                      <div>
                        <label className="block text-xs font-bold text-[#4A3525] mb-1.5">
                          رمز صحیح مرحله
                        </label>
                        <input
                          type="text"
                          value={pw.correctCode}
                          onChange={(e) => updatePw({ correctCode: e.target.value })}
                          placeholder="رمز یا پاسخ دقیق عبور از این مرحله را وارد کنید..."
                          className="w-full h-11 px-3.5 text-sm font-mono text-[#2A1D15] placeholder:font-sans placeholder:text-[#9C8D7E] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-[#FCFBF8] focus:outline-none focus:border-[#5D3F2A]"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <ToggleRow
                          label="حساسیت به حروف بزرگ و کوچک"
                          description="در صورت فعال بودن، حروف انگلیسی بزرگ و کوچک متمایز بررسی می‌شوند"
                          checked={pw.caseSensitive}
                          onChange={(val) => updatePw({ caseSensitive: val })}
                        />
                        <ToggleRow
                          label="حذف فاصله‌های اضافی هنگام بررسی"
                          description="فاصله‌های ابتدا، انتها و تکراری پیش از تطبیق رمز حذف می‌شوند"
                          checked={pw.trimWhitespace}
                          onChange={(val) => updatePw({ trimWhitespace: val })}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                        <div>
                          <label className="block text-xs font-bold text-[#4A3525] mb-1.5">
                            تعداد تلاش مجاز
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={100}
                            value={pw.maxAttempts}
                            onChange={(e) =>
                              updatePw({ maxAttempts: Math.max(1, Number(e.target.value) || 1) })
                            }
                            className="w-full h-10 px-3 text-sm tabular-nums text-[#2A1D15] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-[#FCFBF8] focus:outline-none focus:border-[#5D3F2A]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#4A3525] mb-1.5">
                            محدودیت زمانی بین تلاش‌ها (ثانیه)
                          </label>
                          <input
                            type="number"
                            min={0}
                            step={5}
                            value={pw.cooldownSeconds}
                            onChange={(e) =>
                              updatePw({ cooldownSeconds: Math.max(0, Number(e.target.value) || 0) })
                            }
                            className="w-full h-10 px-3 text-sm tabular-nums text-[#2A1D15] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-[#FCFBF8] focus:outline-none focus:border-[#5D3F2A]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#4A3525] mb-1.5">
                            امتیاز مرحله
                          </label>
                          <input
                            type="number"
                            min={0}
                            step={10}
                            value={pw.points}
                            onChange={(e) =>
                              updatePw({ points: Math.max(0, Number(e.target.value) || 0) })
                            }
                            className="w-full h-10 px-3 text-sm tabular-nums text-[#2A1D15] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-[#FCFBF8] focus:outline-none focus:border-[#5D3F2A]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#4A3525] mb-1.5">
                            امتیاز جریمه (هر پاسخ اشتباه)
                          </label>
                          <input
                            type="number"
                            min={0}
                            step={5}
                            value={pw.penaltyPoints}
                            onChange={(e) =>
                              updatePw({ penaltyPoints: Math.max(0, Number(e.target.value) || 0) })
                            }
                            className="w-full h-10 px-3 text-sm tabular-nums text-[#2A1D15] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-[#FCFBF8] focus:outline-none focus:border-[#5D3F2A]"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* TAB 4: راهنمایی‌ها */}
                {activeTab === 'hints' && (() => {
                  const hints: StageHint[] = currentStage.hints ?? [];
                  const updateHints = (next: StageHint[]) =>
                    updateCurrentStage((st) => ({ ...st, hints: next }));

                  const addHint = () => {
                    const num = hints.length + 1;
                    updateHints([
                      ...hints,
                      {
                        id: `hint-${Date.now()}`,
                        title: `راهنمایی ${toPersianDigits(num)}`,
                        text: '',
                        pointDeduction: num * 15,
                      },
                    ]);
                  };

                  return (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs text-[#7A6A5B]">
                          می‌توانید چند سطح راهنمایی (از سرنخ کوچک تا راهنمایی تقریباً مستقیم) با میزان کسر امتیاز اختصاصی تعریف کنید.
                        </p>
                        <button
                          type="button"
                          onClick={addHint}
                          className="inline-flex items-center gap-1.5 h-9 px-3.5 text-xs font-bold text-[#FAF7F0] bg-[#5D3F2A] hover:bg-[#4A3120] rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>افزودن راهنمایی جدید</span>
                        </button>
                      </div>

                      {hints.length === 0 ? (
                        <div className="py-8 text-center text-xs text-[#7A6A5B] border border-dashed border-[#D8CBB8] rounded-2xl">
                          راهنمایی برای این مرحله ثبت نشده است.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {hints.map((hint, idx) => (
                            <div
                              key={hint.id}
                              className="p-4 bg-[#FCFBF8] border border-[#E5DCCB] rounded-2xl space-y-3"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex-1 min-w-[200px]">
                                  <label className="block text-[11px] font-bold text-[#7A6A5B] mb-1">
                                    عنوان / سطح راهنمایی {toPersianDigits(idx + 1)}
                                  </label>
                                  <input
                                    type="text"
                                    value={hint.title}
                                    onChange={(e) =>
                                      updateHints(
                                        hints.map((h) =>
                                          h.id === hint.id ? { ...h, title: e.target.value } : h
                                        )
                                      )
                                    }
                                    className="w-full h-9 px-3 text-xs font-bold text-[#2A1D15] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-white focus:outline-none focus:border-[#5D3F2A]"
                                  />
                                </div>

                                <div className="w-36">
                                  <label className="block text-[11px] font-bold text-[#B45309] mb-1">
                                    میزان کسر امتیاز
                                  </label>
                                  <input
                                    type="number"
                                    min={0}
                                    step={5}
                                    value={hint.pointDeduction}
                                    onChange={(e) =>
                                      updateHints(
                                        hints.map((h) =>
                                          h.id === hint.id
                                            ? {
                                                ...h,
                                                pointDeduction: Math.max(
                                                  0,
                                                  Number(e.target.value) || 0
                                                ),
                                              }
                                            : h
                                        )
                                      )
                                    }
                                    className="w-full h-9 px-3 text-xs font-bold tabular-nums text-[#2A1D15] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-white focus:outline-none focus:border-[#5D3F2A]"
                                  />
                                </div>

                                <button
                                  type="button"
                                  onClick={() => updateHints(hints.filter((h) => h.id !== hint.id))}
                                  aria-label="حذف راهنمایی"
                                  className="mt-4 p-2 text-[#B91C1C] hover:bg-[#FEE2E2]/70 rounded-xl cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-[#7A6A5B] mb-1">
                                  متن راهنمایی
                                </label>
                                <textarea
                                  rows={2}
                                  value={hint.text}
                                  onChange={(e) =>
                                    updateHints(
                                      hints.map((h) =>
                                        h.id === hint.id ? { ...h, text: e.target.value } : h
                                      )
                                    )
                                  }
                                  placeholder="متن سرنخ قابل نمایش پس از تایید کسر امتیاز..."
                                  className="w-full p-2.5 text-xs text-[#2A1D15] placeholder:text-[#9C8D7E] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-white focus:outline-none focus:border-[#5D3F2A]"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* TAB 5: تنظیمات پیشرفته */}
                {activeTab === 'advanced' && (() => {
                  const adv = currentStage.advancedSettings ?? {
                    isActive: true,
                    showNextAfterComplete: true,
                    timeLimitMinutes: 20,
                    allowRetry: true,
                    dependsOnPrevious: safeStageIndex > 0,
                    saveProgressState: true,
                  };
                  const updateAdv = (patch: Partial<typeof adv>) =>
                    updateCurrentStage((st) => ({
                      ...st,
                      advancedSettings: { ...adv, ...patch },
                    }));

                  return (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <ToggleRow
                          label="فعال یا غیرفعال بودن مرحله"
                          description="مراحل غیرفعال در جریان مسابقه برای کاربران نمایش داده نمی‌شوند"
                          checked={adv.isActive}
                          onChange={(val) => updateAdv({ isActive: val })}
                        />
                        <ToggleRow
                          label="نمایش مرحله بعد از تکمیل"
                          description="بلافاصله پس از ثبت رمز صحیح، مرحله بعدی باز شود"
                          checked={adv.showNextAfterComplete}
                          onChange={(val) => updateAdv({ showNextAfterComplete: val })}
                        />
                        <ToggleRow
                          label="امکان تلاش مجدد"
                          description="کاربر پس از اتمام زمان انتظار بتواند مجدداً پاسخ ثبت کند"
                          checked={adv.allowRetry}
                          onChange={(val) => updateAdv({ allowRetry: val })}
                        />
                        <ToggleRow
                          label="وابستگی به مرحله قبلی"
                          description="ورود به این مرحله منوط به تکمیل موفق مرحله قبل باشد"
                          checked={adv.dependsOnPrevious}
                          onChange={(val) => updateAdv({ dependsOnPrevious: val })}
                        />
                        <ToggleRow
                          label="ذخیره وضعیت مرحله"
                          description="پیشرفت، راهنمایی‌های بازشده و تلاش‌های کاربر به‌صورت خودکار ذخیره شود"
                          checked={adv.saveProgressState}
                          onChange={(val) => updateAdv({ saveProgressState: val })}
                        />

                        <div className="p-3.5 bg-[#FCFBF8] border border-[#E5DCCB] rounded-2xl flex items-center justify-between gap-4">
                          <div>
                            <p className="text-xs font-bold text-[#2A1D15]">زمان مجاز مرحله (دقیقه)</p>
                            <p className="mt-0.5 text-[11px] text-[#7A6A5B]">
                              عدد ۰ به معنای بدون محدودیت زمانی است
                            </p>
                          </div>
                          <input
                            type="number"
                            min={0}
                            step={5}
                            value={adv.timeLimitMinutes}
                            onChange={(e) =>
                              updateAdv({
                                timeLimitMinutes: Math.max(0, Number(e.target.value) || 0),
                              })
                            }
                            className="w-20 h-9 px-2.5 text-center text-sm font-bold tabular-nums text-[#2A1D15] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-white focus:outline-none focus:border-[#5D3F2A]"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          ) : (
            /* INDEPENDENT FINAL VAULT MANAGEMENT PANEL */
            <div className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[22px] shadow-[0_2px_10px_rgba(78,52,34,0.04)] overflow-hidden">
              <div className="px-6 py-4 bg-[#DFEFEA]/55 border-b border-[#C6E2DA] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#0F766E] text-[#FAF7F0] flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-[#2A1D15]">
                      مدیریت گاوصندوق نهایی (Final Vault)
                    </h3>
                    <p className="text-xs text-[#2D6A63]">
                      بخش مستقل قفل نهایی، تنظیمات امنیتی کلید/رمز و قوانین انتخاب برنده
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-7">
                {/* 1. اطلاعات ظاهری */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-[#EAE2D3]">
                    <Settings2 className="w-4 h-4 text-[#5D3F2A]" />
                    <h4 className="text-sm font-extrabold text-[#2A1D15]">۱. اطلاعات ظاهری</h4>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4A3525] mb-1.5">
                      عنوان گاوصندوق
                    </label>
                    <input
                      type="text"
                      value={finalVault.title}
                      onChange={(e) =>
                        onChangeFinalVault({ ...finalVault, title: e.target.value })
                      }
                      placeholder="مثال: گاوصندوق اسرارآمیز آزمایشگاه مرکزی"
                      className="w-full h-10 px-3 text-sm text-[#2A1D15] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-[#FCFBF8] focus:outline-none focus:border-[#5D3F2A]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ImageField
                      id="vault-closed-img"
                      label="تصویر گاوصندوق (حالت بسته)"
                      value={finalVault.vaultImageUrl}
                      onChange={(val) =>
                        onChangeFinalVault({ ...finalVault, vaultImageUrl: val })
                      }
                    />
                    <ImageField
                      id="vault-open-img"
                      label="تصویر حالت بازشده"
                      value={finalVault.openedImageUrl}
                      onChange={(val) =>
                        onChangeFinalVault({ ...finalVault, openedImageUrl: val })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#4A3525] mb-1.5">
                        متن قبل از باز شدن
                      </label>
                      <textarea
                        rows={3}
                        value={finalVault.beforeOpenText}
                        onChange={(e) =>
                          onChangeFinalVault({ ...finalVault, beforeOpenText: e.target.value })
                        }
                        className="w-full p-3 text-xs text-[#2A1D15] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-[#FCFBF8] focus:outline-none focus:border-[#5D3F2A]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#4A3525] mb-1.5">
                        پیام موفقیت (پس از باز شدن گاوصندوق)
                      </label>
                      <textarea
                        rows={3}
                        value={finalVault.successMessage}
                        onChange={(e) =>
                          onChangeFinalVault({ ...finalVault, successMessage: e.target.value })
                        }
                        className="w-full p-3 text-xs text-[#2A1D15] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-[#FCFBF8] focus:outline-none focus:border-[#5D3F2A]"
                      />
                    </div>
                  </div>
                </section>

                {/* 2. تنظیمات امنیتی */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-[#EAE2D3]">
                    <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
                    <h4 className="text-sm font-extrabold text-[#2A1D15]">۲. تنظیمات امنیتی</h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#4A3525] mb-1.5">
                        رمز نهایی گاوصندوق
                      </label>
                      <input
                        type="text"
                        value={finalVault.finalCode}
                        onChange={(e) =>
                          onChangeFinalVault({ ...finalVault, finalCode: e.target.value })
                        }
                        placeholder="مثال: VAULT-1405-GOLD"
                        className="w-full h-10 px-3 text-sm font-mono text-[#2A1D15] placeholder:font-sans placeholder:text-[#9C8D7E] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-[#FCFBF8] focus:outline-none focus:border-[#5D3F2A]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#4A3525] mb-1.5">
                        کلید نهایی (Key)
                      </label>
                      <input
                        type="text"
                        value={finalVault.finalKey}
                        onChange={(e) =>
                          onChangeFinalVault({ ...finalVault, finalKey: e.target.value })
                        }
                        placeholder="مثال: MASTER-KEY-01"
                        className="w-full h-10 px-3 text-sm font-mono text-[#2A1D15] placeholder:font-sans placeholder:text-[#9C8D7E] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-[#FCFBF8] focus:outline-none focus:border-[#5D3F2A]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#4A3525] mb-1.5">
                        تعداد تلاش مجاز
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={finalVault.maxAttempts}
                        onChange={(e) =>
                          onChangeFinalVault({
                            ...finalVault,
                            maxAttempts: Math.max(1, Number(e.target.value) || 1),
                          })
                        }
                        className="w-full h-10 px-3 text-sm tabular-nums text-[#2A1D15] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-[#FCFBF8] focus:outline-none focus:border-[#5D3F2A]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#4A3525] mb-1.5">
                        محدودیت زمانی تلاش (ثانیه)
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={5}
                        value={finalVault.attemptCooldownSeconds}
                        onChange={(e) =>
                          onChangeFinalVault({
                            ...finalVault,
                            attemptCooldownSeconds: Math.max(0, Number(e.target.value) || 0),
                          })
                        }
                        className="w-full h-10 px-3 text-sm tabular-nums text-[#2A1D15] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-[#FCFBF8] focus:outline-none focus:border-[#5D3F2A]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <ToggleRow
                      label="نیاز به داشتن کلید برای وارد کردن رمز"
                      description="کاربر پیش از ثبت رمز نهایی باید کلید نهایی را نیز وارد یا آزاد کرده باشد"
                      checked={finalVault.requireKeyForCode}
                      onChange={(val) =>
                        onChangeFinalVault({ ...finalVault, requireKeyForCode: val })
                      }
                    />
                    <ToggleRow
                      label="امکان باز شدن توسط چند دانش‌آموز"
                      description="پس از باز شدن توسط نفر اول، سایر شرکت‌کنندگان نیز بتوانند قفل را باز کنند"
                      checked={finalVault.allowMultipleStudents}
                      onChange={(val) =>
                        onChangeFinalVault({ ...finalVault, allowMultipleStudents: val })
                      }
                    />
                  </div>
                </section>

                {/* 3. تنظیمات برنده شدن */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-[#EAE2D3]">
                    <Trophy className="w-4 h-4 text-[#5D3F2A]" />
                    <h4 className="text-sm font-extrabold text-[#2A1D15]">۳. تنظیمات برنده شدن</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        onChangeFinalVault({
                          ...finalVault,
                          winnerMode: 'first_only',
                          maxWinnersCount: 1,
                        })
                      }
                      className={`text-right p-3.5 rounded-2xl border transition-colors cursor-pointer ${
                        finalVault.winnerMode === 'first_only'
                          ? 'bg-[#5D3F2A] text-[#FAF7F0] border-[#5D3F2A]'
                          : 'bg-[#FCFBF8] text-[#2A1D15] border-[#E5DCCB] hover:border-[#CFC2AC]'
                      }`}
                    >
                      <p className="text-xs font-extrabold">فقط اولین فرد برنده باشد</p>
                      <p
                        className={`mt-1 text-[11px] ${
                          finalVault.winnerMode === 'first_only'
                            ? 'text-[#E7DEC9]'
                            : 'text-[#7A6A5B]'
                        }`}
                      >
                        اولین نفری که گاوصندوق را باز کند برنده یگانه مسابقه است
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onChangeFinalVault({
                          ...finalVault,
                          winnerMode: 'multiple',
                          maxWinnersCount: Math.max(2, finalVault.maxWinnersCount),
                        })
                      }
                      className={`text-right p-3.5 rounded-2xl border transition-colors cursor-pointer ${
                        finalVault.winnerMode === 'multiple'
                          ? 'bg-[#5D3F2A] text-[#FAF7F0] border-[#5D3F2A]'
                          : 'bg-[#FCFBF8] text-[#2A1D15] border-[#E5DCCB] hover:border-[#CFC2AC]'
                      }`}
                    >
                      <p className="text-xs font-extrabold">چند نفر برنده باشند</p>
                      <p
                        className={`mt-1 text-[11px] ${
                          finalVault.winnerMode === 'multiple'
                            ? 'text-[#E7DEC9]'
                            : 'text-[#7A6A5B]'
                        }`}
                      >
                        تا سقف تعداد برندگان مجاز، نفرات برتر انتخاب می‌شوند
                      </p>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-[#4A3525] mb-1.5">
                        تعداد برندگان مجاز
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={500}
                        disabled={finalVault.winnerMode === 'first_only'}
                        value={finalVault.winnerMode === 'first_only' ? 1 : finalVault.maxWinnersCount}
                        onChange={(e) =>
                          onChangeFinalVault({
                            ...finalVault,
                            maxWinnersCount: Math.max(1, Number(e.target.value) || 1),
                          })
                        }
                        className="w-full h-10 px-3 text-sm tabular-nums text-[#2A1D15] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl disabled:opacity-50 focus:bg-[#FCFBF8] focus:outline-none focus:border-[#5D3F2A]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#4A3525] mb-1.5">
                        امتیاز نهایی باز کردن گاوصندوق
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={25}
                        value={finalVault.finalScore}
                        onChange={(e) =>
                          onChangeFinalVault({
                            ...finalVault,
                            finalScore: Math.max(0, Number(e.target.value) || 0),
                          })
                        }
                        className="w-full h-10 px-3 text-sm tabular-nums text-[#2A1D15] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-[#FCFBF8] focus:outline-none focus:border-[#5D3F2A]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#4A3525] mb-1.5">
                        جایزه برنده
                      </label>
                      <input
                        type="text"
                        value={finalVault.winnerPrize}
                        onChange={(e) =>
                          onChangeFinalVault({ ...finalVault, winnerPrize: e.target.value })
                        }
                        placeholder="شرح جایزه نقدی یا غیرنقدی..."
                        className="w-full h-10 px-3 text-xs text-[#2A1D15] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-[#FCFBF8] focus:outline-none focus:border-[#5D3F2A]"
                      />
                    </div>
                  </div>

                  <ToggleRow
                    label="توقف خودکار مسابقه پس از مشخص شدن برنده"
                    description="به محض تکمیل ظرفیت برندگان مجاز، وضعیت مسابقه به‌طور خودکار متوقف/پایان‌یافته شود"
                    checked={finalVault.autoStopOnWinner}
                    onChange={(val) =>
                      onChangeFinalVault({ ...finalVault, autoStopOnWinner: val })
                    }
                  />
                </section>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
