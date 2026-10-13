/* ListenPay Programs: loads the YouTube IFrame Player API once and hands out its YT namespace. */
import { Injectable } from '@angular/core';
import { APP_SETTINGS } from '../app.settings';

/** The parts of the YouTube IFrame API the video modal uses. */
export interface YtPlayer {
  playVideo(): void;
  pauseVideo(): void;
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  getVideoData?(): { title?: string };
  destroy(): void;
}

export interface YtPlayerOptions {
  videoId: string;
  width?: string | number;
  height?: string | number;
  playerVars?: Record<string, string | number>;
  events?: {
    onReady?: (event: { target: YtPlayer }) => void;
    onStateChange?: (event: { data: number; target: YtPlayer }) => void;
    onError?: (event: { data: number }) => void;
  };
}

export interface YtNamespace {
  Player: new (element: HTMLElement, options: YtPlayerOptions) => YtPlayer;
}

/** YT.PlayerState values. */
export const YT_STATE = { ENDED: 0, PLAYING: 1, PAUSED: 2 } as const;

type YtWindow = Window & { YT?: Partial<YtNamespace>; onYouTubeIframeAPIReady?: () => void };

@Injectable({ providedIn: 'root' })
export class YouTubeIframeApiService {
  private loading: Promise<YtNamespace> | null = null;

  load(): Promise<YtNamespace> {
    const w = window as YtWindow;
    if (w.YT?.Player) return Promise.resolve(w.YT as YtNamespace);
    this.loading ??= new Promise<YtNamespace>((resolve, reject) => {
      const previous = w.onYouTubeIframeAPIReady;
      w.onYouTubeIframeAPIReady = () => {
        previous?.();
        resolve(w.YT as YtNamespace);
      };
      const script = document.createElement('script');
      script.src = APP_SETTINGS.youTubeIframeApiUrl;
      script.async = true;
      script.onerror = () => {
        this.loading = null;
        script.remove();
        reject(new Error('The YouTube player could not be loaded.'));
      };
      document.head.appendChild(script);
    });
    return this.loading;
  }
}
