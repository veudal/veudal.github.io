import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err)).then(() => {
    let theme = localStorage.getItem('theme')!;

    document.body.className = theme;

    setTimeout(() => {
      document.documentElement.classList.remove('no-transition');
    }, 0);
  });
