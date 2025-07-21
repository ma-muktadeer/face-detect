import { Component, signal } from '@angular/core';
import { MainLayout } from "./layout/main-layout/main-layout";
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [MainLayout],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('face-detect');
}
