import { Routes } from '@angular/router';
import { FaceDetect } from './face-detect/face-detect';

export const routes: Routes = [
  { path: '', loadComponent: () => FaceDetect, pathMatch: 'full'},
];
