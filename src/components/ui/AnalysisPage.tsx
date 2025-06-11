"use client";

import React, { useEffect, useState } from 'react';
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
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/context/AuthContext';

type MonthlyData = {
  month: string;
  total: number;
  [category: string]: number | string;
};

type CategoryData = {
  category: string;
  total: number;
};

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

export const AnalysisPage: React.FC = () => {
  const { user } = useAuth();
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // サブスクリプションデータの取得
        const subscriptionsRef = collection(db, 'subscriptions');
        const subscriptionsQuery = query(
          subscriptionsRef,
          where('userId', '==', user.uid),
          where('isActive', '==', true)
        );
        const subscriptionsSnapshot = await getDocs(subscriptionsQuery);
        
        // カテゴリごとの合計を計算
        const categoryTotals: { [key: string]: number } = {};
        subscriptionsSnapshot.forEach((doc) => {
          const data = doc.data();
          const category = data.category || 'その他';
          categoryTotals[category] = (categoryTotals[category] || 0) + (data.price || 0);
        });

        const categoryResults: CategoryData[] = Object.entries(categoryTotals)
          .map(([category, total]) => ({
            category,
            total,
          }))
          .sort((a, b) => b.total - a.total); // 金額の大きい順にソート

        // 月別データの計算
        const today = new Date();
        const monthlyResults: MonthlyData[] = [];
        
        // 過去6ヶ月分のデータを生成
        for (let i = 0; i < 6; i++) {
          const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
          const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
          // その月のアクティブなサブスクリプションの合計を計算
          let total = 0;
          subscriptionsSnapshot.forEach((doc) => {
            const data = doc.data();
            const startDate = new Date(data.startDate);
            const endDate = data.endDate ? new Date(data.endDate) : null;
            
            if (startDate <= date && (!endDate || endDate >= date)) {
              total += data.price || 0;
            }
          });
          
          monthlyResults.push({
            month,
            total,
          });
        }

        setMonthlyData(monthlyResults.reverse()); // 古い順に並び替え
        setCategoryData(categoryResults);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-gray-600">データを読み込み中...</div>
      </div>
    );
  }

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