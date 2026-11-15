import { memo } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import type { ProblemChartData } from '../../lib/analytics';
import { formatNumber } from '../../lib/format';

interface ProblemTrendChartProps {
  data: ProblemChartData;
}

/** Stacked bar chart of problem counts per period (FR-5.3). Memoized for stable props. */
const ProblemTrendChart = memo(function ProblemTrendChart({ data }: ProblemTrendChartProps) {
  return (
    <figure className="m-0 w-full" aria-label="Grafik jumlah masalah tanaman per periode">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data.points} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} accessibilityLayer>
          <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: '#64748b' }}
            interval="preserveStartEnd"
            minTickGap={18}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: '#64748b' }}
            width={44}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ fill: 'rgba(13, 148, 136, 0.08)' }}
            formatter={(value, name) => [formatNumber(Number(value)), String(name)]}
            contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
            labelStyle={{ color: '#0f172a', fontWeight: 600 }}
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} iconType="circle" />
          {data.series.map((series) => (
            <Bar
              key={series.key}
              dataKey={series.key}
              name={series.label}
              stackId="problems"
              fill={series.color}
              isAnimationActive={false}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </figure>
  );
});

export default ProblemTrendChart;
