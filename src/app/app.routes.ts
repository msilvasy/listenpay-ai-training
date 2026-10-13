import { Routes } from '@angular/router';
import { PortalPage } from './pages/portal-page/portal-page.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'dashboard', component: PortalPage, data: { page: 'dashboard' }, title: 'Dashboard · ListenPay' },
  { path: 'health', component: PortalPage, data: { page: 'health' }, title: 'Health & Wellness · ListenPay' },
  { path: 'safety', component: PortalPage, data: { page: 'safety' }, title: 'Safety & Training · ListenPay' },
  { path: 'diversity', component: PortalPage, data: { page: 'diversity' }, title: 'Diversity Initiatives · ListenPay' },
  { path: 'esg', component: PortalPage, data: { page: 'esg' }, title: 'ESG · ListenPay' },
  // ListenPay API categories: parent tile → child category tiles → videos with the video modal.
  { path: 'programs/:parentId', component: PortalPage, data: { page: 'programs' }, title: 'Programs · ListenPay' },
  { path: 'programs/:parentId/:childId', component: PortalPage, data: { page: 'program-videos' }, title: 'Videos · ListenPay' },
  { path: 'profile', component: PortalPage, data: { page: 'profile' }, title: 'Profile · ListenPay' },
  { path: 'analytics', component: PortalPage, data: { page: 'analytics' }, title: 'Analytics · ListenPay' },
  { path: 'rewards', component: PortalPage, data: { page: 'rewards' }, title: 'Rewards · ListenPay' },
  { path: 'support', component: PortalPage, data: { page: 'support' }, title: 'Support · ListenPay' },
  { path: '**', redirectTo: 'dashboard' },
];
