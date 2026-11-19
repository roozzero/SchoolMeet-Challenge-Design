import { Calendar, LayoutGrid, RotateCcw, Search, Table2, X } from 'lucide-react';
import { ContestStatus, DateFilterPreset, ViewMode } from '../types/contest';
import { toPersianDigits } from '../data/initialData';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: ContestStatus | 'all';
  onStatusChange: (status: ContestStatus | 'all') => void;
  datePreset: DateFilterPreset;
  onDatePresetChange: (preset: DateFilterPreset) => void;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  filteredCount: number;
  totalCount: number;
  statusCounts: Record<ContestStatus | 'all', number>;
  onResetFilters: () => void;
}

const STATUS_OPTIONS: Array<{ value: ContestStatus | 'all'; label: string }> = [
  { value: 'all', label: 'همه' },
  { value: 'active', label: 'فعال' },
  { value: 'draft', label: 'پیش‌نویس' },
  { value: 'paused', label: 'متوقف‌شده' },
  { value: 'ended', label: 'پایان‌یافته' },
];

export function FilterBar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  datePreset,
  onDatePresetChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  viewMode,
  onViewModeChange,
  filteredCount,
  totalCount,
  statusCounts,
  onResetFilters,
}: FilterBarProps) {
  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    statusFilter !== 'all' ||
    datePreset !== 'all' ||
    dateFrom !== '' ||
    dateTo !== '';

  return (
    <div className="bg-[#FAF7F0] border border-[#E2D9C8] rounded-[20px] p-4 shadow-[0_2px_10px_rgba(78,52,34,0.04)] space-y-3.5">
      {/* Top Row: Search + Date Preset + View Mode Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-0">
          <Search
            className="w-4 h-4 text-[#8C7C6D] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="جستجو بر اساس عنوان، کد مسابقه یا دسته‌بندی..."
            aria-label="جستجو در مسابقات"
            className="w-full h-10 pr-10 pl-9 text-sm text-[#2A1D15] placeholder:text-[#9C8D7E] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-[#FCFBF8] focus:outline-none focus:border-[#5D3F2A] focus:ring-2 focus:ring-[#5D3F2A]/15 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="پاک کردن جستجو"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1 text-[#8C7C6D] hover:text-[#2A1D15] rounded transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Date Filter Preset + View Switcher */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="relative flex items-center">
            <Calendar
              className="w-4 h-4 text-[#8C7C6D] absolute right-3 pointer-events-none"
              aria-hidden="true"
            />
            <select
              value={datePreset}
              onChange={(e) => onDatePresetChange(e.target.value as DateFilterPreset)}
              aria-label="فیلتر بازه تاریخی"
              className="h-10 pr-9 pl-7 text-sm text-[#3A2A1E] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-[#FCFBF8] focus:outline-none focus:border-[#5D3F2A] focus:ring-2 focus:ring-[#5D3F2A]/15 transition-colors cursor-pointer"
            >
              <option value="all">همه تاریخ‌ها</option>
              <option value="active_now">در بازه جاری</option>
              <option value="this_month">شروع در ماه جاری</option>
              <option value="upcoming">مسابقات آینده</option>
              <option value="custom">بازه تاریخی دلخواه</option>
            </select>
          </div>

          {/* Card / Table View Mode Toggle */}
          <div
            role="group"
            aria-label="نحوه نمایش لیست مسابقات"
            className="inline-flex items-center p-1 bg-[#EFE7D8] rounded-xl border border-[#E2D9C8] shrink-0"
          >
            <button
              type="button"
              onClick={() => onViewModeChange('card')}
              aria-pressed={viewMode === 'card'}
              className={`inline-flex items-center gap-1.5 h-8 px-3 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                viewMode === 'card'
                  ? 'bg-[#5D3F2A] text-[#FAF7F0] shadow-xs'
                  : 'text-[#6B4C35] hover:text-[#2A1D15]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" aria-hidden="true" />
              <span>کارتی</span>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('table')}
              aria-pressed={viewMode === 'table'}
              className={`inline-flex items-center gap-1.5 h-8 px-3 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[#5D3F2A] text-[#FAF7F0] shadow-xs'
                  : 'text-[#6B4C35] hover:text-[#2A1D15]'
              }`}
            >
              <Table2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>جدولی</span>
            </button>
          </div>
        </div>
      </div>

      {/* Custom Date Range Row */}
      {datePreset === 'custom' && (
        <div className="flex flex-wrap items-center gap-3 pt-2.5 border-t border-[#EAE2D3]">
          <div className="flex items-center gap-2">
            <label htmlFor="date-from" className="text-xs font-medium text-[#6B4C35] whitespace-nowrap">
              از تاریخ:
            </label>
            <input
              id="date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => onDateFromChange(e.target.value)}
              dir="ltr"
              className="h-9 px-2.5 text-xs font-mono text-[#2A1D15] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-[#FCFBF8] focus:outline-none focus:border-[#5D3F2A]"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="date-to" className="text-xs font-medium text-[#6B4C35] whitespace-nowrap">
              تا تاریخ:
            </label>
            <input
              id="date-to"
              type="date"
              value={dateTo}
              onChange={(e) => onDateToChange(e.target.value)}
              dir="ltr"
              className="h-9 px-2.5 text-xs font-mono text-[#2A1D15] bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-[#FCFBF8] focus:outline-none focus:border-[#5D3F2A]"
            />
          </div>
        </div>
      )}

      {/* Bottom Row: Segmented Status Filter + Result Count + Reset */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-[#EAE2D3]">
        <div
          role="tablist"
          aria-label="فیلتر وضعیت مسابقه"
          className="flex items-center gap-1 p-1 bg-[#EFE7D8] rounded-xl overflow-x-auto max-w-full"
        >
          {STATUS_OPTIONS.map((option) => {
            const isActive = statusFilter === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onStatusChange(option.value)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-[#5D3F2A] text-[#FAF7F0] shadow-xs'
                    : 'text-[#5D3F2A] hover:bg-[#E7DEC9]/70'
                }`}
              >
                <span>{option.label}</span>
                <span
                  className={`tabular-nums text-[11px] ${
                    isActive ? 'text-[#E7DEC9]' : 'text-[#8C7C6D]'
                  }`}
                >
                  ({toPersianDigits(statusCounts[option.value])})
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 text-xs text-[#7A6A5B]">
          <span className="tabular-nums whitespace-nowrap">
            نمایش {toPersianDigits(filteredCount)} از {toPersianDigits(totalCount)} مسابقه
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 text-[#5D3F2A] hover:text-[#2A1D15] font-semibold whitespace-nowrap cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>پاک کردن فیلترها</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
