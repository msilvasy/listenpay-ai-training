/* ListenPay Programs: endpoints shared with the ListenPay AI Dashboard Suite. Adjust per environment. */
export const APP_SETTINGS = {
  /** ListenPay AI Dashboard Suite; sign-out returns here to pick an industry again. */
  suiteUrl: 'http://localhost:4200',
  /** ListenPay .NET API. The JWT is attached only to requests under this base URL. */
  apiUrl: 'https://localhost:5001/api/',
  /**
   * Base for the category images the API returns as relative paths ("assets/images/<file>").
   * Empty resolves them against this app, as ListenPay2026 did; set it to another host
   * (e.g. 'https://listenpay.app/') if the images are served from there.
   */
  categoryAssetBaseUrl: '',
  /** YouTube IFrame Player API used by the video modal. */
  youTubeIframeApiUrl: 'https://www.youtube.com/iframe_api',
} as const;
