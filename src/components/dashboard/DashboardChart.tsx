'use client';

import { 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts/es6';

// Define the type for your data
interface DataPoint {
  month: string;
  value: number;
}

interface DashboardChartProps {
  data: DataPoint[];
}

const DashboardChart = ({ data }: DashboardChartProps) => {
  return (
    <div className="h-96 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
          <XAxis
            dataKey="month"
            stroke="#9CA3AF"
            axisLine={false}
            tickLine={false}
            tickMargin={10}
          />
          <YAxis
            stroke="#9CA3AF"
            axisLine={false}
            tickLine={false}
            tickMargin={10}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937',
              border: '1px solid #374151'
            }}
            labelStyle={{ color: '#9CA3AF' }}
            itemStyle={{ color: '#E5E7EB' }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#6366F1"
            fillOpacity={1}
            fill="url(#colorValue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DashboardChart;
