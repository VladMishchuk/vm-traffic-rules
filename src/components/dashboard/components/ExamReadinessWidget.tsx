import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface ExamReadinessWidgetProps {
  totalTestsCompleted: number;
  readArticleIdsCount: number;
  unlockedBadgesCount: number;
  accuracyPercent: number;
  pieData: { name: string; value: number; color: string }[];
}

export const ExamReadinessWidget: React.FC<ExamReadinessWidgetProps> = ({
  totalTestsCompleted,
  readArticleIdsCount,
  unlockedBadgesCount,
  accuracyPercent,
  pieData,
}) => {
  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex items-center justify-between gap-4">
      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Формувальне оцінювання
        </span>
        <h3 className="text-lg font-bold">Загальна успішність</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Пройдено тестів:{' '}
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {totalTestsCompleted}
          </span>
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Прочитано тем ПДР:{' '}
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            {readArticleIdsCount}
          </span>
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Нагород здобуто:{' '}
          <span className="font-bold text-blue-600 dark:text-blue-400">
            {unlockedBadgesCount}
          </span>
        </p>
        <Link
          to="/analytics"
          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline pt-1"
        >
          <span>Детальна аналітика</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="w-32 h-32 relative shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              innerRadius={40}
              outerRadius={56}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {pieData.map((entry, idx) => (
                <Cell key={idx} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-extrabold">{accuracyPercent}%</span>
          <span className="text-[10px] text-slate-400">Точність</span>
        </div>
      </div>
    </div>
  );
};
