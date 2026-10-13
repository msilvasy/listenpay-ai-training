/* Clinical Signal Console: root-level async mock API provides a portable backend replacement for local builds and future HTTP integration. */
import { Injectable } from '@angular/core';
import { Observable, defer, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AnalyticsSnapshot, CategoryId, EarningEntry, LearningModule, PortalSummary } from './portal.models';

const RESPONSE_DELAY_MS = 520;

@Injectable({ providedIn: 'root' })
export class MockPortalApiService {
  private readonly summary: PortalSummary = {
    memberName: 'Portal User', availableBalance: 12226.32, formattedBalance: '$12,226.32', nextReward: { amount: '$4.25', module: 'Heart Health' },
    categories: [
      { id: 'health', path: '/health', label: 'Health & Wellness', progress: 71, progressLabel: '71% complete', symbol: '✚', iconSrc: '/assets/images/health-wellness.png' },
      { id: 'safety', path: '/safety', label: 'Safety & Training', progress: 38, progressLabel: '38% complete', symbol: '⌑', iconSrc: '/assets/images/safety.png' },
      { id: 'diversity', path: '/diversity', label: 'Diversity Initiatives', progress: 0, progressLabel: 'Not started', symbol: '◎', iconSrc: '/assets/images/diversity.png' },
      { id: 'esg', path: '/esg', label: 'ESG', progress: 0, progressLabel: 'Not started', symbol: '◌', iconSrc: '/assets/images/esg.png' },
    ],
  };
  private readonly modules: LearningModule[] = [
    { id: 'health-001', category: 'health', title: 'Heart Health 001', publishedAt: '3/30/2021', state: 'complete', statusLabel: 'Complete', rewardAmount: 4.25 },
    { id: 'health-002', category: 'health', title: 'What are heart valves and heart valve disease?', publishedAt: '9/3/2021', state: 'complete', statusLabel: 'Complete', rewardAmount: 4.25 },
    { id: 'health-003', category: 'health', title: 'Eat Heart-Healthy Diet in 2021', publishedAt: '3/30/2021', state: 'complete', statusLabel: 'Complete', rewardAmount: 4.25 },
    { id: 'health-004', category: 'health', title: 'Heart Valve Replacement: mechanical or biological tissue valve', publishedAt: '7/16/2023', state: 'complete', statusLabel: 'Complete', rewardAmount: 4.25 },
    { id: 'health-005', category: 'health', title: 'Managing Stress for a Healthier Heart', publishedAt: '1/15/2024', state: 'in-progress', statusLabel: '45% In Progress', rewardAmount: 4.25 },
    { id: 'safety-001', category: 'safety', title: 'OSHA Fundamentals 101', publishedAt: '6/1/2022', state: 'complete', statusLabel: 'Complete', rewardAmount: 6.5 },
    { id: 'safety-002', category: 'safety', title: 'Hazard Communication Standards', publishedAt: '7/15/2022', state: 'complete', statusLabel: 'Complete', rewardAmount: 6.5 },
    { id: 'safety-003', category: 'safety', title: 'Personal Protective Equipment', publishedAt: '8/20/2022', state: 'in-progress', statusLabel: '20% In Progress', rewardAmount: 6.5 },
    { id: 'safety-004', category: 'safety', title: 'Emergency Response Procedures', publishedAt: '9/5/2022', state: 'not-started', statusLabel: 'Not Started', rewardAmount: 6.5 },
    { id: 'diversity-001', category: 'diversity', title: 'Understanding Unconscious Bias', publishedAt: '3/1/2023', state: 'not-started', statusLabel: 'Not Started', rewardAmount: 5 },
    { id: 'diversity-002', category: 'diversity', title: 'Building an Inclusive Workplace', publishedAt: '4/15/2023', state: 'not-started', statusLabel: 'Not Started', rewardAmount: 5 },
    { id: 'diversity-003', category: 'diversity', title: 'Equity vs. Equality in the Workplace', publishedAt: '5/10/2023', state: 'not-started', statusLabel: 'Not Started', rewardAmount: 5 },
    { id: 'esg-001', category: 'esg', title: 'Introduction to ESG Principles', publishedAt: '1/10/2024', state: 'not-started', statusLabel: 'Not Started', rewardAmount: 5 },
    { id: 'esg-002', category: 'esg', title: 'Corporate Social Responsibility', publishedAt: '2/5/2024', state: 'not-started', statusLabel: 'Not Started', rewardAmount: 5 },
    { id: 'esg-003', category: 'esg', title: 'Sustainable Business Practices', publishedAt: '3/20/2024', state: 'not-started', statusLabel: 'Not Started', rewardAmount: 5 },
  ];
  private readonly analytics: AnalyticsSnapshot = { stats: [{ value: '$12,226', label: 'Total earned' }, { value: '47', label: 'Videos watched' }, { value: '31h', label: 'Time engaged' }, { value: '71%', label: 'Avg. completion' }] };
  private readonly earnings: EarningEntry[] = [
    { id: 'earn-001', description: 'Heart Health 001 — Completed', completedAt: '3/30/2021', amount: '$4.25' }, { id: 'earn-002', description: 'Heart Valve Disease — Completed', completedAt: '9/3/2021', amount: '$4.25' }, { id: 'earn-003', description: 'Heart-Healthy Diet 2021 — Completed', completedAt: '3/30/2021', amount: '$4.25' }, { id: 'earn-004', description: 'Safety Training Module 01', completedAt: '11/12/2022', amount: '$6.50' }, { id: 'earn-005', description: 'Safety Training Module 02', completedAt: '11/20/2022', amount: '$6.50' },
  ];

  getSummary(): Observable<PortalSummary> { return this.respond(this.summary); }
  getModules(category: CategoryId): Observable<LearningModule[]> { return this.respond(this.modules.filter((module) => module.category === category)); }
  getAnalytics(): Observable<AnalyticsSnapshot> { return this.respond(this.analytics); }
  getEarnings(): Observable<EarningEntry[]> { return this.respond(this.earnings); }
  private respond<T>(payload: T): Observable<T> { return defer(() => of(structuredClone(payload)).pipe(delay(RESPONSE_DELAY_MS))); }
}
