import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { DComponent } from './d/d.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "d/:guid", component: DComponent}
];
