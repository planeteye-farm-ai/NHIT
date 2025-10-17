import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token'); // Retrieve token from localStorage or session storage
    if (token) {
      return true;
    } else {
      this.router.navigate(['/auth/login']); // Redirect to login page if token is not present
      return false;
    }
  }
}