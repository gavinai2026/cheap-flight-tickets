import AsyncStorage from '@react-native-async-storage/async-storage';
import { createLogger } from './logger';

const log = createLogger('ReviewPrompt');

const REVIEW_KEY = 'review_prompt_data';
const MIN_SEARCHES = 3;
const MIN_APP_OPENS = 5;
const COOLDOWN_DAYS = 90;

interface ReviewData {
  searchCount: number;
  appOpenCount: number;
  lastPromptDate: string | null;
  hasReviewed: boolean;
}

const getReviewData = async (): Promise<ReviewData> => {
  const data = await AsyncStorage.getItem(REVIEW_KEY);
  return data
    ? JSON.parse(data)
    : { searchCount: 0, appOpenCount: 0, lastPromptDate: null, hasReviewed: false };
};

const saveReviewData = async (data: ReviewData) => {
  await AsyncStorage.setItem(REVIEW_KEY, JSON.stringify(data));
};

export const incrementAppOpen = async () => {
  const data = await getReviewData();
  data.appOpenCount++;
  await saveReviewData(data);
};

export const incrementSearchCount = async () => {
  const data = await getReviewData();
  data.searchCount++;
  await saveReviewData(data);
};

export const shouldPromptReview = async (): Promise<boolean> => {
  try {
    const data = await getReviewData();

    if (data.hasReviewed) return false;

    if (data.searchCount < MIN_SEARCHES && data.appOpenCount < MIN_APP_OPENS) {
      return false;
    }

    if (data.lastPromptDate) {
      const lastDate = new Date(data.lastPromptDate);
      const daysSince = (Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < COOLDOWN_DAYS) return false;
    }

    return true;
  } catch {
    return false;
  }
};

export const markReviewPrompted = async () => {
  const data = await getReviewData();
  data.lastPromptDate = new Date().toISOString();
  await saveReviewData(data);
};

export const markReviewCompleted = async () => {
  const data = await getReviewData();
  data.hasReviewed = true;
  await saveReviewData(data);
};

export const requestStoreReview = async () => {
  try {
    // In production use: import * as StoreReview from 'expo-store-review';
    // if (await StoreReview.hasAction()) { await StoreReview.requestReview(); }
    await markReviewPrompted();
    log.info('Store review requested');
  } catch (error) {
    log.error('Store review request failed', error);
  }
};
