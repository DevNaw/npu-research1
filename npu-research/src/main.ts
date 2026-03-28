import { platformBrowser } from '@angular/platform-browser';
import { AppModule } from './app/app.module';
import { provideAnimations } from '@angular/platform-browser/animations';

platformBrowser().bootstrapModule(AppModule, {
  ngZoneEventCoalescing: true,
  providers: [provideAnimations()],
})
  .catch(err => console.error(err));
