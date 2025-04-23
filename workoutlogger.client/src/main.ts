/**
 * Bootstraps the Angular application by loading the root module (AppModule).
 * Flow: Starts the app and triggers AppModule to initialize the root component.
 */
import { platformBrowser } from '@angular/platform-browser';
import { AppModule } from './app/app.module';

platformBrowser().bootstrapModule(AppModule, {
  ngZoneEventCoalescing: true,
})
  .catch(err => console.error(err));
