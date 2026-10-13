/* ListenPay Programs: holds the JWT and industry handed over by the ListenPay AI Dashboard Suite. */
import { Injectable, computed, signal } from '@angular/core';
import { APP_SETTINGS } from '../app.settings';
import { DEFAULT_INDUSTRY, INDUSTRIES, IndustryId, isIndustryId } from '../industry';

/** sessionStorage, so the hand-off clears when the tab closes (same policy as the Suite's account). */
const TOKEN_KEY = 'listenpay-programs-token';
const INDUSTRY_KEY = 'listenpay-programs-industry';
/** RBAC claim carrying UserInformationId (AppClaims.UserId on the API) — same check as the Suite. */
const USER_ID_CLAIM = 'lp_uid';
/** Company claim (AppClaims.CompanyId); JwtMiddleware reads the part before any '-'. */
const COMPANY_ID_CLAIM = 'CompanyId';
/** ClaimTypes.Email as written by JwtSecurityTokenHandler, plus the unmapped long form. */
const EMAIL_CLAIMS = ['email', 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];

function positiveInt(value: unknown): number | null {
  const parsed = Number(String(value ?? '').split('-')[0]);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

export interface JwtClaims {
  exp: number;
  [claim: string]: unknown;
}

/**
 * Claims of a well-formed, unexpired ListenPay JWT, or null. Decoding is only to decide whether
 * to use the token; the API verifies the signature on every request.
 */
export function readClaims(token: string | null | undefined): JwtClaims | null {
  if (!token || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token)) return null;
  try {
    const segment = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const claims = JSON.parse(atob(segment.padEnd(segment.length + ((4 - (segment.length % 4)) % 4), '=')));
    const userId = Number(claims?.[USER_ID_CLAIM]);
    if (typeof claims?.exp !== 'number' || claims.exp * 1000 <= Date.now()) return null;
    if (!Number.isSafeInteger(userId) || userId <= 0) return null;
    return claims as JwtClaims;
  } catch {
    return null;
  }
}

export interface HandoffResult {
  industry: IndustryId | null;
  tokenReceived: boolean;
}

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly tokenState = signal<string | null>(null);
  private readonly industryState = signal<IndustryId>(DEFAULT_INDUSTRY);

  readonly industry = this.industryState.asReadonly();
  readonly profile = computed(() => INDUSTRIES[this.industryState()]);
  readonly claims = computed(() => readClaims(this.tokenState()));
  readonly isAuthenticated = computed(() => this.claims() !== null);
  /** UserInformationId of the signed-in user (lp_uid claim). */
  readonly userId = computed(() => positiveInt(this.claims()?.[USER_ID_CLAIM]));
  /** Company the user belongs to (CompanyId claim). */
  readonly companyId = computed(() => positiveInt(this.claims()?.[COMPANY_ID_CLAIM]));
  /** Account email, used by the ListenPay activity endpoint (account/{email}/activity). */
  readonly email = computed(() => {
    const claims = this.claims();
    for (const key of EMAIL_CLAIMS) {
      const value = claims?.[key];
      if (typeof value === 'string' && value.trim()) return value.trim();
    }
    return null;
  });
  /** Display name from the JWT when the API includes one. */
  readonly displayName = computed(() => {
    const claims = this.claims();
    const name = claims?.['name'] ?? claims?.['unique_name'] ?? claims?.['email'];
    return typeof name === 'string' && name.trim() ? name.trim() : null;
  });

  constructor() {
    this.restore();
  }

  /**
   * Reads the hand-off from the Dashboard Suite — `?industry=<id>` and `#access_token=<jwt>` —
   * then removes both from the address bar so the token is not left in history or bookmarks.
   * Runs as an app initializer, before the router reads the URL.
   */
  consumeHandoff(): HandoffResult {
    const url = new URL(window.location.href);
    const fragment = new URLSearchParams(url.hash.replace(/^#/, ''));
    const industryParam = url.searchParams.get('industry');
    const industry = isIndustryId(industryParam) ? industryParam : null;
    const hasToken = fragment.has('access_token');
    const token = fragment.get('access_token');

    if (industry) this.setIndustry(industry);
    const tokenReceived = hasToken && readClaims(token) !== null;
    if (tokenReceived) this.setToken(token!);

    if (hasToken || url.searchParams.has('industry')) {
      fragment.delete('access_token');
      url.searchParams.delete('industry');
      url.hash = fragment.toString();
      window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
    }
    return { industry, tokenReceived };
  }

  /** The JWT for an API call, or null once it has expired (which also clears it). */
  bearerToken(): string | null {
    const token = this.tokenState();
    if (token && !readClaims(token)) {
      this.clearToken();
      return null;
    }
    return token;
  }

  setIndustry(industry: IndustryId): void {
    this.industryState.set(industry);
    this.write(INDUSTRY_KEY, industry);
  }

  /** Clears the hand-off and returns to the Dashboard Suite to choose an industry again. */
  signOut(): void {
    this.clearToken();
    this.remove(INDUSTRY_KEY);
    window.location.assign(`${APP_SETTINGS.suiteUrl}/industries`);
  }

  private setToken(token: string): void {
    this.tokenState.set(token);
    this.write(TOKEN_KEY, token);
  }

  private clearToken(): void {
    this.tokenState.set(null);
    this.remove(TOKEN_KEY);
  }

  private restore(): void {
    const industry = this.read(INDUSTRY_KEY);
    if (isIndustryId(industry)) this.industryState.set(industry);
    const token = this.read(TOKEN_KEY);
    if (readClaims(token)) this.tokenState.set(token);
    else if (token) this.remove(TOKEN_KEY);
  }

  private read(key: string): string | null {
    try {
      return sessionStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private write(key: string, value: string): void {
    try {
      sessionStorage.setItem(key, value);
    } catch {
      // Storage unavailable — the session still works until the page reloads.
    }
  }

  private remove(key: string): void {
    try {
      sessionStorage.removeItem(key);
    } catch {
      // Nothing to clear.
    }
  }
}
