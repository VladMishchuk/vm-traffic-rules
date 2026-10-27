import React from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

interface LoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onForgotPassword: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  loading,
  onSubmit,
  onForgotPassword,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            Забули пароль?
          </button>
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

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
      >
        <span>Увійти</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  );
};

export default LoginForm;
