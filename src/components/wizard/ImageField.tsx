import { Image as ImageIcon, Upload, X } from 'lucide-react';
import { ChangeEvent, useRef } from 'react';

interface ImageFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helperText?: string;
}

export function ImageField({
  id,
  label,
  value,
  onChange,
  placeholder = 'آدرس تصویر (URL) را وارد کنید یا فایل آپلود نمایید...',
  helperText,
}: ImageFieldProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-xs font-bold text-[#4A3525]">
        {label}
      </label>

      <div className="flex items-center gap-2">
        <input
          id={id}
          type="text"
          value={value.startsWith('data:') ? 'تصویر بارگذاری‌شده از دستگاه' : value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          dir="ltr"
          className="flex-1 h-10 px-3 text-xs font-mono text-[#2A1D15] placeholder:text-[#9C8D7E] placeholder:font-sans placeholder:text-right bg-[#F4EEE2] border border-[#E2D9C8] rounded-xl focus:bg-[#FCFBF8] focus:outline-none focus:border-[#5D3F2A]"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 h-10 px-3.5 text-xs font-semibold text-[#4A3525] bg-[#EFE6D5] hover:bg-[#E7DEC9] border border-[#DDD2BE] rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Upload className="w-3.5 h-3.5" aria-hidden="true" />
          <span>آپلود تصویر</span>
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="حذف تصویر"
            className="h-10 w-10 inline-flex items-center justify-center text-[#B91C1C] bg-[#FEE2E2]/60 hover:bg-[#FEE2E2] rounded-xl transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {helperText && <p className="text-[11px] text-[#8C7C6D]">{helperText}</p>}

      {value ? (
        <div className="relative rounded-2xl overflow-hidden border border-[#E2D9C8] bg-[#F4EEE2] h-32">
          <img
            src={value}
            alt={label}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#D8CBB8] bg-[#F8F3EA] h-20 flex items-center justify-center gap-2 text-xs text-[#8C7C6D]">
          <ImageIcon className="w-4 h-4" aria-hidden="true" />
          <span>پیش‌نمایش تصویر پس از انتخاب در اینجا نمایش داده می‌شود</span>
        </div>
      )}
    </div>
  );
}
