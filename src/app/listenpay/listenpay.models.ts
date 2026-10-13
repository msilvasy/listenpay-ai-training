/* ListenPay Programs: contracts for the ListenPay .NET API category, video and activity endpoints (same shapes ListenPay2026 uses). */

/** Envelope every ListenPay API action returns (ResponseModel<T>). */
export interface ApiEnvelope<T> {
  responseTime?: string;
  responseCode: ApiResponseCode;
  responseMessage?: string;
  dataSet: T;
}

export enum ApiResponseCode {
  OK = 1,
  Error = 2,
  NoDataFound = 4,
  Unauthorized = 401,
}

/** YTCategoryByComapnymodel: a parent category, or one of its child categories. */
export interface YoutubeCategory {
  youTubeVideoCategoryId: number;
  companyRelatedCategoryId?: number;
  title: string;
  description?: string | null;
  /** Relative to the front end, e.g. "assets/images/icon-w-heart.png". */
  iconURL?: string | null;
  titleImageURL?: string | null;
  backgroundImageURL?: string | null;
  spotifyPlaylistId?: string | null;
  childCategories?: YoutubeCategory[] | null;
}

/** YouTubeVideoModel, with the signed-in user's watch progress. */
export interface YouTubeVideo {
  id: number;
  companyId?: number;
  /** YouTube video id passed to the player. */
  videoId: string;
  title: string;
  description?: string | null;
  thumbnailURL?: string | null;
  videoURL?: string | null;
  /** Percent watched, 0–100. */
  watchTimeStatus: number;
  dateCreated: string;
  relatedCategories: { youTubeVideoCategoryId: number; title: string; description?: string | null }[];
}

/** Models.Activity posted to account/{email}/activity. */
export interface ListenPayActivity {
  trackId: string;
  trackName: string;
  duration: number;
  activityType: string;
  nextMediaPlayed?: string;
  companyId: number;
  userInformationId: number;
  categoryId: number;
  youTubeVideoId: number;
  points?: number;
}

/** Player state reported by the video modal on play, pause and end. */
export interface PlaybackEvent {
  state: 'play' | 'pause' | 'complete';
  /** Seconds into the video. */
  position: number;
  /** Video length in seconds. */
  duration: number;
  title: string;
}

export const YOUTUBE_ACTIVITY_TYPE = 'YouTube';
