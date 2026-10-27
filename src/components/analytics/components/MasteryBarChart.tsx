import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface ChartDataItem {
  name: string;
  fullTitle: string;
  mastery: number;
  rawMastery?: number;
  status: string;
}

interface MasteryBarChartProps {
  chartData: ChartDataItem[];
}

export const MasteryBarChart: React.FC<MasteryBarChartProps> = ({
  chartData,
}) => {
  if (chartData.length === 0) return null;

  return (
    <section className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-base sm:text-lg">
            Рівень засвоєння за останніми спробами (Mastery Score %)
          </h2>
          <p className="text-xs text-slate-500">
            Зелений (&ge;85%) — правило засвоєно • Жовтий (50–84%) — у процесі • Червоний (&lt;50%) — потребує відпрацювання
          </p>
        </div>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 12, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              unit="%"
            />
            <Tooltip
              formatter={(value: any, _name: any, item: any) => {
                const raw = item?.payload?.rawMastery !== undefined ? item.payload.rawMastery : value;
                return [
                  raw <= 0 ? '1% (дуже слабке засвоєння)' : `${value}%`,
                  'Рівень засвоєння',
                ];
              }}
              labelFormatter={(label, payload) =>
                payload?.[0]?.payload?.fullTitle || label
              }
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #334155',
                backgroundColor: '#0f172a',
                color: '#f8fafc',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="mastery" radius={[8, 8, 0, 0]} minPointSize={6}>
              {chartData.map((entry, idx) => (
                <Cell
                  key={idx}
                  fill={
                    entry.status === 'mastered'
                      ? '#10b981'
                      : entry.status === 'learning'
                      ? '#f59e0b'
                      : '#f43f5e'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};
