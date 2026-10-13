/* Clinical Signal Console: routed portal composition reads operational metrics only through the asynchronous mock API gateway. */
import { Component, computed, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Observable, catchError, map, of, startWith, switchMap } from 'rxjs';
import { ContentRow } from '../../components/content-row/content-row.component';
import { CategoryVideos } from '../../components/category-videos/category-videos.component';
import { FALLBACK_CATEGORY_ICON, ListenPayContentService } from '../../listenpay/listenpay-content.service';
import { YoutubeCategory } from '../../listenpay/listenpay.models';
import { MockPortalApiService } from '../../mock-portal-api.service';
import { CategoryId, LearningModule } from '../../portal.models';
import { ThemeService } from '../../theme.service';
import { SessionService } from '../../auth/session.service';

type PageId = 'dashboard' | 'health' | 'safety' | 'diversity' | 'esg' | 'profile' | 'analytics' | 'rewards' | 'support' | 'programs' | 'program-videos';
const isCategoryRoute = (page: PageId): page is CategoryId => ['health', 'safety', 'diversity', 'esg'].includes(page);

/** Result of an API read: 'loading' until it answers, then 'ready' or 'error'. */
interface Loadable<T> { state: 'idle' | 'loading' | 'ready' | 'error'; data: T; }
const IDLE: Loadable<YoutubeCategory[]> = { state: 'idle', data: [] };
function loadable<T>(source: Observable<T>, empty: T): Observable<Loadable<T>> {
  return source.pipe(
    map((data): Loadable<T> => ({ state: 'ready', data })),
    catchError(() => of<Loadable<T>>({ state: 'error', data: empty })),
    startWith<Loadable<T>>({ state: 'loading', data: empty }),
  );
}
const toId = (value: string | null): number | null => {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

@Component({
  selector: 'app-portal-page',
  imports: [RouterLink, RouterLinkActive, NgTemplateOutlet, ContentRow, CategoryVideos],
  templateUrl: './portal-page.component.html',
  styleUrl: './portal-page.component.css',
})
export class PortalPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(MockPortalApiService);
  private readonly themeService = inject(ThemeService);
  private readonly session = inject(SessionService);
  private readonly content = inject(ListenPayContentService);
  /** Industry chosen in the Dashboard Suite: drives the theme and industry-specific copy. */
  protected readonly industry = this.session.profile;
  protected readonly isIndustryTheme = this.themeService.isIndustryTheme;
  private readonly routeData = toSignal(this.route.data, { initialValue: { page: 'dashboard' } });
  protected readonly page = computed(() => this.routeData()['page'] as PageId);
  private readonly categoryRoute = computed(() => {
    const currentPage = this.page();
    return isCategoryRoute(currentPage) ? currentPage : null;
  });
  private readonly params = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });
  protected readonly parentId = computed(() => toId(this.params().get('parentId')));
  protected readonly childId = computed(() => toId(this.params().get('childId')));
  /** True when the JWT hand-off carries a user and company, so categories come from the ListenPay API. */
  protected readonly apiConnected = this.content.isConnected;
  /** Parent category tiles (dashboard) and the selected parent (child tile page). */
  private readonly reloadKey = signal(0);
  protected readonly parentCategories = toSignal(toObservable(computed(() => ({ page: this.page(), key: this.reloadKey() }))).pipe(switchMap(({ page }) =>
    this.apiConnected() && (page === 'dashboard' || page === 'programs' || page === 'program-videos') ? loadable(this.content.getParentCategories(), []) : of(IDLE))), { initialValue: IDLE });
  /** Child category tiles under the parent in the URL. */
  protected readonly childCategories = toSignal(toObservable(computed(() => ({ page: this.page(), parentId: this.parentId(), key: this.reloadKey() }))).pipe(switchMap(({ page, parentId }) =>
    this.apiConnected() && parentId && (page === 'programs' || page === 'program-videos') ? loadable(this.content.getChildCategories(parentId), []) : of(IDLE))), { initialValue: IDLE });
  protected readonly parentCategory = computed(() => this.parentCategories().data.find((c) => c.youTubeVideoCategoryId === this.parentId()) ?? null);
  protected readonly childCategory = computed(() => this.childCategories().data.find((c) => c.youTubeVideoCategoryId === this.childId()) ?? null);
  /** Program banner: the child category background image (as ListenPay2026), else the industry banner. */
  private readonly failedBanner = signal<string | null>(null);
  protected readonly programBanner = computed(() => {
    const background = this.asset(this.childCategory()?.backgroundImageURL);
    return background && background !== this.failedBanner() ? background : this.industry().bannerImage;
  });
  protected readonly summary = toSignal(this.api.getSummary(), { initialValue: null });
  protected readonly analytics = toSignal(this.api.getAnalytics(), { initialValue: null });
  protected readonly earnings = toSignal(this.api.getEarnings(), { initialValue: null });
  /** Earned balance from the ListenPay API once an activity has been recorded, else the portal summary. */
  protected readonly balance = computed(() => {
    const earned = this.content.earned();
    return earned !== null ? earned.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : this.summary()?.formattedBalance ?? null;
  });
  protected readonly memberName = computed(() => this.session.displayName() ?? this.summary()?.memberName ?? null);
  protected readonly moduleItems = toSignal(toObservable(this.categoryRoute).pipe(switchMap((category) => category ? this.api.getModules(category).pipe(startWith(null)) : of<LearningModule[] | null>([]))), { initialValue: null });
  protected readonly menuOpen = signal(false);
  protected readonly navigation = [{ path: '/dashboard', label: 'Home / Dashboard', icon: 'bi bi-home' }, { path: '/profile', label: 'Profile', icon: 'bi bi-person-lines-fill' }, { path: '/analytics', label: 'Progress / Analytics', icon: 'bi bi-graph-up-arrow' }, { path: '/rewards', label: 'Redeem Rewards', icon: 'bi bi-gift' }, { path: '/support', label: 'Support', icon: 'bi bi-support' }];
  protected readonly bottomNav = [{ path: '/dashboard', label: 'Home', icon: 'bi bi-home' }, { path: '/profile', label: 'Profile', icon: 'bi bi-person-lines-fill' }, { path: '/analytics', label: 'Analytics', icon: 'bi bi-graph-up-arrow' }, { path: '/rewards', label: 'Rewards', icon: 'bi bi-gift' }, { path: '/support', label: 'Support', icon: 'bi bi-support' }];
  protected readonly supportItems = [{ symbol: '◷', title: 'Getting Started', text: 'Learn how to navigate the portal and start earning rewards.' }, { symbol: '▶', title: 'Content & Playback Issues', text: 'Troubleshoot video or audio playback problems.' }, { symbol: '▣', title: 'Earnings & Rewards', text: 'Questions about your balance, redemption, or payment methods.' }, { symbol: '◯', title: 'Account & Profile', text: 'Update your profile information, password, or notification settings.' }, { symbol: '⌕', title: 'Contact Us', text: 'Reach our support team at support@listenpay.com.' }];
  protected readonly pageMeta = computed(() => ({ dashboard: { title: this.industry().dashboardTitle, symbol: '◯', iconSrc: this.industry().dashboardIcon }, health: { title: 'Health & Wellness', symbol: '✚', iconSrc: '/assets/images/health-wellness.png' }, safety: { title: 'Safety & Training', symbol: '⌑', iconSrc: '/assets/images/safety.png' }, diversity: { title: 'Diversity Initiatives', symbol: '◎', iconSrc: '/assets/images/diversity.png' }, esg: { title: 'ESG Learning', symbol: '◌', iconSrc: '/assets/images/esg.png' }, profile: { title: 'Your Learning Progress', symbol: '◯', iconSrc: null }, analytics: { title: this.industry().analyticsTitle, symbol: '⌁', iconSrc: null }, rewards: { title: 'Redeem Your Earned Rewards', symbol: '▣', iconSrc: null }, support: { title: 'Support for Your Learning', symbol: '?', iconSrc: null }, programs: { title: this.parentCategory()?.title ?? 'Programs', symbol: '▶', iconSrc: this.categoryIcon(this.parentCategory()) }, 'program-videos': { title: this.childCategory()?.title ?? 'Videos', symbol: '▶', iconSrc: this.categoryIcon(this.childCategory(), true) } })[this.page()]);
  /** Back goes up one level: videos → child tiles → dashboard. */
  protected readonly backPath = computed(() => this.page() === 'program-videos' && this.parentId() ? `/programs/${this.parentId()}` : '/dashboard');
  protected asset(url: string | null | undefined): string | null { return this.content.resolveAsset(url); }
  protected categoryIcon(category: YoutubeCategory | null, preferTitleImage = false): string {
    const url = preferTitleImage ? category?.titleImageURL || category?.iconURL : category?.iconURL;
    return this.asset(url) ?? FALLBACK_CATEGORY_ICON;
  }
  /** Swaps a missing category image for the generic icon once. */
  protected iconFallback(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img.dataset['fallback']) return;
    img.dataset['fallback'] = '1';
    img.src = FALLBACK_CATEGORY_ICON;
  }
  protected bannerError(event: Event): void {
    const src = (event.target as HTMLImageElement).getAttribute('src');
    if (src && src !== this.industry().bannerImage) this.failedBanner.set(src);
  }
  /** Re-requests the category lists after a failed load. */
  protected retryCategories(): void { this.reloadKey.update((key) => key + 1); }
  protected go(path: string): void { this.menuOpen.set(false); void this.router.navigateByUrl(path); }
  protected toggleTheme(): void { this.themeService.toggle(); }
  protected signOut(): void { this.menuOpen.set(false); this.session.signOut(); }
}
