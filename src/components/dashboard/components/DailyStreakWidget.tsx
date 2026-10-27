import React from 'react';
import { Flame } from 'lucide-react';
import { getStreakText } from '@/core/utils/dateUtils';

interface DailyStreakWidgetProps {
  streakDays: number;
}

const WEEK_DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

export const DailyStreakWidget: React.FC<DailyStreakWidgetProps> = ({
  streakDays,
}) => {
  const todayIdx = (new Date().getDay() + 6) % 7; // 0 = Mon, 6 = Sun

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Регулярність навчання
          </span>
          <h3 className="text-lg font-bold mt-1">Щоденний стрік</h3>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
          <Flame className="w-6 h-6 fill-amber-500/20" />
        </div>
      </div>

      <div className="my-5 flex items-baseline gap-2">
        <span className="text-4xl font-extrabold text-amber-500">
          {streakDays}
        </span>
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {getStreakText(streakDays)}
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-800">
        {WEEK_DAYS.map((day, idx) => {
          const isToday = idx === todayIdx;
          const active =
            streakDays > 0 &&
            idx <= todayIdx &&
            idx >= todayIdx - (streakDays - 1);

          return (
            <div key={day} className="text-center space-y-1">
              <div
                className={`h-2 rounded-full transition-colors ${
                  active
                    ? 'bg-amber-500 shadow-xs shadow-amber-500/50'
                    : isToday
                    ? 'bg-amber-500/30'
                    : 'bg-slate-100 dark:bg-slate-800'
                }`}
              />
              <span
                className={`text-[10px] font-medium ${
                  isToday ? 'text-amber-500 font-bold' : 'text-slate-400'
                }`}
              >
                {day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
