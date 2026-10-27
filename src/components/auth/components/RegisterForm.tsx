import React from 'react';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { DriverCategoryCode } from '@/core/types';

export const CATEGORY_GROUPS: {
  label: string;
  codes: DriverCategoryCode[];
  desc: string;
}[] = [
  { label: 'Мото (A1, A)', codes: ['A1', 'A'], desc: 'Мопеди та мотоцикли' },
  { label: 'Легкові (B1, B)', codes: ['B1', 'B'], desc: 'Авто до 3.5 т' },
  { label: 'Вантажні (C1, C)', codes: ['C1', 'C'], desc: 'Вантажівки > 3.5 т' },
  { label: 'Автобуси (D1, D)', codes: ['D1', 'D'], desc: 'Мікроавтобуси та автобуси' },
  {
    label: 'З причепом (BE–DE)',
    codes: ['BE', 'C1E', 'CE', 'D1E', 'DE'],
    desc: 'Автопоїзди',
  },
  { label: 'Електротранспорт (T)', codes: ['T'], desc: 'Трамваї і тролейбуси' },
];

interface RegisterFormProps {
  displayName: string;
  setDisplayName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  selectedCats: DriverCategoryCode[];
  toggleCat: (cat: DriverCategoryCode) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  displayName,
  setDisplayName,
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  selectedCats,
  toggleCat,
  loading,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
          Ім'я або Нікнейм
        </label>
        <div className="relative">
          <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Наприклад: Олександр"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
          Електронна пошта (Email)
        </label>
        <div className="relative">
          <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Пароль
          </label>
        </div>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-sm focus:outline-none focus:border-blue-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            title={showPassword ? 'Приховати пароль' : 'Показати пароль'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Category Selection during Registration */}
      <div className="pt-1">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
          Оберіть категорії водійського посвідчення для навчання:
        </label>
        <div className="space-y-2">
          {CATEGORY_GROUPS.map((grp) => (
            <div
              key={grp.label}
              className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/30"
            >
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {grp.label}{' '}
                <span className="text-slate-400 hidden sm:inline">
                  — {grp.desc}
                </span>
              </span>
              <div className="flex flex-wrap gap-1">
                {grp.codes.map((c) => {
                  const active = selectedCats.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleCat(c)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                        active
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
      >
        <span>Зареєструватися</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  );
};

export default RegisterForm;
