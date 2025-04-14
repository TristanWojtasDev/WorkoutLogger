import { Component } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: false,
  template: `
    <form (ngSubmit)="onSubmit()">
      <input [(ngModel)]="username" name="username" placeholder="Username" required />
      <input [(ngModel)]="password" name="password" type="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
    <p>{{ message }}</p>
  `
})
export class LoginComponent {
    username = '';
    password = '';
    message = '';

    constructor(private authService: AuthService) { }

    onSubmit() {
        this.authService.login(this.username, this.password).subscribe({
            next: () => this.message = 'Login successful!',
            error: (err) => this.message = 'Login failed: ' + err.message
        });
    }
}
