'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/context/AuthContext';
import { parseISO, isAfter, isBefore, differenceInCalendarMonths, startOfYear, endOfYear } from 'date-fns';

// サブスクリプションデータの型定義
interface Subscription {
  id: string;
  userId: string;
  name: string;
  price: number;
  category: string;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
}

// 年間見積もりデータの型定義
interface AnnualEstimationData {
  totalAmount: number;
  categories: CategoryEstimation[];
}

interface CategoryEstimation {
  category: string;
  totalAmount: number;
  services: ServiceEstimation[];
}

interface ServiceEstimation {
  name: string;
  amount: number;
  monthsUsed: number;
  startDate: string;
  endDate: string | null;
}

export const AnnualExpenseEstimation: React.FC = () => {
  const { user } = useAuth();
  const [estimationData, setEstimationData] = useState<AnnualEstimationData | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 年間支出を計算する関数
  const calculateAnnualExpense = (subscriptions: Subscription[]): AnnualEstimationData => {
    const currentYear = new Date().getFullYear();
    const yearStart = startOfYear(new Date(currentYear, 0, 1));
    const yearEnd = endOfYear(new Date(currentYear, 11, 31));

    const categoryMap: { [category: string]: ServiceEstimation[] } = {};
    let totalAmount = 0;

    subscriptions.forEach((subscription) => {
      const startDate = parseISO(subscription.startDate);
      const endDate = subscription.endDate ? parseISO(subscription.endDate) : null;

      // 今年に該当する期間を計算
      const effectiveStartDate = isAfter(startDate, yearStart) ? startDate : yearStart;
      const effectiveEndDate = endDate && isBefore(endDate, yearEnd) ? endDate : yearEnd;

      // 今年より前に終了した場合、または今年より後に開始した場合はスキップ
      if (endDate && isBefore(endDate, yearStart)) return;
      if (isAfter(startDate, yearEnd)) return;

      // 今年に該当する月数を計算
      const monthsUsed = differenceInCalendarMonths(effectiveEndDate, effectiveStartDate) + 1;
      
      if (monthsUsed > 0) {
        const serviceAmount = subscription.price * monthsUsed;
        totalAmount += serviceAmount;

        const serviceEstimation: ServiceEstimation = {
          name: subscription.name,
          amount: serviceAmount,
          monthsUsed,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
        };

        if (!categoryMap[subscription.category]) {
          categoryMap[subscription.category] = [];
        }
        categoryMap[subscription.category].push(serviceEstimation);
      }
    });

    // カテゴリ別にまとめて並び替え
    const categories: CategoryEstimation[] = Object.entries(categoryMap)
      .map(([category, services]) => ({
        category,
        totalAmount: services.reduce((sum, service) => sum + service.amount, 0),
        services: services.sort((a, b) => b.amount - a.amount),
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);

    return {
      totalAmount,
      categories,
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const subscriptionsRef = collection(db, 'subscriptions');
        const subscriptionsQuery = query(
          subscriptionsRef,
          where('userId', '==', user.uid)
        );
        const subscriptionsSnapshot = await getDocs(subscriptionsQuery);
        
        const subscriptions: Subscription[] = subscriptionsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Subscription[];

        const estimation = calculateAnnualExpense(subscriptions);
        setEstimationData(estimation);
      } catch (error) {
        console.error('年間支出見積もりの計算エラー:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (isLoading) {
    return (
      <Card className="rounded-2xl shadow-md bg-white">
        <CardContent className="p-8 text-center">
          <div className="text-gray-600">年間支出見積もりを計算中...</div>
        </CardContent>
      </Card>
    );
  }

  if (!estimationData) {
    return (
      <Card className="rounded-2xl shadow-md bg-white">
        <CardContent className="p-8 text-center">
          <div className="text-gray-600">データがありません</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl shadow-md bg-white">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-700">年間支出見積もり</CardTitle>
      </CardHeader>
      <CardContent>
        {/* 合計金額の表示 */}
        <div 
          className="text-center cursor-pointer p-6 hover:bg-gray-50 rounded-lg transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="text-3xl font-bold text-blue-600 mb-2">
            ¥{estimationData.totalAmount.toLocaleString()}
          </div>
          <div className="text-gray-600 text-sm">
            {new Date().getFullYear()}年度年間支出見積もり
          </div>
          <div className="text-gray-400 text-xs mt-2">
            {isExpanded ? '詳細を隠す' : 'クリックして詳細を表示'}
          </div>
        </div>

        {/* 詳細情報（展開時のみ表示） */}
        {isExpanded && (
          <div className="mt-6 border-t pt-6">
            <h3 className="text-md font-semibold text-gray-700 mb-4">カテゴリ別詳細</h3>
            
            {estimationData.categories.map((category) => (
              <div key={category.category} className="mb-6 last:mb-0">
                <div className="flex justify-between items-center mb-3 p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800">{category.category}</h4>
                  <span className="font-bold text-blue-600">
                    ¥{category.totalAmount.toLocaleString()}
                  </span>
                </div>
                
                <div className="ml-4 space-y-2">
                  {category.services.map((service, index) => (
                    <div key={index} className="flex justify-between items-center py-2 px-3 bg-white border rounded">
                      <div>
                        <span className="text-gray-800">{service.name}</span>
                        <span className="text-gray-500 text-sm ml-2">
                          （{service.monthsUsed}ヶ月間利用）
                        </span>
                      </div>
                      <span className="font-medium text-gray-700">
                        ¥{service.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 