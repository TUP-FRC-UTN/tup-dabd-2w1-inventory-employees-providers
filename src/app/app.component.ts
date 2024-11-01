import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { UsersNavbarComponent } from './common-components/users-navbar/users-navbar.component';
import { UsersSideButtonComponent } from './common-components/users-side-button/users-side-button.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, UsersNavbarComponent,UsersSideButtonComponent],
  providers: [],

  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'inventory-employees-suppliers';
}
