/**
 * HTTP interceptor to add JWT token to API requests.
 * Flow: Automatically adds Authorization header with token to outgoing requests.
 */
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  /**
   * Intercepts HTTP requests to add JWT token to headers.
   * @param request The outgoing HTTP request.
   * @param next The next handler in the HTTP pipeline.
   * @returns An observable of the HTTP event.
   */
  intercept(request: HttpRequest<any>, next: HttpHandler) {
    const token = localStorage.getItem('token');
    if (token) {
      request = request.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }
    return next.handle(request);
  }
}
