import React from 'react';
import { Mail, KeyRound, ArrowRight } from 'lucide-react';

interface ResetPasswordFormProps {
  email: string;
  setEmail: (email: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onBackToLogin: () => void;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  email,
  setEmail,
  loading,
  onSubmit,
  onBackToLogin,
}) => {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-blue-600" />
          Відновлення пароля
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Введіть електронну пошту, щоб отримати посилання для скидання пароля
        </p>
      </div>

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

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
        >
          <span>Надіслати посилання</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onBackToLogin}
          className="w-full py-2 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
        >
          Повернутися до входу
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordForm;
