export type DailyCicleModel = {
  id: string;
  userId: string;
  date: Date;
  morningBriefing: string | null;
  checkoutStatus: 'Completed' | 'Pending' | 'Skipped' | null;
  dailyMood: number | null;
  endDaySummary: string | null;
  createdAt: Date;
  updatedAt: Date;
}