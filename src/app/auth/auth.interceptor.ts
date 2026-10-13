/* ListenPay Programs: attaches the handed-over JWT to ListenPay API calls only, never to third-party hosts. */
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { APP_SETTINGS } from '../app.settings';
import { SessionService } from './session.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith(APP_SETTINGS.apiUrl)) return next(request);
  const token = inject(SessionService).bearerToken();
  return next(token ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request);
};
