import React from 'react';
import { Sparkles, ShieldCheck, Car } from 'lucide-react';

export const AuthBanner: React.FC = () => {
  return (
    <div className="lg:col-span-5 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-white p-8 flex flex-col justify-between relative overflow-hidden">
      <div className="space-y-4 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          Адаптивна платформа ПДР України
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">
          Вивчай правила свідомо, а не зазубрюй картинки
        </h1>
        <p className="text-sm text-blue-100 leading-relaxed">
          Інтервальне повторення знань, всі 63 офіційні розділи ГСЦ МВС для категорій A1–T та генерація динамічних дорожніх сцен за допомогою ШІ.
        </p>
      </div>

      <div className="space-y-3 pt-8 relative z-10 text-xs text-blue-100">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>Офіційна база питань ГСЦ МВС (2 332 питання)</span>
        </div>
        <div className="flex items-center gap-2.5">
          <Car className="w-4 h-4 text-amber-300 shrink-0" />
          <span>Персоналізація під ваші категорії (A, B, C, D, BE, T)</span>
        </div>
      </div>
    </div>
  );
};

export default AuthBanner;
