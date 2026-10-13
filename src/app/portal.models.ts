/* Clinical Signal Console: root-level contracts keep the portal mock API self-contained and easy to import from routed views. */
export type CategoryId = 'health' | 'safety' | 'diversity' | 'esg';
export type ModuleState = 'complete' | 'in-progress' | 'not-started';

export interface LearningCategory { id: CategoryId; path: string; label: string; progress: number; progressLabel: string; symbol: string; iconSrc: string; }
export interface LearningModule { id: string; category: CategoryId; title: string; publishedAt: string; state: ModuleState; statusLabel: string; rewardAmount: number; }
export interface PortalSummary { memberName: string; availableBalance: number; formattedBalance: string; categories: LearningCategory[]; nextReward: { amount: string; module: string }; }
export interface AnalyticsSnapshot { stats: { value: string; label: string }[]; }
export interface EarningEntry { id: string; description: string; completedAt: string; amount: string; }
