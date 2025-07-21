import { CommonModule, NgClass } from '@angular/common';
import { Component, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterModule, NgClass],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  isMenuCollapsed = signal<boolean>(true);

  constructor(private router: Router) {
    this.router.events.subscribe(() => {
      this.collapseMenu();
    });
  }

  toggleMenu() {
    this.isMenuCollapsed.update(value => !value);
  }

  collapseMenu() {
    this.isMenuCollapsed.update(() => true);
  }

}
