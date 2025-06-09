/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as functions from 'firebase-functions';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { initializeApp } from 'firebase-admin/app';

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// Initialize Firebase Admin
initializeApp();

/**
 * 指定された日付の翌月同日を計算する
 * 存在しない日付の場合は自動的に月末に丸められる
 * @param dateStr - ISO形式の日付文字列 (YYYY-MM-DD)
 * @returns 翌月同日のISO形式日付文字列
 */
function calculateNextMonthDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  
  // 翌月同日を計算（存在しない日付は自動的に月末に丸められる）
  const nextDate = new Date(year, month, day);
  
  // YYYY-MM-DD形式の文字列に変換
  return nextDate.toISOString().split('T')[0];
}

/**
 * 毎日0時に実行され、その日が支払日のサブスクリプションの
 * 翌月分を自動作成するCloud Function
 */
export const autoCreateNextMonthSubscriptions = functions.pubsub.schedule('0 0 * * *').timeZone('Asia/Tokyo').onRun(async (context) => {
  const db = getFirestore();
  
  try {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const todayDay = today.getDate();
    
    console.log(`Starting subscription processing for date: ${todayStr} (day: ${todayDay})`);

    // 当日が支払日のサブスクリプションを検索
    const snapshot = await db.collection('subscriptions')
      .where('isPast', '==', false)  // アクティブなもののみ
      .get();

    if (snapshot.empty) {
      console.log('No active subscriptions found');
      return;
    }

    const batch = db.batch();
    let processedCount = 0;

    for (const doc of snapshot.docs) {
      const subscription = doc.data();
      const billingDate = subscription.billingDate;
      const billingDay = Number(billingDate.split('-')[2]);

      // 今日が支払日の場合のみ処理
      if (billingDay === todayDay) {
        console.log(`Processing subscription: ${subscription.name} (ID: ${doc.id})`);

        // 翌月の支払日を計算
        const nextBillingDate = calculateNextMonthDate(billingDate);

        // 新しい支払いエントリを作成
        const newDocRef = db.collection('subscriptions').doc();
        batch.set(newDocRef, {
          userId: subscription.userId,
          name: subscription.name,
          price: subscription.price,
          billingDate: nextBillingDate,
          createdAt: Timestamp.now(),
          isPast: false
        });

        // 元のドキュメントを過去分としてマーク
        batch.update(doc.ref, {
          isPast: true,
          updatedAt: Timestamp.now()
        });

        processedCount++;
        console.log(`Created next month entry for ${subscription.name}: ${nextBillingDate}`);
      }
    }

    if (processedCount > 0) {
      await batch.commit();
      console.log(`Successfully processed ${processedCount} subscriptions`);
    } else {
      console.log('No subscriptions needed processing today');
    }
  } catch (error) {
    console.error('Error processing subscriptions:', error);
    throw error;
  }
});

/**
 * 毎日0時に実行され、期限切れのサブスクリプションに
 * isPast フラグを設定するCloud Function
 */
export const markPastSubscriptions = functions.pubsub.schedule('0 0 * * *').timeZone('Asia/Tokyo').onRun(async (context) => {
  const db = getFirestore();
  
  try {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    console.log(`Starting past subscription marking for date: ${todayStr}`);

    // 期限切れかつまだisPastがfalseのサブスクリプションを検索
    const snapshot = await db.collection('subscriptions')
      .where('isPast', '==', false)
      .where('billingDate', '<', todayStr)
      .get();

    if (snapshot.empty) {
      console.log('No expired subscriptions found');
      return;
    }

    const batch = db.batch();
    let processedCount = 0;

    for (const doc of snapshot.docs) {
      batch.update(doc.ref, {
        isPast: true,
        updatedAt: Timestamp.now()
      });
      processedCount++;
    }

    if (processedCount > 0) {
      await batch.commit();
      console.log(`Marked ${processedCount} subscriptions as past`);
    }
  } catch (error) {
    console.error('Error marking past subscriptions:', error);
    throw error;
  }
});
