/* ListenPay Programs: video viewing frame (ListenPay2026 yt-player) — a modal YouTube player that reports play, pause and completion. */
import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { PlaybackEvent, YouTubeVideo } from '../../listenpay/listenpay.models';
import { YT_STATE, YouTubeIframeApiService, YtPlayer } from '../../listenpay/youtube-iframe-api.service';

@Component({
  selector: 'app-video-player-modal',
  templateUrl: './video-player-modal.component.html',
  host: { '(document:keydown.escape)': 'close()' },
})
export class VideoPlayerModal implements AfterViewInit, OnDestroy {
  private readonly youTube = inject(YouTubeIframeApiService);
  private readonly zone = inject(NgZone);

  readonly video = input.required<YouTubeVideo>();
  readonly playStarted = output<PlaybackEvent>();
  readonly playStopped = output<PlaybackEvent>();
  readonly videoComplete = output<PlaybackEvent>();
  readonly closed = output<void>();

  private readonly playerHost = viewChild.required<ElementRef<HTMLElement>>('playerHost');
  private readonly closeButton = viewChild.required<ElementRef<HTMLButtonElement>>('closeButton');
  protected readonly status = signal<'loading' | 'ready' | 'error'>('loading');

  private player: YtPlayer | null = null;
  private closing = false;
  private destroyed = false;

  async ngAfterViewInit(): Promise<void> {
    this.closeButton().nativeElement.focus();
    try {
      const YT = await this.youTube.load();
      if (this.destroyed) return;
      this.player = new YT.Player(this.playerHost().nativeElement, {
        videoId: this.video().videoId,
        width: '100%',
        height: '100%',
        playerVars: { autoplay: 1, rel: 0, playsinline: 1, modestbranding: 1 },
        events: {
          onReady: () => this.zone.run(() => this.status.set('ready')),
          onStateChange: (event) => this.zone.run(() => this.onStateChange(event.data)),
          onError: () => this.zone.run(() => this.status.set('error')),
        },
      });
    } catch {
      this.status.set('error');
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.player?.destroy();
    this.player = null;
  }

  /** Closing while the video plays records it as stopped, like pausing does. */
  protected close(): void {
    if (this.closing) return;
    this.closing = true;
    if (this.player?.getPlayerState() === YT_STATE.PLAYING) {
      this.playStopped.emit(this.snapshot('pause'));
      this.player.pauseVideo();
    }
    this.closed.emit();
  }

  private onStateChange(state: number): void {
    if (this.closing || !this.player) return;
    if (state === YT_STATE.PLAYING) this.playStarted.emit(this.snapshot('play'));
    else if (state === YT_STATE.PAUSED) this.playStopped.emit(this.snapshot('pause'));
    else if (state === YT_STATE.ENDED) this.videoComplete.emit(this.snapshot('complete'));
  }

  private snapshot(state: PlaybackEvent['state']): PlaybackEvent {
    const player = this.player;
    return {
      state,
      position: player?.getCurrentTime() ?? 0,
      duration: player?.getDuration() ?? 0,
      title: player?.getVideoData?.()?.title || this.video().title,
    };
  }
}
