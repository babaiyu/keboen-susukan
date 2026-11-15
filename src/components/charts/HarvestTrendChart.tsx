import { memo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import type { HarvestDatum } from '../../lib/analytics';
import { formatNumber } from '../../lib/format';

const HARVEST_COLOR = '#0d9488';

interface HarvestTrendChartProps {
  data: HarvestDatum[];
  unit: string;
}

/** Bar chart of harvest total (kg) per period (FR-5.1). Memoized for stable props. */
const HarvestTrendChart = memo(function HarvestTrendChart({ data, unit }: HarvestTrendChartProps) {
  return (
    <figure className="m-0 w-full" aria-label="Grafik tren panen per periode">
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} accessibilityLayer>
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
            formatter={(value) => [`${formatNumber(Number(value))} ${unit}`, 'Panen']}
            contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
            labelStyle={{ color: '#0f172a', fontWeight: 600 }}
          />
          <Bar
            dataKey="value"
            name="Panen"
            fill={HARVEST_COLOR}
            radius={[6, 6, 0, 0]}
            maxBarSize={40}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </figure>
  );
});

export default HarvestTrendChart;
