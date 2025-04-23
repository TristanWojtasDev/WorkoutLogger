/**
 * Service for handling authentication and workout API calls.
 * Flow: Provides methods to login, logout, fetch workouts, and create workouts.
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://localhost:7090/api/auth'; // Hardcoded for now
  private workoutsUrl = 'https://localhost:7090/api/workouts'; // Hardcoded for now


  /**
   * Initializes the service with HTTP client dependency.
   * @param http HTTP client for making API requests.
   */
  constructor(private http: HttpClient) { }

  /**
   * Authenticates a user via the backend API.
   * Flow: Sends POST to /api/auth/login, stores JWT token, logs user info.
   * @param username The user's username.
   * @param password The user's password.
   * @returns An observable with the login response (JWT token).
   */
  login(username: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/login`, { username, password }).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        const decoded = jwtDecode<any>(response.token);
        console.log('Logged in user:', decoded.sub);
      })
    );
  }

  /**
   * Clears the authentication token.
   * Flow: Removes token from local storage.
   */
  logout() {
    localStorage.removeItem('token');
  }

  /**
   * Checks if the user is logged in.
   * Flow: Returns true if a token exists.
   * @returns True if the user is logged in, false otherwise.
   */
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  /**
   * Fetches workouts from the backend API.
   * Flow: Sends GET to /api/workouts, returns workout list.
   * @returns An observable with the list of workouts.
   */
  getWorkouts() {
    return this.http.get<any[]>(this.workoutsUrl);
  }

  /**
   * Creates a new workout via the backend API.
   * Flow: Sends POST to /api/workouts, returns created workout.
   * @param workout The workout data to create.
   * @returns An observable with the created workout.
   */
  createWorkout(workout: any) {
    return this.http.post<any>(this.workoutsUrl, workout);
  }
}
