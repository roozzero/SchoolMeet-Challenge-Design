import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Menu,
  PauseCircle,
  PlayCircle,
  Plus,
  RotateCcw,
  Settings,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { ContestCard } from './components/ContestCard';
import { ContestTable } from './components/ContestTable';
import { FilterBar } from './components/FilterBar';
import { RecentActivities } from './components/RecentActivities';
import { StatCards } from './components/StatCards';
import { ContestDetailsModal } from './components/modals/ContestDetailsModal';
import { ContestFormModal } from './components/modals/ContestFormModal';
import { DeleteConfirmModal } from './components/modals/DeleteConfirmModal';
import { ParticipantsModal } from './components/modals/ParticipantsModal';
import { ResultsModal } from './components/modals/ResultsModal';
import { StagesManagerModal } from './components/modals/StagesManagerModal';
import { ParticipantDetailPage } from './components/participants/ParticipantDetailPage';
import { ParticipantsPage } from './components/participants/ParticipantsPage';
import { ReportsPage } from './components/reports/ReportsPage';
import { SettingsPage } from './components/settings/SettingsPage';
import { CreateContestPage } from './components/wizard/CreateContestPage';
import { ContestWizardData } from './components/wizard/wizardDefaults';
import { INITIAL_ACTIVITIES, INITIAL_CONTESTS, toPersianDigits } from './data/initialData';
import { DEFAULT_SYSTEM_SETTINGS } from './data/participantAnalytics';
import {
  ActivityCategory,
  ActivityItem,
  Contest,
  ContestStage,
  ContestStatus,
  DateFilterPreset,
  ModalState,
  Participant,
  SystemSettings,
  ViewMode,
} from './types/contest';

const STORAGE_KEY_CONTESTS = 'meydan_contests_v1';
const STORAGE_KEY_ACTIVITIES = 'meydan_activities_v1';
const STORAGE_KEY_SETTINGS = 'meydan_settings_v1';
const TODAY_ISO = '2026-11-19';

type ActivePage =
  | { kind: 'dashboard' }
  | { kind: 'create' }
  | { kind: 'participants' }
  | { kind: 'participant_detail'; contestId: string; participantId: string }
  | { kind: 'reports' }
  | { kind: 'settings' };

function loadStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [contests, setContests] = useState<Contest[]>(() =>
    loadStored(STORAGE_KEY_CONTESTS, INITIAL_CONTESTS)
  );
  const [activities, setActivities] = useState<ActivityItem[]>(() =>
    loadStored(STORAGE_KEY_ACTIVITIES, INITIAL_ACTIVITIES)
  );
  const [settings, setSettings] = useState<SystemSettings>(() =>
    loadStored(STORAGE_KEY_SETTINGS, DEFAULT_SYSTEM_SETTINGS)
  );

  // Active page state
  const [activePage, setActivePage] = useState<ActivePage>({ kind: 'dashboard' });

  // Filters & view state for Dashboard
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContestStatus | 'all'>('all');
  const [datePreset, setDatePreset] = useState<DateFilterPreset>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('card');

  // Navigation & modals
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modal, setModal] = useState<ModalState>({ type: 'none' });
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CONTESTS, JSON.stringify(contests));
    } catch {
      // Ignore storage quota issues
    }
  }, [contests]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVITIES, JSON.stringify(activities));
    } catch {
      // Ignore storage quota issues
    }
  }, [activities]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch {
      // Ignore storage quota issues
    }
  }, [settings]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setModal({ type: 'none' });
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const showToast = (message: string) => setToast(message);

  const pushActivity = (
    category: ActivityCategory,
    action: string,
    contestTitle: string,
    contestId?: string
  ) => {
    const entry: ActivityItem = {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      category,
      actor: 'مدیر سامانه',
      action,
      contestId,
      contestTitle,
      timestampLabel: 'هم‌اکنون',
      createdAt: Date.now(),
    };
    setActivities((prev) => [entry, ...prev]);
  };

  const statusCounts = useMemo<Record<ContestStatus | 'all', number>>(() => {
    return {
      all: contests.length,
      active: contests.filter((c) => c.status === 'active').length,
      draft: contests.filter((c) => c.status === 'draft').length,
      paused: contests.filter((c) => c.status === 'paused').length,
      ended: contests.filter((c) => c.status === 'ended').length,
    };
  }, [contests]);

  const totalRosterCount = useMemo(
    () => contests.reduce((acc, c) => acc + c.participants.length, 0),
    [contests]
  );

  const existingContestIds = useMemo(() => new Set(contests.map((c) => c.id)), [contests]);

  const filteredContests = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return contests.filter((contest) => {
      if (statusFilter !== 'all' && contest.status !== statusFilter) {
        return false;
      }

      if (q) {
        const match =
          contest.title.toLowerCase().includes(q) ||
          contest.code.toLowerCase().includes(q) ||
          contest.category.toLowerCase().includes(q);
        if (!match) return false;
      }

      if (datePreset === 'active_now') {
        if (!(contest.startDate <= TODAY_ISO && contest.endDate >= TODAY_ISO)) {
          return false;
        }
      } else if (datePreset === 'this_month') {
        if (!contest.startDate.startsWith('2026-11')) {
          return false;
        }
      } else if (datePreset === 'upcoming') {
        if (contest.startDate <= TODAY_ISO) {
          return false;
        }
      } else if (datePreset === 'custom') {
        if (dateFrom && contest.endDate < dateFrom) return false;
        if (dateTo && contest.startDate > dateTo) return false;
      }

      return true;
    });
  }, [contests, searchQuery, statusFilter, datePreset, dateFrom, dateTo]);

  const activeContest = useMemo(() => {
    if (modal.type === 'none') return undefined;
    return contests.find((c) => c.id === modal.contestId);
  }, [contests, modal]);

  const detailTarget = useMemo(() => {
    if (activePage.kind !== 'participant_detail') return undefined;
    const contest = contests.find((c) => c.id === activePage.contestId);
    if (!contest) return undefined;
    const participant = contest.participants.find((p) => p.id === activePage.participantId);
    if (!participant) return undefined;
    return { contest, participant };
  }, [activePage, contests]);

  const navigateTo = (page: ActivePage) => {
    setMobileMenuOpen(false);
    setModal({ type: 'none' });
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setDatePreset('all');
    setDateFrom('');
    setDateTo('');
  };

  const handleWizardComplete = (
    created: Contest,
    publishMode: ContestWizardData['publishMode']
  ) => {
    setContests((prev) => [created, ...prev]);

    const actionText =
      publishMode === 'publish_now'
        ? `مسابقه جدید را با ${toPersianDigits(created.stages.length)} مرحله و گاوصندوق نهایی منتشر کرد`
        : publishMode === 'schedule'
          ? `انتشار مسابقه جدید را با ${toPersianDigits(created.stages.length)} مرحله زمان‌بندی کرد`
          : `پیش‌نویس مسابقه جدید را با ${toPersianDigits(created.stages.length)} مرحله ذخیره کرد`;

    pushActivity('contest', actionText, created.title, created.id);
    setActivePage({ kind: 'dashboard' });
    setStatusFilter('all');
    showToast(
      publishMode === 'publish_now'
        ? `مسابقه «${created.title}» با موفقیت منتشر شد.`
        : publishMode === 'schedule'
          ? `زمان‌بندی انتشار مسابقه «${created.title}» ثبت شد.`
          : `مسابقه «${created.title}» در بخش پیش‌نویس‌ها ذخیره شد.`
    );
  };

  const handleEditContest = (
    contestId: string,
    values: {
      title: string;
      category: string;
      description: string;
      prizeSummary: string;
      startDate: string;
      endDate: string;
      status: ContestStatus;
    }
  ) => {
    setContests((prev) =>
      prev.map((c) => (c.id === contestId ? { ...c, ...values } : c))
    );
    pushActivity('contest', 'مشخصات مسابقه را ویرایش کرد', values.title, contestId);
    setModal({ type: 'none' });
    showToast(`تغییرات مسابقه «${values.title}» ذخیره شد.`);
  };

  const handleTogglePause = (contestId: string) => {
    const target = contests.find((c) => c.id === contestId);
    if (!target || target.status === 'ended') return;

    const nextStatus: ContestStatus = target.status === 'active' ? 'paused' : 'active';
    setContests((prev) =>
      prev.map((c) => (c.id === contestId ? { ...c, status: nextStatus } : c))
    );

    const actionText =
      nextStatus === 'paused'
        ? 'مسابقه را موقتاً متوقف کرد'
        : target.status === 'draft'
          ? 'مسابقه را منتشر و فعال کرد'
          : 'اجرای مسابقه را مجدداً فعال کرد';

    pushActivity('contest', actionText, target.title, target.id);
    showToast(
      nextStatus === 'paused'
        ? `مسابقه «${target.title}» متوقف شد.`
        : `مسابقه «${target.title}» فعال شد.`
    );
  };

  const handleDeleteContest = (contestId: string) => {
    const target = contests.find((c) => c.id === contestId);
    if (!target) return;
    setContests((prev) => prev.filter((c) => c.id !== contestId));
    pushActivity('contest', 'مسابقه را از فهرست حذف کرد', target.title);
    setModal({ type: 'none' });
    showToast(`مسابقه «${target.title}» حذف شد.`);
  };

  const handleSaveStages = (contestId: string, stages: ContestStage[], summary: string) => {
    const target = contests.find((c) => c.id === contestId);
    if (!target) return;
    setContests((prev) =>
      prev.map((c) => (c.id === contestId ? { ...c, stages } : c))
    );
    pushActivity('stage', summary, target.title, target.id);
  };

  const handleAddParticipant = (contestId: string, participant: Participant) => {
    const target = contests.find((c) => c.id === contestId);
    if (!target) return;
    setContests((prev) =>
      prev.map((c) =>
        c.id === contestId ? { ...c, participants: [participant, ...c.participants] } : c
      )
    );
    pushActivity(
      'participant',
      `شرکت‌کننده جدید «${participant.fullName}» را ثبت کرد`,
      target.title,
      target.id
    );
    showToast(`${participant.fullName} به فهرست شرکت‌کنندگان اضافه شد.`);
  };

  const handleMarkParticipantCompleted = (contestId: string, participantId: string) => {
    const target = contests.find((c) => c.id === contestId);
    if (!target) return;
    const p = target.participants.find((item) => item.id === participantId);
    if (!p) return;

    const totalStagePoints = target.stages.reduce((acc, s) => acc + s.points, 0) || 300;
    const totalStages = Math.max(1, target.stages.length);

    setContests((prev) =>
      prev.map((c) =>
        c.id === contestId
          ? {
              ...c,
              participants: c.participants.map((item) =>
                item.id === participantId
                  ? {
                      ...item,
                      completedStages: totalStages,
                      totalStages,
                      score: Math.max(item.score, Math.round(totalStagePoints * 0.85)),
                      completionTimeMinutes: item.completionTimeMinutes || 95,
                      isCompleted: true,
                    }
                  : item
              ),
            }
          : c
      )
    );
    pushActivity(
      'participant',
      `تکمیل مراحل «${p.fullName}» را ثبت کرد`,
      target.title,
      target.id
    );
  };

  const handleToggleWinner = (contestId: string, participantId: string) => {
    const target = contests.find((c) => c.id === contestId);
    if (!target) return;
    const p = target.participants.find((item) => item.id === participantId);
    if (!p) return;

    const nextWinner = !p.isWinner;
    setContests((prev) =>
      prev.map((c) =>
        c.id === contestId
          ? {
              ...c,
              participants: c.participants.map((item) =>
                item.id === participantId ? { ...item, isWinner: nextWinner } : item
              ),
            }
          : c
      )
    );
    pushActivity(
      'winner',
      nextWinner
        ? `«${p.fullName}» را به‌عنوان برنده تأیید کرد`
        : `عنوان برنده را از «${p.fullName}» لغو کرد`,
      target.title,
      target.id
    );
  };

  // Participant Detail Administrative Actions
  const handleToggleParticipantPause = (contestId: string, participantId: string) => {
    const target = contests.find((c) => c.id === contestId);
    const p = target?.participants.find((item) => item.id === participantId);
    if (!target || !p) return;

    const nextPaused = !p.isPaused;
    setContests((prev) =>
      prev.map((c) =>
        c.id === contestId
          ? {
              ...c,
              participants: c.participants.map((item) =>
                item.id === participantId
                  ? {
                      ...item,
                      isPaused: nextPaused,
                      activityLogs: [
                        {
                          id: `log-${Date.now()}`,
                          action: nextPaused
                            ? 'شرکت دانش‌آموز توسط مدیر متوقف شد'
                            : 'شرکت دانش‌آموز توسط مدیر ازسرگیری شد',
                          timestamp: 'هم‌اکنون',
                        },
                        ...(item.activityLogs ?? []),
                      ],
                    }
                  : item
              ),
            }
          : c
      )
    );
    pushActivity(
      'participant',
      nextPaused
        ? `شرکت دانش‌آموز «${p.fullName}» را متوقف کرد`
        : `شرکت دانش‌آموز «${p.fullName}» را ازسرگیری کرد`,
      target.title,
      target.id
    );
    showToast(
      nextPaused
        ? `شرکت «${p.fullName}» در مسابقه متوقف شد.`
        : `شرکت «${p.fullName}» مجدداً فعال شد.`
    );
  };

  const handleResetParticipantProgress = (contestId: string, participantId: string) => {
    const target = contests.find((c) => c.id === contestId);
    const p = target?.participants.find((item) => item.id === participantId);
    if (!target || !p) return;

    setContests((prev) =>
      prev.map((c) =>
        c.id === contestId
          ? {
              ...c,
              participants: c.participants.map((item) =>
                item.id === participantId
                  ? {
                      ...item,
                      completedStages: 0,
                      score: settings.initialBaseScore,
                      completionTimeMinutes: 0,
                      isCompleted: false,
                      isWinner: false,
                      isPaused: false,
                      wrongAttempts: 0,
                      submittedAnswers: [],
                      usedHints: [],
                      stageTimes: [],
                      activityLogs: [
                        {
                          id: `log-reset-${Date.now()}`,
                          action: 'پیشرفت دانش‌آموز با تأیید مدیر سامانه بازنشانی شد',
                          timestamp: 'هم‌اکنون',
                        },
                      ],
                    }
                  : item
              ),
            }
          : c
      )
    );
    pushActivity(
      'participant',
      `پیشرفت دانش‌آموز «${p.fullName}» را بازنشانی کرد`,
      target.title,
      target.id
    );
    showToast(`پیشرفت «${p.fullName}» با موفقیت بازنشانی شد.`);
  };

  const handleRemoveParticipantWithReason = (
    contestId: string,
    participantId: string,
    reason: string
  ) => {
    const target = contests.find((c) => c.id === contestId);
    const p = target?.participants.find((item) => item.id === participantId);
    if (!target || !p) return;

    setContests((prev) =>
      prev.map((c) =>
        c.id === contestId
          ? {
              ...c,
              participants: c.participants.filter((item) => item.id !== participantId),
            }
          : c
      )
    );
    pushActivity(
      'participant',
      `دانش‌آموز «${p.fullName}» را از مسابقه حذف کرد (دلیل: ${reason})`,
      target.title,
      target.id
    );
    setActivePage({ kind: 'participants' });
    showToast(`«${p.fullName}» از مسابقه حذف شد و دلیل در گزارش ثبت گردید.`);
  };

  const handleSaveSettings = (next: SystemSettings) => {
    setSettings(next);
    pushActivity('contest', 'تنظیمات عمومی و امنیتی سامانه مسابقات را به‌روزرسانی کرد', 'تنظیمات سامانه');
    showToast('تنظیمات سیستم مسابقات با موفقیت ذخیره شد.');
  };

  const handleResetDemoData = () => {
    setContests(INITIAL_CONTESTS);
    setActivities(INITIAL_ACTIVITIES);
    setSettings(DEFAULT_SYSTEM_SETTINGS);
    handleResetFilters();
    setActivePage({ kind: 'dashboard' });
    showToast('داده‌های نمونه داشبورد بازنشانی شد.');
  };

  const statusNavItems: Array<{
    id: ContestStatus | 'all';
    label: string;
    icon: typeof LayoutDashboard;
    count: number;
  }> = [
    { id: 'all', label: 'داشبورد', icon: LayoutDashboard, count: statusCounts.all },
    { id: 'active', label: 'مسابقات فعال', icon: PlayCircle, count: statusCounts.active },
    { id: 'draft', label: 'مسابقات پیش‌نویس', icon: FileText, count: statusCounts.draft },
    { id: 'paused', label: 'متوقف‌شده‌ها', icon: PauseCircle, count: statusCounts.paused },
    { id: 'ended', label: 'پایان‌یافته‌ها', icon: CheckCircle2, count: statusCounts.ended },
  ];

  const activeSectionTitle =
    statusFilter === 'all'
      ? 'مسابقات سامانه'
      : statusNavItems.find((n) => n.id === statusFilter)?.label ?? 'مسابقات سامانه';

  const sidebarContent = (
    <div className="flex flex-col h-full p-4">
      <div className="flex items-center justify-between gap-3 px-2 pt-1 pb-5 border-b border-[#EAE2D3]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-[#EFE6D5] border border-[#E2D9C8] flex items-center justify-center text-[#5D3F2A] shrink-0">
            <Trophy className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                handleResetFilters();
                navigateTo({ kind: 'dashboard' });
              }}
              className="block text-base font-extrabold text-[#2A1D15] truncate whitespace-nowrap"
            >
              میدان
            </a>
            <p className="text-xs text-[#7A6A5B] truncate">مدیریت مسابقات</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="بستن منو"
          className="lg:hidden p-1.5 text-[#7A6A5B] hover:text-[#2A1D15] rounded-xl cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav aria-label="منوی اصلی" className="py-4 flex-1 space-y-1.5">
        {statusNavItems.map((item) => {
          const isActive = activePage.kind === 'dashboard' && statusFilter === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setStatusFilter(item.id);
                navigateTo({ kind: 'dashboard' });
              }}
              className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-2xl text-sm transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#5D3F2A] text-[#FAF7F0] font-bold shadow-[0_3px_10px_rgba(93,63,42,0.22)]'
                  : 'text-[#3A2A1E] hover:bg-[#F1EAE0] font-semibold'
              }`}
            >
              <span className="whitespace-nowrap truncate">{item.label}</span>
              {!isActive && (
                <span className="min-w-6 h-6 px-2 inline-flex items-center justify-center rounded-lg bg-[#E7DEC9] text-[#5D3F2A] text-xs font-bold tabular-nums">
                  {toPersianDigits(item.count)}
                </span>
              )}
            </button>
          );
        })}

        {/* Main Management Modules */}
        <div className="pt-2.5 mt-2.5 border-t border-[#EAE2D3] space-y-1.5">
          <button
            type="button"
            onClick={() => navigateTo({ kind: 'create' })}
            className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-2xl text-sm transition-colors cursor-pointer ${
              activePage.kind === 'create'
                ? 'bg-[#5D3F2A] text-[#FAF7F0] font-bold shadow-[0_3px_10px_rgba(93,63,42,0.22)]'
                : 'text-[#0F766E] hover:bg-[#DFEFEA]/70 font-bold'
            }`}
          >
            <span className="whitespace-nowrap">ایجاد مسابقه جدید</span>
            <Plus className="w-4 h-4 shrink-0" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => navigateTo({ kind: 'participants' })}
            className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-2xl text-sm transition-colors cursor-pointer ${
              activePage.kind === 'participants' || activePage.kind === 'participant_detail'
                ? 'bg-[#5D3F2A] text-[#FAF7F0] font-bold shadow-[0_3px_10px_rgba(93,63,42,0.22)]'
                : 'text-[#3A2A1E] hover:bg-[#F1EAE0] font-semibold'
            }`}
          >
            <span className="inline-flex items-center gap-2 whitespace-nowrap truncate">
              <Users className="w-4 h-4 shrink-0 opacity-80" aria-hidden="true" />
              <span>شرکت‌کنندگان و برندگان</span>
            </span>
            {activePage.kind !== 'participants' && activePage.kind !== 'participant_detail' && (
              <span className="min-w-6 h-6 px-2 inline-flex items-center justify-center rounded-lg bg-[#E7DEC9] text-[#5D3F2A] text-xs font-bold tabular-nums">
                {toPersianDigits(totalRosterCount)}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => navigateTo({ kind: 'reports' })}
            className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-2xl text-sm transition-colors cursor-pointer ${
              activePage.kind === 'reports'
                ? 'bg-[#5D3F2A] text-[#FAF7F0] font-bold shadow-[0_3px_10px_rgba(93,63,42,0.22)]'
                : 'text-[#3A2A1E] hover:bg-[#F1EAE0] font-semibold'
            }`}
          >
            <span className="inline-flex items-center gap-2 whitespace-nowrap truncate">
              <BarChart3 className="w-4 h-4 shrink-0 opacity-80" aria-hidden="true" />
              <span>گزارش‌ها و آمارها</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => navigateTo({ kind: 'settings' })}
            className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-2xl text-sm transition-colors cursor-pointer ${
              activePage.kind === 'settings'
                ? 'bg-[#5D3F2A] text-[#FAF7F0] font-bold shadow-[0_3px_10px_rgba(93,63,42,0.22)]'
                : 'text-[#3A2A1E] hover:bg-[#F1EAE0] font-semibold'
            }`}
          >
            <span className="inline-flex items-center gap-2 whitespace-nowrap truncate">
              <Settings className="w-4 h-4 shrink-0 opacity-80" aria-hidden="true" />
              <span>تنظیمات</span>
            </span>
          </button>
        </div>
      </nav>

      <div className="pt-3 border-t border-[#EAE2D3]">
        <button
          type="button"
          onClick={handleResetDemoData}
          className="w-full flex items-center justify-between gap-2 h-11 px-4 text-xs font-bold text-[#4A3525] bg-[#F4EEE2] hover:bg-[#EAE0CE] border border-[#DDD2BE] rounded-2xl transition-colors whitespace-nowrap cursor-pointer"
        >
          <span>بازنشانی داده‌های نمونه</span>
          <RotateCcw className="w-4 h-4 text-[#6B4C35]" aria-hidden="true" />
        </button>
      </div>
    </div>
  );

  return (
    <div id="top" className="min-h-screen bg-[#EBE4D5] text-[#2A1D15] p-3 sm:p-4 lg:p-5">
      <div className="max-w-[1620px] mx-auto flex gap-4 lg:gap-5 items-start">
        {/* Desktop Floating Rounded Right Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 bg-[#FAF7F0] border border-[#E2D9C8] rounded-[24px] shadow-[0_2px_12px_rgba(78,52,34,0.05)] sticky top-5 h-[calc(100vh-2.5rem)] overflow-y-auto">
          {sidebarContent}
        </aside>

        {/* Mobile Drawer Sidebar */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-50 lg:hidden flex bg-[#2A1D15]/40 p-3"
            onClick={() => setMobileMenuOpen(false)}
          >
            <aside
              className="w-72 max-w-[85vw] bg-[#FAF7F0] border border-[#E2D9C8] rounded-[24px] h-full overflow-y-auto shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {sidebarContent}
            </aside>
          </div>
        )}

        {/* Main Content Column */}
        <div className="flex-1 min-w-0 flex flex-col gap-5">
          {/* Mobile menu button bar when not on dashboard */}
          {activePage.kind !== 'dashboard' && (
            <div className="lg:hidden flex items-center justify-between bg-[#FAF7F0] border border-[#E2D9C8] rounded-2xl px-4 py-2.5">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="inline-flex items-center gap-2 text-xs font-bold text-[#5D3F2A] cursor-pointer"
              >
                <Menu className="w-4 h-4" />
                <span>منوی بخش‌ها</span>
              </button>
              <span className="text-xs font-extrabold text-[#2A1D15]">میدان</span>
            </div>
          )}

          {/* System Off Notice Banner (reflects live Settings toggle) */}
          {!settings.systemEnabled && (
            <div className="bg-[#FEF3C7]/90 border border-[#FDE68A] text-[#92400E] rounded-2xl px-4 py-3 text-xs font-bold flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  سیستم مسابقات در حال حاضر از بخش «تنظیمات» خاموش شده است و دانش‌آموزان به مسابقات دسترسی ندارند.
                </span>
              </span>
              {activePage.kind !== 'settings' && (
                <button
                  type="button"
                  onClick={() => navigateTo({ kind: 'settings' })}
                  className="underline font-extrabold cursor-pointer"
                >
                  رفتن به تنظیمات
                </button>
              )}
            </div>
          )}

          {/* Dedicated Page Views */}
          {activePage.kind === 'create' && (
            <CreateContestPage
              nextCodeNumber={4057 + contests.length}
              onCancel={() => navigateTo({ kind: 'dashboard' })}
              onComplete={handleWizardComplete}
            />
          )}

          {activePage.kind === 'participants' && (
            <ParticipantsPage
              contests={contests}
              onSelectParticipant={(contestId, participantId) =>
                navigateTo({ kind: 'participant_detail', contestId, participantId })
              }
            />
          )}

          {activePage.kind === 'participant_detail' && detailTarget && (
            <ParticipantDetailPage
              contest={detailTarget.contest}
              participant={detailTarget.participant}
              onBack={() => navigateTo({ kind: 'participants' })}
              onTogglePause={() =>
                handleToggleParticipantPause(detailTarget.contest.id, detailTarget.participant.id)
              }
              onResetProgress={() =>
                handleResetParticipantProgress(detailTarget.contest.id, detailTarget.participant.id)
              }
              onRemoveWithReason={(reason) =>
                handleRemoveParticipantWithReason(
                  detailTarget.contest.id,
                  detailTarget.participant.id,
                  reason
                )
              }
              onToggleWinner={() =>
                handleToggleWinner(detailTarget.contest.id, detailTarget.participant.id)
              }
            />
          )}

          {activePage.kind === 'reports' && (
            <ReportsPage
              contests={contests}
              onInspectContestDetails={(id) => setModal({ type: 'details', contestId: id })}
              onInspectContestResults={(id) => setModal({ type: 'results', contestId: id })}
            />
          )}

          {activePage.kind === 'settings' && (
            <SettingsPage settings={settings} onSaveSettings={handleSaveSettings} />
          )}

          {activePage.kind === 'dashboard' && (
            <>
              {/* Floating Rounded Top Header Bar */}
              <header className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[22px] px-5 sm:px-6 py-3.5 shadow-[0_2px_10px_rgba(78,52,34,0.04)] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(true)}
                    aria-label="باز کردن منو"
                    className="lg:hidden p-2 -mr-1 text-[#5D3F2A] hover:bg-[#EFE6D5] rounded-xl cursor-pointer"
                  >
                    <Menu className="w-5 h-5" />
                  </button>

                  <h1 className="text-sm sm:text-base font-extrabold text-[#2A1D15] truncate">
                    به داشبورد مدیریت مسابقات میدان خوش آمدید
                  </h1>
                </div>

                <button
                  type="button"
                  onClick={() => navigateTo({ kind: 'create' })}
                  className="inline-flex items-center gap-2 h-10 px-4 text-xs sm:text-sm font-bold text-[#FAF7F0] bg-[#5D3F2A] hover:bg-[#4A3120] rounded-2xl transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-[0_2px_8px_rgba(93,63,42,0.2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5D3F2A] focus-visible:ring-offset-2"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  <span>ایجاد مسابقه جدید</span>
                </button>
              </header>

              {/* Main Dashboard Flow */}
              <main className="space-y-6">
                <StatCards
                  contests={contests}
                  activeStatusFilter={statusFilter}
                  onFilterByStatus={(status) => setStatusFilter(status)}
                />

                <section className="space-y-4">
                  <div className="flex items-center justify-between gap-3 px-1">
                    <h2 className="text-base font-extrabold text-[#2A1D15]">
                      {activeSectionTitle}
                    </h2>
                    <button
                      type="button"
                      onClick={() => navigateTo({ kind: 'create' })}
                      className="text-xs font-bold text-[#5D3F2A] hover:text-[#2A1D15] transition-colors whitespace-nowrap cursor-pointer"
                    >
                      افزودن مسابقه جدید
                    </button>
                  </div>

                  <FilterBar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    statusFilter={statusFilter}
                    onStatusChange={setStatusFilter}
                    datePreset={datePreset}
                    onDatePresetChange={setDatePreset}
                    dateFrom={dateFrom}
                    dateTo={dateTo}
                    onDateFromChange={setDateFrom}
                    onDateToChange={setDateTo}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    filteredCount={filteredContests.length}
                    totalCount={contests.length}
                    statusCounts={statusCounts}
                    onResetFilters={handleResetFilters}
                  />

                  {filteredContests.length === 0 ? (
                    <div className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[22px] px-6 py-16 text-center shadow-[0_2px_10px_rgba(78,52,34,0.04)]">
                      <div className="mx-auto w-12 h-12 rounded-2xl bg-[#EFE6D5] flex items-center justify-center text-[#6B4C35]">
                        <FolderOpen className="w-5 h-5" aria-hidden="true" />
                      </div>
                      <h3 className="mt-4 text-sm font-extrabold text-[#2A1D15]">
                        مسابقه‌ای مطابق با فیلترهای انتخابی یافت نشد
                      </h3>
                      <p className="mt-1.5 text-xs text-[#7A6A5B] max-w-sm mx-auto leading-relaxed">
                        می‌توانید فیلترهای جستجو، وضعیت یا بازه تاریخی را بازنشانی کنید یا یک مسابقه جدید ایجاد نمایید.
                      </p>
                      <div className="mt-5 flex items-center justify-center gap-2.5">
                        {contests.length > 0 && (
                          <button
                            type="button"
                            onClick={handleResetFilters}
                            className="h-9 px-4 text-xs font-semibold text-[#4A3525] bg-[#EFE6D5] hover:bg-[#E7DEC9] rounded-xl transition-colors cursor-pointer"
                          >
                            پاک کردن فیلترها
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => navigateTo({ kind: 'create' })}
                          className="h-9 px-4 text-xs font-bold text-[#FAF7F0] bg-[#5D3F2A] hover:bg-[#4A3120] rounded-xl transition-colors cursor-pointer"
                        >
                          ایجاد مسابقه جدید
                        </button>
                      </div>
                    </div>
                  ) : viewMode === 'card' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
                      {filteredContests.map((contest) => (
                        <ContestCard
                          key={contest.id}
                          contest={contest}
                          onViewDetails={(id) => setModal({ type: 'details', contestId: id })}
                          onEdit={(id) => setModal({ type: 'edit', contestId: id })}
                          onManageStages={(id) => setModal({ type: 'stages', contestId: id })}
                          onViewParticipants={(id) =>
                            setModal({ type: 'participants', contestId: id })
                          }
                          onViewResults={(id) => setModal({ type: 'results', contestId: id })}
                          onTogglePause={handleTogglePause}
                          onDelete={(id) => setModal({ type: 'delete', contestId: id })}
                        />
                      ))}
                    </div>
                  ) : (
                    <ContestTable
                      contests={filteredContests}
                      onViewDetails={(id) => setModal({ type: 'details', contestId: id })}
                      onEdit={(id) => setModal({ type: 'edit', contestId: id })}
                      onManageStages={(id) => setModal({ type: 'stages', contestId: id })}
                      onViewParticipants={(id) =>
                        setModal({ type: 'participants', contestId: id })
                      }
                      onViewResults={(id) => setModal({ type: 'results', contestId: id })}
                      onTogglePause={handleTogglePause}
                      onDelete={(id) => setModal({ type: 'delete', contestId: id })}
                    />
                  )}
                </section>

                <RecentActivities
                  activities={activities}
                  existingContestIds={existingContestIds}
                  onSelectContest={(contestId) => setModal({ type: 'details', contestId })}
                />
              </main>
            </>
          )}

          {/* Quiet Warm Footer */}
          <footer className="pt-2 pb-1 px-2 flex flex-wrap items-center justify-between gap-2 text-xs text-[#7A6A5B]">
            <span>سامانه مدیریت و ارزیابی مسابقات میدان</span>
            <span>تمامی حقوق محفوظ است · ۱۴۰۵</span>
          </footer>
        </div>
      </div>

      {/* Modals */}
      {modal.type === 'edit' && activeContest && (
        <ContestFormModal
          mode="edit"
          initialContest={activeContest}
          onClose={() => setModal({ type: 'none' })}
          onSubmit={(values) => handleEditContest(activeContest.id, values)}
        />
      )}

      {modal.type === 'details' && activeContest && (
        <ContestDetailsModal
          contest={activeContest}
          onClose={() => setModal({ type: 'none' })}
          onEdit={() => setModal({ type: 'edit', contestId: activeContest.id })}
          onManageStages={() => setModal({ type: 'stages', contestId: activeContest.id })}
          onViewParticipants={() => setModal({ type: 'participants', contestId: activeContest.id })}
          onViewResults={() => setModal({ type: 'results', contestId: activeContest.id })}
          onTogglePause={() => handleTogglePause(activeContest.id)}
        />
      )}

      {modal.type === 'stages' && activeContest && (
        <StagesManagerModal
          contest={activeContest}
          onClose={() => setModal({ type: 'none' })}
          onSaveStages={(stages, summary) =>
            handleSaveStages(activeContest.id, stages, summary)
          }
        />
      )}

      {modal.type === 'participants' && activeContest && (
        <ParticipantsModal
          contest={activeContest}
          onClose={() => setModal({ type: 'none' })}
          onAddParticipant={(p) => handleAddParticipant(activeContest.id, p)}
          onMarkCompleted={(pid) => handleMarkParticipantCompleted(activeContest.id, pid)}
        />
      )}

      {modal.type === 'results' && activeContest && (
        <ResultsModal
          contest={activeContest}
          onClose={() => setModal({ type: 'none' })}
          onToggleWinner={(pid) => handleToggleWinner(activeContest.id, pid)}
        />
      )}

      {modal.type === 'delete' && activeContest && (
        <DeleteConfirmModal
          contest={activeContest}
          onClose={() => setModal({ type: 'none' })}
          onConfirm={() => handleDeleteContest(activeContest.id)}
        />
      )}

      {/* Warm Espresso Toast Notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 left-5 z-50 bg-[#3B2618] text-[#FAF7F0] border border-[#5D3F2A] text-xs font-semibold px-4 py-3 rounded-2xl shadow-lg flex items-center gap-3"
        >
          <span>{toast}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="بستن پیام"
            className="text-[#D8CBB8] hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
