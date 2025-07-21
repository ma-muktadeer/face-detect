import { Routes } from '@angular/router';
import { FaceDetect } from './face-detect/face-detect';
import { MainLayout } from './layout/main-layout/main-layout';
import { Home } from './home/home';

export const routes: Routes = [
  { path: '', loadComponent: () => Home, pathMatch: 'full'},
  { path: 'face-api', loadComponent: () => FaceDetect, pathMatch: 'full'},
  { path: '**', redirectTo: ''},
];
