import React from 'react';
import { Compass, Play } from 'lucide-react';

interface ColdStartBannerProps {
  displayName: string;
  loadingQ: boolean;
  onStartDiagnostic: () => void;
}

export const ColdStartBanner: React.FC<ColdStartBannerProps> = ({
  displayName,
  loadingQ,
  onStartDiagnostic,
}) => {
  return (
    <section className="rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white p-6 sm:p-8 shadow-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
      <div className="space-y-2 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-semibold">
          <Compass className="w-3.5 h-3.5" />
          Сценарій «Холодний старт» • Калібрування профілю знань
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold">
          Вітаємо, {displayName}! Визначмо ваш початковий рівень ПДР
        </h2>
        <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
          Зараз адаптивні режими «Рекомендований ШІ» та «Робота над помилками» заблоковані, оскільки система ще не має вашої аналітики. Пройдіть короткий Діагностичний тест, щоб розблокувати персональну траєкторію навчання!
        </p>
      </div>
      <button
        type="button"
        onClick={onStartDiagnostic}
        disabled={loadingQ}
        className="shrink-0 inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm shadow-md transition cursor-pointer disabled:opacity-50"
      >
        <Play className="w-4 h-4 fill-current" />
        <span>Пройти Діагностичний тест (20 питань)</span>
      </button>
    </section>
  );
};
