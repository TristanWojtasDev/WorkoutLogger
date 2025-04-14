import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    /*private apiUrl = '/api/auth'; // Relative path, proxied to 7090*/
    private apiUrl = 'https://localhost:7090/api/auth'; // Hardcode for now

    constructor(private http: HttpClient) { }

    login(username: string, password: string) {
        return this.http.post<any>(`${this.apiUrl}/login`, { username, password }).pipe(
            tap(response => {
                localStorage.setItem('token', response.token);
                const decoded = jwtDecode<any>(response.token);
                console.log('Logged in user:', decoded.sub); // e.g., "testuser"
            })
        );
    }

    logout() {
        localStorage.removeItem('token');
    }

    isLoggedIn(): boolean {
        return !!localStorage.getItem('token');
    }
}
