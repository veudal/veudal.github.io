import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { DComponent } from './d/d.component';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';

export const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "d/:guid", component: DComponent },
  { path: "about", component: AboutComponent },
  { path: '**', redirectTo: '' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }


