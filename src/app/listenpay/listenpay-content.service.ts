/* ListenPay Programs: reads company categories and videos from the ListenPay API and records YouTube activity and watch time, as ListenPay2026 does. */
import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, OperatorFunction, map, of, shareReplay, tap, throwError } from 'rxjs';
import { APP_SETTINGS } from '../app.settings';
import { SessionService } from '../auth/session.service';
import {
  ApiEnvelope,
  ApiResponseCode,
  ListenPayActivity,
  YOUTUBE_ACTIVITY_TYPE,
  YouTubeVideo,
  YoutubeCategory,
} from './listenpay.models';

/** Generic category icon when the API has none or the file is missing. */
export const FALLBACK_CATEGORY_ICON = '/assets/images/health-wellness.png';

export class NotConnectedError extends Error {
  constructor() {
    super('No ListenPay session: sign in through the Dashboard Suite to load your programs.');
  }
}

/** Unwraps ResponseModel<T>: OK → dataSet, NoDataFound → empty, anything else → error. */
function unwrap<T>(empty: T): OperatorFunction<ApiEnvelope<T> | T | null, T> {
  return map((body) => {
    if (body && typeof body === 'object' && 'responseCode' in body) {
      const envelope = body as ApiEnvelope<T>;
      if (envelope.responseCode === ApiResponseCode.OK) return envelope.dataSet ?? empty;
      if (envelope.responseCode === ApiResponseCode.NoDataFound) return empty;
      throw new Error(envelope.responseMessage || 'The ListenPay API returned an error.');
    }
    return (body ?? empty) as T;
  });
}

@Injectable({ providedIn: 'root' })
export class ListenPayContentService {
  private readonly http = inject(HttpClient);
  private readonly session = inject(SessionService);
  private readonly api = APP_SETTINGS.apiUrl;

  private parentCategories$?: Observable<YoutubeCategory[]>;
  private readonly childCategories$ = new Map<number, Observable<YoutubeCategory[]>>();
  private videos$?: Observable<YouTubeVideo[]>;

  /** True when the handed-over JWT carries the user and company the API calls need. */
  readonly isConnected = computed(() => this.session.userId() !== null && this.session.companyId() !== null);
  /** Earned balance returned by the activity endpoint; null until the first activity is recorded. */
  readonly earned = signal<number | null>(null);

  /** Parent category tiles for the dashboard (GetParentYouTubeCategoriesByCompanyId). */
  getParentCategories(refresh = false): Observable<YoutubeCategory[]> {
    const companyId = this.session.companyId();
    if (!companyId) return throwError(() => new NotConnectedError());
    if (!this.parentCategories$ || refresh) {
      this.parentCategories$ = this.cached(
        this.http
          .get<ApiEnvelope<YoutubeCategory[]>>(`${this.api}YouTubeCategory/GetParentYouTubeCategoriesByCompanyId`, {
            params: { companyId },
          })
          .pipe(unwrap<YoutubeCategory[]>([])),
        () => (this.parentCategories$ = undefined),
      );
    }
    return this.parentCategories$;
  }

  /** Child category tiles under a parent (GetYTCategoriesByCompanyAndCatId). */
  getChildCategories(parentId: number): Observable<YoutubeCategory[]> {
    const companyId = this.session.companyId();
    if (!companyId) return throwError(() => new NotConnectedError());
    let request = this.childCategories$.get(parentId);
    if (!request) {
      request = this.cached(
        this.http
          .get<ApiEnvelope<YoutubeCategory[]>>(`${this.api}YouTubeCategory/GetYTCategoriesByCompanyAndCatId`, {
            params: { companyId, parentId },
          })
          .pipe(unwrap<YoutubeCategory[]>([])),
        () => this.childCategories$.delete(parentId),
      );
      this.childCategories$.set(parentId, request);
    }
    return request;
  }

  /** The company's videos with this user's progress (GetYouTubeVideosByCompanyAndUserId). */
  getVideos(fromServer = false): Observable<YouTubeVideo[]> {
    const companyId = this.session.companyId();
    const userId = this.session.userId();
    if (!companyId || !userId) return throwError(() => new NotConnectedError());
    if (!this.videos$ || fromServer) {
      this.videos$ = this.cached(
        this.http
          .get<ApiEnvelope<YouTubeVideo[]>>(`${this.api}YouTubeVideo/GetYouTubeVideosByCompanyAndUserId`, {
            params: { companyId, userId },
          })
          .pipe(unwrap<YouTubeVideo[]>([])),
        () => (this.videos$ = undefined),
      );
    }
    return this.videos$;
  }

  /** Videos tagged with a child category. */
  getVideosForCategory(categoryId: number, fromServer = false): Observable<YouTubeVideo[]> {
    return this.getVideos(fromServer).pipe(
      map((videos) =>
        videos.filter((video) => video.relatedCategories?.some((c) => c.youTubeVideoCategoryId === categoryId)),
      ),
    );
  }

  /** Posts a YouTube activity (account/{email}/activity) and keeps the earned balance current. */
  recordActivity(activity: Omit<ListenPayActivity, 'activityType' | 'companyId' | 'userInformationId'>): void {
    const email = this.session.email();
    const companyId = this.session.companyId();
    const userInformationId = this.session.userId();
    if (!email || !companyId || !userInformationId) return;
    const body: ListenPayActivity = { ...activity, activityType: YOUTUBE_ACTIVITY_TYPE, companyId, userInformationId };
    this.http
      .post<ApiEnvelope<{ earned?: number } | null>>(`${this.api}account/${encodeURIComponent(email)}/activity`, body)
      .pipe(unwrap<{ earned?: number } | null>(null))
      .subscribe({
        next: (account) => {
          if (typeof account?.earned === 'number') this.earned.set(account.earned);
        },
        error: (error) => console.warn('ListenPay activity was not recorded', error),
      });
  }

  /** Saves how far the user watched a video (ActivityLog/AddUserVideoWatchTime). */
  saveWatchTime(youTubeVideoId: number, watchTimeInSeconds: number, videoDuration: number): Observable<unknown> {
    const companyId = this.session.companyId();
    const userId = this.session.userId();
    if (!companyId || !userId) return of(null);
    return this.http
      .post<ApiEnvelope<unknown>>(`${this.api}ActivityLog/AddUserVideoWatchTime`, {
        CompanyId: companyId,
        UserId: userId,
        YouTubeVideoId: youTubeVideoId,
        WatchTimeInSecond: Math.max(0, watchTimeInSeconds || 0),
        VideoDuration: Math.max(0, videoDuration || 0),
      })
      .pipe(unwrap<unknown>(null));
  }

  /** Turns the API's relative image paths into URLs; null when there is no image. */
  resolveAsset(url: string | null | undefined): string | null {
    const value = url?.trim().replace(/\\/g, '/');
    if (!value || value.endsWith('/')) return null;
    if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:')) return value;
    const base = APP_SETTINGS.categoryAssetBaseUrl.replace(/\/+$/, '');
    return `${base}/${value.replace(/^\/+/, '')}`;
  }

  /** Shares one request between subscribers; a failed request is dropped so the next call retries. */
  private cached<T>(request: Observable<T>, onError: () => void): Observable<T> {
    return request.pipe(
      tap({ error: onError }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
  }
}
