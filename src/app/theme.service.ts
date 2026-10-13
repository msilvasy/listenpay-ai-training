/* ListenPay Programs: applies the theme of the industry selected in the Dashboard Suite and remembers whether it is switched on. */
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { SessionService } from './auth/session.service';
import { INDUSTRIES, IndustryTheme } from './industry';

export type ThemeId = 'default' | IndustryTheme;

/** Stores 'default' when the user switched the industry theme off; anything else means on. */
const STORAGE_KEY = 'listenpay-theme';
const DEFAULT_CHROME_COLOR = '#0a2a4a';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly session = inject(SessionService);
  private readonly enabled = signal(this.readEnabled());

  readonly industryTheme = computed<IndustryTheme>(() => this.session.profile().theme);
  readonly theme = computed<ThemeId>(() => (this.enabled() ? this.industryTheme() : 'default'));
  readonly isIndustryTheme = computed(() => this.theme() !== 'default');

  constructor() {
    this.applyTheme(this.theme());
    effect(() => this.applyTheme(this.theme()));
  }

  toggle(): void {
    this.setEnabled(!this.enabled());
  }

  setEnabled(enabled: boolean): void {
    this.enabled.set(enabled);
    try {
      localStorage.setItem(STORAGE_KEY, enabled ? this.industryTheme() : 'default');
    } catch {
      // localStorage unavailable (e.g. private browsing) — theme still applies for this session.
    }
  }

  private applyTheme(theme: ThemeId): void {
    const root = document.documentElement;
    if (theme === 'default') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);

    const chrome = theme === 'default' ? DEFAULT_CHROME_COLOR : INDUSTRIES[this.session.industry()].chromeColor;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', chrome);
  }

  private readEnabled(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEY) !== 'default';
    } catch {
      return true;
    }
  }
}
