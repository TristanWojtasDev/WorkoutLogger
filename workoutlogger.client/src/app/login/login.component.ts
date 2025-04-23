/**
 * Main component handling login and workout management UI.
 * Flow:
 * 1. Initially displays a login form (isLoggedIn = false).
 * 2. On login submission, calls AuthService to authenticate.
 * 3. After successful login, switches to workout section (isLoggedIn = true), fetching and displaying workouts.
 */
import { Component } from '@angular/core'; //Decorator from Angular to define a component
import { AuthService } from '../auth.service'; // Service for authentication and workout API calls
import { Workout } from '../workout'; // Interface for workout data structure
import { FormsModule } from '@angular/forms'; // Provides ngModel for two-way data binding in forms (used for login and workout creation forms)
import { CommonModule } from '@angular/common'; // Provides common Angular directives like *ngIf, *ngFor, and pipes like date


@Component({
  selector: 'app-login', // Defines the HTML tag <app-login> to use this component (used in app.component.ts)
  standalone: true, // Marks the component as standalone (no NgModule required)
  imports: [FormsModule, CommonModule], // Directly imports dependencies for the component
  template: `
    <div *ngIf="!isLoggedIn">
      <div class="form-container">
        <h2>Login</h2>
        <form (ngSubmit)="onSubmit()">
          <input [(ngModel)]="username" name="username" placeholder="Username" required />
          <input [(ngModel)]="password" name="password" type="password" placeholder="Password" required />
          <button type="submit">Login</button>
        </form>
      </div>
      <p>{{ message }}</p>
    </div>

    <div *ngIf="isLoggedIn">
      <h2>Workout Logger</h2>
      <button (click)="logout()">Logout</button>

      <div class="form-container">
        <h3>Create Workout</h3>
        <form (ngSubmit)="createWorkout()">
          <input [(ngModel)]="newWorkout.exercise" name="exercise" placeholder="Exercise" required />
          <input [(ngModel)]="newWorkout.sets" name="sets" type="number" placeholder="Sets" required />
          <input [(ngModel)]="newWorkout.reps" name="reps" type="number" placeholder="Reps" required />
          <input [(ngModel)]="newWorkout.weight" name="weight" type="number" placeholder="Weight (lbs)" required />
          <button type="submit">Add Workout</button>
        </form>
      </div>

      <div *ngIf="editingWorkout" class="form-container">
        <h3>Edit Workout</h3>
        <form (ngSubmit)="updateWorkout()">
          <input [(ngModel)]="editingWorkout.exercise" name="exercise" placeholder="Exercise" required />
          <input [(ngModel)]="editingWorkout.sets" name="sets" type="number" placeholder="Sets" required />
          <input [(ngModel)]="editingWorkout.reps" name="reps" type="number" placeholder="Reps" required />
          <input [(ngModel)]="editingWorkout.weight" name="weight" type="number" placeholder="Weight (lbs)" required />
          <button type="submit">Save</button>
          <button type="button" (click)="cancelEdit()">Cancel</button>
        </form>
      </div>

      <h3>Your Workouts</h3>
      <button (click)="getWorkouts()">Refresh Workouts</button>
      <ul *ngIf="workouts.length > 0; else noWorkouts">
        <li *ngFor="let workout of workouts">
          {{ workout.date | date:'medium' }} - {{ workout.exercise }}: {{ workout.sets }} sets, {{ workout.reps }} reps, {{ workout.weight }} lbs
          <button (click)="startEdit(workout)">Edit</button>
          <button (click)="deleteWorkout(workout.id)">Delete</button>
        </li>
      </ul>
      <ng-template #noWorkouts>
        <p>No workouts logged yet.</p>
      </ng-template>
      <p>{{ message }}</p>
    </div>
  `,
  styles: [`
    div { margin: 20px; }
    h2, h3 { color: #333; }
    form { display: flex; flex-direction: column; gap: 10px; max-width: 300px; }
    .form-container {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    input { padding: 5px; }
    button { padding: 5px 10px; cursor: pointer; margin-right: 5px; }
    ul { list-style: none; padding: 0; }
    li { padding: 5px 0; }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  message = '';
  isLoggedIn = false;
  workouts: Workout[] = [];
  newWorkout: Partial<Workout> = { exercise: '', sets: null, reps: null, weight: null };
  editingWorkout: Workout | null = null;


  /**
   * Initializes the component, checking the login state.
   * Flow: If a token exists, sets isLoggedIn to true and fetches workouts.
   * @param authService Service for authentication and workout API calls.
   */
  constructor(private authService: AuthService) { // Injects AuthService to handle authentication and API calls.
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.getWorkouts();
    }
  }

  /**
   * Handles login form submission.
   * Flow: Calls AuthService to authenticate, updates isLoggedIn, and fetches workouts.
   */

  onSubmit() {
    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this.message = 'Login successful!';
        this.isLoggedIn = true;
        this.getWorkouts();
      },
      error: (err) => this.message = 'Login failed: ' + err.message
    });
  }

  /**
   * Handles logout.
   * Flow: Clears token, resets UI to login form.
   */
  logout() {
    this.authService.logout();
    this.isLoggedIn = false;
    this.workouts = [];
    this.message = 'Logged out.';
  }

  /**
   * Fetches workouts for the logged-in user.
   * Flow: Calls AuthService to get workouts, updates UI with the list.
   */
  getWorkouts() {
    this.authService.getWorkouts().subscribe({
      next: (response) => {
        this.workouts = response;
        this.message = 'Workouts fetched successfully.';
      },
      error: (err) => this.message = 'Failed to get workouts: ' + err.message
    });
  }


  /**
   * Handles workout creation form submission.
   * Flow: Calls AuthService to create a workout, refreshes the workout list.
   */
  createWorkout() {
    const workoutToCreate = {
      exercise: this.newWorkout.exercise,
      sets: Number(this.newWorkout.sets ?? 0), // Convert null to 0 if not provided
      reps: Number(this.newWorkout.reps ?? 0), // Convert null to 0 if not provided
      weight: Number(this.newWorkout.weight ?? 0) // Convert null to 0 if not provided
    };

    // Optional: Add client-side validation to ensure required fields are filled
    if (!workoutToCreate.exercise || workoutToCreate.sets <= 0 || workoutToCreate.reps <= 0) {
      this.message = 'Please fill in all required fields with valid values.';
      return;
    }

    this.authService.createWorkout(workoutToCreate).subscribe({
      next: () => {
        this.message = 'Workout added successfully!';
        this.newWorkout = { exercise: '', sets: null, reps: null, weight: null }; // Reset to null
        this.getWorkouts();
      },
      error: (err) => {
        this.message = 'Failed to add workout: ' + err.message;
        console.error('Error details:', err);
      }
    });
  }


  /**
   * Initiates editing of a workout.
   * Flow: Copies the selected workout into editingWorkout to populate the edit form.
   * @param workout The workout to edit.
   */
  startEdit(workout: Workout) {
    this.editingWorkout = { ...workout };
  }

  /**
   * Cancels the current edit operation.
   * Flow: Clears the editingWorkout to hide the edit form.
   */
  cancelEdit() {
    this.editingWorkout = null;
    this.message = 'Edit cancelled.';
  }

  /**
   * Updates the currently edited workout.
   * Flow: Calls AuthService to update the workout, refreshes the workout list, and clears the edit form.
   */
  updateWorkout() {
    if (this.editingWorkout) {
      const workoutToUpdate = {
        id: this.editingWorkout.id,
        userId: this.editingWorkout.userId,
        date: this.editingWorkout.date,
        exercise: this.editingWorkout.exercise,
        sets: Number(this.editingWorkout.sets),
        reps: Number(this.editingWorkout.reps),
        weight: Number(this.editingWorkout.weight)
      };

      this.authService.updateWorkout(this.editingWorkout.id, workoutToUpdate).subscribe({
        next: () => {
          this.message = 'Workout updated successfully!';
          this.editingWorkout = null;
          this.getWorkouts();
        },
        error: (err) => this.message = 'Failed to update workout: ' + err.message
      });
    }
  }

  /**
   * Deletes a workout.
   * Flow: Calls AuthService to delete the workout and refreshes the workout list.
   * @param id The ID of the workout to delete, if available.
   */
  deleteWorkout(id: number | undefined) {
    if (id === undefined) {
      this.message = 'Cannot delete workout: ID is missing.';
      return;
    }
    this.authService.deleteWorkout(id).subscribe({
      next: () => {
        this.message = 'Workout deleted successfully!';
        this.getWorkouts();
      },
      error: (err) => this.message = 'Failed to delete workout: ' + err.message
    });
  }
}
