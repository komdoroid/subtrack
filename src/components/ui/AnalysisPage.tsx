import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  TooltipProps,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type MonthlyData = {
  month: string;
  total: number;
  [category: string]: number | string;
};

type CategoryData = {
  category: string;
  total: number;
};

interface AnalysisPageProps {
  monthlyData: MonthlyData[];
  categoryData: CategoryData[];
}

const sampleMonthlyData: MonthlyData[] = [
  { month: '2024-01', total: 45000 },
  { month: '2024-02', total: 48000 },
  { month: '2024-03', total: 52000 },
  { month: '2024-04', total: 47000 },
  { month: '2024-05', total: 55000 },
  { month: '2024-06', total: 58000 },
];

const sampleCategoryData: CategoryData[] = [
  { category: 'ストリーミング', total: 5000 },
  { category: 'ショッピング', total: 15000 },
  { category: '学習', total: 8000 },
  { category: 'その他', total: 12000 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// 手動で TooltipPayload 型を定義
interface CustomTooltipPayload {
  payload: CategoryData;
  fill: string;
}

const CustomLineChartTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length && payload[0]) {
    return (
      <div className="p-2 bg-white border border-gray-200 rounded-lg shadow-lg">
        <p className="font-bold text-gray-700">{`${label}`}</p>
        <p className="text-sm text-blue-500">{`合計支出 : ${payload[0]?.value?.toLocaleString() ?? 0}円`}</p>
      </div>
    );
  }
  return null;
};

const CustomPieChartTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length > 0 && payload[0]) {
    const customPayload = payload as CustomTooltipPayload[];
    if (customPayload[0] && customPayload[0].payload) {
      const data = customPayload[0].payload;
      return (
        <div className="p-2 bg-white border border-gray-200 rounded-lg shadow-lg">
          <p className="font-bold text-gray-700">{data.category}</p>
          <p className="text-sm" style={{ color: customPayload[0].fill }}>
            {`支出: ${data.total.toLocaleString()}円`}
          </p>
        </div>
      );
    }
  }
  return null;
};

export const AnalysisPage: React.FC<Partial<AnalysisPageProps>> = ({
  monthlyData = sampleMonthlyData,
  categoryData = sampleCategoryData,
}) => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">支出分析</h1>

        <div className="grid grid-cols-1 gap-6">
          <Card className="rounded-2xl shadow-md bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-700">月別支出推移</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={monthlyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(value) => `${Number(value) / 1000}k`} />
                    <Tooltip content={<CustomLineChartTooltip />} />
                    <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-md bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-700">カテゴリ別割合（今月）</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={110}
                      fill="#8884d8"
                      dataKey="total"
                      nameKey="category"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieChartTooltip />} />
                    <Legend formatter={(value) => <span className="text-gray-600">{value}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPage; 