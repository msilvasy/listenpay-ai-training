/* ListenPay Programs: videos under a child category (ListenPay2026 hw-category-detail) with watch progress and the video modal. */
import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { Subscription } from 'rxjs';
import { ListenPayContentService } from '../../listenpay/listenpay-content.service';
import { PlaybackEvent, YouTubeVideo } from '../../listenpay/listenpay.models';
import { VideoPlayerModal } from '../video-player-modal/video-player-modal.component';

@Component({
  selector: 'app-category-videos',
  imports: [VideoPlayerModal],
  templateUrl: './category-videos.component.html',
})
export class CategoryVideos {
  private readonly content = inject(ListenPayContentService);

  readonly categoryId = input.required<number>();
  readonly categoryTitle = input<string>('');
  readonly iconSrc = input<string | null>(null);

  protected readonly videos = signal<YouTubeVideo[] | null>(null);
  protected readonly loadError = signal(false);
  protected readonly selected = signal<YouTubeVideo | null>(null);
  protected readonly averageProgress = computed(() => {
    const videos = this.videos();
    if (!videos?.length) return 0;
    return Math.round(videos.reduce((sum, v) => sum + this.percent(v), 0) / videos.length);
  });

  private loadSub?: Subscription;

  constructor() {
    effect((onCleanup) => {
      const id = this.categoryId();
      untracked(() => this.load(id, false));
      onCleanup(() => this.loadSub?.unsubscribe());
    });
  }

  protected retry(): void {
    this.load(this.categoryId(), true);
  }

  protected open(video: YouTubeVideo): void {
    this.selected.set(video);
  }

  protected close(): void {
    this.selected.set(null);
  }

  /** Same tracking as ListenPay2026: an activity row plus a watch-time update, on play, pause and end. */
  protected onPlayback(event: PlaybackEvent): void {
    const video = this.selected();
    if (!video) return;
    this.content.recordActivity({
      trackId: video.videoId,
      trackName: event.title,
      duration: event.position,
      nextMediaPlayed: event.state === 'play' ? video.videoId : undefined,
      youTubeVideoId: video.id,
      categoryId: this.categoryId(),
    });
    this.content.saveWatchTime(video.id, event.position, event.duration).subscribe({
      next: () => this.refreshStatus(),
      error: (error) => console.warn('Watch time was not saved', error),
    });
  }

  protected percent(video: YouTubeVideo): number {
    return Math.min(100, Math.max(0, Math.round(video.watchTimeStatus || 0)));
  }

  protected statusLabel(video: YouTubeVideo): string {
    const pct = this.percent(video);
    if (pct >= 100) return '✓ Complete';
    if (pct <= 0) return 'Not Started';
    return `${pct}% In Progress`;
  }

  protected formatDate(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-US');
  }

  private load(categoryId: number, fromServer: boolean): void {
    this.loadSub?.unsubscribe();
    this.videos.set(null);
    this.loadError.set(false);
    this.loadSub = this.content.getVideosForCategory(categoryId, fromServer).subscribe({
      next: (videos) => this.videos.set(videos),
      error: () => {
        this.loadError.set(true);
        this.videos.set([]);
      },
    });
  }

  /** Re-reads progress from the server without blanking the list. */
  private refreshStatus(): void {
    this.content.getVideosForCategory(this.categoryId(), true).subscribe({
      next: (videos) => this.videos.set(videos),
      error: () => undefined,
    });
  }
}
