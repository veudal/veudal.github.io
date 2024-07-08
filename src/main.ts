import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err)).then(() => {
    let theme = localStorage.getItem('theme')!;

    document.getElementById('body')!.className = theme;

    setTimeout(() => {
      document.documentElement.classList.remove('no-transition');
    }, 0);
});
