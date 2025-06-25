'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
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
      <div className="text-center">
        <div className="text-gray-600">年間支出見積もりを計算中...</div>
      </div>
    );
  }

  if (!estimationData) {
    return (
      <div className="text-center">
        <div className="text-gray-600">データがありません</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-gray-500 text-sm">{new Date().getFullYear()}年度年間支出見積もり</h3>
        <p className="text-4xl font-bold text-blue-600">¥{estimationData.totalAmount.toLocaleString()}</p>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-blue-500 hover:underline mt-1 inline-flex items-center transition-all duration-200 hover:gap-2"
        >
          詳細を{isExpanded ? '隠す' : '表示'}
          {isExpanded ? (
            <ChevronUp size={16} className="ml-1" />
          ) : (
            <ChevronDown size={16} className="ml-1" />
          )}
        </button>
      </div>

      {/* 詳細情報（展開時のみ表示） */}
      {isExpanded && (
        <div className="border-t pt-4 space-y-3">
          {estimationData.categories.map((category) => (
            <div key={category.category}>
              <div className="flex justify-between text-sm font-semibold text-gray-700">
                <span>{category.category}</span>
                <span className="text-blue-600">¥{category.totalAmount.toLocaleString()}</span>
              </div>
              {category.services.map((service, index) => (
                <div key={index} className="ml-4 flex justify-between text-sm text-gray-600">
                  <span>{service.name}（{service.monthsUsed}ヶ月間利用）</span>
                  <span>¥{service.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}; 