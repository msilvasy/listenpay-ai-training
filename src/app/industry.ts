/* ListenPay Programs: industry profiles chosen in the ListenPay AI Dashboard Suite drive the theme and the industry-specific copy. */

/** Industry ids the Dashboard Suite sends as `?industry=<id>`. */
export type IndustryId = 'health-care' | 'industrial' | 'commercial';

/** `data-theme` value applied to <html> for each industry. */
export type IndustryTheme = 'HealthcareMode' | 'IndustrialMode' | 'CommercialMode';

export interface IndustryProfile {
  id: IndustryId;
  label: string;
  theme: IndustryTheme;
  /** Label beside the theme switch in the account menu. */
  themeLabel: string;
  /** Browser chrome colour (meta theme-color) while the industry theme is on. */
  chromeColor: string;
  dashboardTitle: string;
  dashboardIcon: string;
  analyticsTitle: string;
  bannerKicker: string;
  bannerTitle: string;
  bannerCopy: string;
  bannerImage: string;
  bannerAlt: string;
  analyticsKicker: string;
  badge: string;
  infoStrip: string;
  tagline: string;
  complianceLink: string;
}

export const DEFAULT_INDUSTRY: IndustryId = 'health-care';

export const INDUSTRIES: Record<IndustryId, IndustryProfile> = {
  'health-care': {
    id: 'health-care',
    label: 'Health Care',
    theme: 'HealthcareMode',
    themeLabel: 'Healthcare Mode',
    chromeColor: '#012151',
    dashboardTitle: 'Your Clinical Earning Journey',
    dashboardIcon: '/assets/images/health-wellness.png',
    analyticsTitle: 'Clinical Progress & Earnings',
    bannerKicker: 'Clinical learning, real rewards',
    bannerTitle: 'Earn while you learn.',
    bannerCopy: 'Complete trusted content and see your learning turn into earnings.',
    bannerImage: '/assets/images/listenpay-dashboard-accent.jpg',
    bannerAlt: 'Healthcare professional completing a digital learning module',
    analyticsKicker: 'Measured clinical momentum',
    badge: 'CME Eligible',
    infoStrip: 'Select a category below to begin earning. Content is updated weekly with new clinical material.',
    tagline: 'Empowering healthcare professionals through continuous learning.',
    complianceLink: 'HIPAA Notice',
  },
  industrial: {
    id: 'industrial',
    label: 'Industrial',
    theme: 'IndustrialMode',
    themeLabel: 'Industrial Mode',
    chromeColor: '#06090d',
    dashboardTitle: 'Your Safety Earning Journey',
    dashboardIcon: '/assets/images/safety.png',
    analyticsTitle: 'Safety Progress & Earnings',
    bannerKicker: 'Safety on the floor, real rewards',
    bannerTitle: 'Earn while you train.',
    bannerCopy: 'Short, audio-first hazard and equipment sessions that turn into earnings.',
    bannerImage: '/assets/images/dock-worker.jpg',
    bannerAlt: 'Worker in a vehicle wearing a communications headset',
    analyticsKicker: 'Measured safety momentum',
    badge: 'OSHA Aligned',
    infoStrip: 'Select a category below to begin earning. Hazard and equipment content is updated weekly.',
    tagline: 'Keeping industrial teams safe, certified, and ready for the shift.',
    complianceLink: 'OSHA Notice',
  },
  commercial: {
    id: 'commercial',
    label: 'Commercial',
    theme: 'CommercialMode',
    themeLabel: 'Commercial Mode',
    chromeColor: '#1b2a41',
    dashboardTitle: 'Your Team Earning Journey',
    dashboardIcon: '/assets/images/diversity.png',
    analyticsTitle: 'Team Progress & Earnings',
    bannerKicker: 'Consistent standards, real rewards',
    bannerTitle: 'Earn while you grow.',
    bannerCopy: 'Policy, conduct, and wellbeing learning that turns into earnings.',
    bannerImage: '/assets/images/union-worker.jpg',
    bannerAlt: 'Team member in a training environment',
    analyticsKicker: 'Measured team momentum',
    badge: 'Policy Aligned',
    infoStrip: 'Select a category below to begin earning. Policy and conduct content is updated weekly.',
    tagline: 'Aligning distributed teams on policy, conduct, and wellbeing.',
    complianceLink: 'Code of Conduct',
  },
};

export function isIndustryId(value: unknown): value is IndustryId {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(INDUSTRIES, value);
}
