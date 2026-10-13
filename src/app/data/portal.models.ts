/* Clinical Signal Console: shared contracts make asynchronous portal data explicit, stable, and ready to replace with a real API. */
export type CategoryId = 'health' | 'safety' | 'diversity' | 'esg';
export type ModuleState = 'complete' | 'in-progress' | 'not-started';

export interface LearningCategory {
  id: CategoryId;
  path: string;
  label: string;
  progress: number;
  progressLabel: string;
  symbol: string;
}

export interface LearningModule {
  id: string;
  category: CategoryId;
  title: string;
  publishedAt: string;
  state: ModuleState;
  statusLabel: string;
  rewardAmount: number;
}

export interface PortalSummary {
  memberName: string;
  availableBalance: number;
  formattedBalance: string;
  categories: LearningCategory[];
  nextReward: { amount: string; module: string };
}

export interface AnalyticsSnapshot {
  stats: { value: string; label: string }[];
}

export interface EarningEntry {
  id: string;
  description: string;
  completedAt: string;
  amount: string;
}
