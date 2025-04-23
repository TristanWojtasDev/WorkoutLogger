/**
 * Main component handling login, signup, guest login, and workout management UI.
 * Flow:
 * 1. Initially displays a login or signup form (isLoggedIn = false).
 * 2. On login/signup/guest login submission, calls AuthService to authenticate or register.
 * 3. After successful login/signup, switches to workout section (isLoggedIn = true), fetching and displaying workouts.
 */
import { Component } from '@angular/core'; // Decorator from Angular to define a component
import { AuthService } from '../auth.service'; // Service for authentication and workout API calls
import { Workout, WorkoutType } from '../workout'; // Interface for workout data structure
import { FormsModule } from '@angular/forms'; // Provides ngModel for two-way data binding in forms (used for login and workout creation forms)
import { CommonModule } from '@angular/common'; // Provides common Angular directives like *ngIf, *ngFor, and pipes like date

@Component({
  selector: 'app-login', // Defines the HTML tag <app-login> to use this component (used in app.component.ts)
  standalone: true, // Marks the component as standalone (no NgModule required)
  imports: [FormsModule, CommonModule], // Directly imports dependencies for the component
  template: `
    <div *ngIf="!isLoggedIn">
      <div class="form-container">
        <h2>{{ showSignup ? 'Sign Up' : 'Login' }}</h2>
        <!-- Login Form -->
        <form *ngIf="!showSignup" (ngSubmit)="onSubmit()">
          <input [(ngModel)]="username" name="username" placeholder="Username" required />
          <input [(ngModel)]="password" name="password" type="password" placeholder="Password" required />
          <button type="submit">Login</button>
        </form>
        <!-- Signup Form -->
        <form *ngIf="showSignup" (ngSubmit)="onRegister()">
          <input [(ngModel)]="username" name="username" placeholder="Username" required />
          <input [(ngModel)]="password" name="password" type="password" placeholder="Password" required />
          <button type="submit">Sign Up</button>
        </form>
        <button (click)="loginAsGuest()">Login as Guest</button>
        <button (click)="toggleSignup()">{{ showSignup ? 'Switch to Login' : 'Switch to Sign Up' }}</button>
      </div>
      <div class="form-container">
        <p>{{ message }}</p>
      </div>
    </div>

    <div *ngIf="isLoggedIn">
      <h2>Workout Logger</h2>
      <button (click)="logout()">Logout</button>

      <!-- Create Workout Form -->
      <div class="form-container">
        <h3>Add Workout</h3>
        <form (ngSubmit)="createWorkout()">
          <input [(ngModel)]="newWorkout.exercise" name="exercise" placeholder="Exercise" required />
          <input [(ngModel)]="newWorkout.sets" name="sets" type="number" placeholder="Sets" required />
          <input [(ngModel)]="newWorkout.reps" name="reps" type="number" placeholder="Reps" required />
          <input [(ngModel)]="newWorkout.weight" name="weight" type="number" step="0.01" placeholder="Weight (lbs)" required />
          <button type="submit">Add Workout</button>
        </form>
      </div>

      <!-- Create Cardio Form -->
      <div class="form-container">
        <h3>Add Cardio</h3>
        <form (ngSubmit)="createCardio()">
          <input [(ngModel)]="newCardio.exercise" name="exercise" placeholder="Exercise" required />
          <input [(ngModel)]="newCardio.miles" name="miles" type="number" step="0.01" placeholder="Miles" required />
          <input [(ngModel)]="newCardio.time" name="time" type="text" placeholder="Time (HH:mm:ss)" required />
          <button type="submit">Add Cardio</button>
        </form>
      </div>

      <!-- Create Weigh-In Form -->
      <div class="form-container">
        <h3>Add Weigh-In</h3>
        <form (ngSubmit)="createWeighIn()">
          <input [(ngModel)]="newWeighIn.weight" name="weight" type="number" step="0.01" placeholder="Weight (lbs)" required />
          <button type="submit">Add Weigh-In</button>
        </form>
      </div>

      <!-- Edit Form -->
      <div *ngIf="editingRecord" class="form-container">
        <h3>Edit Record</h3>
        <form (ngSubmit)="updateRecord()">
          <div *ngIf="editingRecord.type === 'Workout'">
            <input [(ngModel)]="editingRecord.exercise" name="exercise" placeholder="Exercise" required />
            <input [(ngModel)]="editingRecord.sets" name="sets" type="number" placeholder="Sets" required />
            <input [(ngModel)]="editingRecord.reps" name="reps" type="number" placeholder="Reps" required />
            <input [(ngModel)]="editingRecord.weight" name="weight" type="number" step="0.01" placeholder="Weight (lbs)" required />
          </div>
          <div *ngIf="editingRecord.type === 'Cardio'">
            <input [(ngModel)]="editingRecord.exercise" name="exercise" placeholder="Exercise" required />
            <input [(ngModel)]="editingRecord.miles" name="miles" type="number" step="0.01" placeholder="Miles" required />
            <input [(ngModel)]="editingRecord.time" name="time" type="text" placeholder="Time (HH:mm:ss)" required />
          </div>
          <div *ngIf="editingRecord.type === 'WeighIn'">
            <input [(ngModel)]="editingRecord.weight" name="weight" type="number" step="0.01" placeholder="Weight (lbs)" required />
          </div>
          <button type="submit">Save</button>
          <button type="button" (click)="cancelEdit()">Cancel</button>
        </form>
      </div>

      <!-- Records List -->
      <h3>Your Records</h3>
      <button (click)="getRecords()">Refresh Records</button>
      <ul *ngIf="records.length > 0; else noRecords">
        <li *ngFor="let record of records">
          <span *ngIf="record.type === 'Workout'">
            {{ record.date | date:'medium' }} - {{ record.exercise }}: {{ record.sets }} sets, {{ record.reps }} reps, {{ record.weight | number:'1.2-2' }} lbs
          </span>
          <span *ngIf="record.type === 'Cardio'">
            {{ record.date | date:'medium' }} - Cardio: {{ record.exercise }}, {{ record.miles | number:'1.2-2' }} miles, Time: {{ formatTime(record.time) }}
          </span>
          <span *ngIf="record.type === 'WeighIn'">
            {{ record.date | date:'medium' }} - Weigh-In: {{ record.weight | number:'1.2-2' }} lbs
          </span>
          <button (click)="startEdit(record)">Edit</button>
          <button (click)="deleteRecord(record.id)">Delete</button>
        </li>
      </ul>
      <ng-template #noRecords>
        <p>No records logged yet.</p>
      </ng-template>
      <div class="form-container">
        <p>{{ message }}</p>
      </div>
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
  showSignup = false; // Toggle between login and signup forms
  records: Workout[] = [];
  newWorkout: Partial<Workout> = { type: WorkoutType.Workout, exercise: '', sets: undefined, reps: undefined, weight: undefined };
  newCardio: Partial<Workout> = { type: WorkoutType.Cardio, exercise: '', miles: undefined, time: undefined };
  newWeighIn: Partial<Workout> = { type: WorkoutType.WeighIn, weight: undefined };
  editingRecord: Workout | null = null;

  /**
   * Initializes the component, checking the login state.
   * Flow: If a token exists, sets isLoggedIn to true and fetches workouts.
   * @param authService Service for authentication and workout API calls.
   */
  constructor(private authService: AuthService) { // Injects AuthService to handle authentication and API calls.
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      this.getRecords();
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
        this.getRecords();
      },
      error: (err) => this.message = 'Login failed: ' + err.message
    });
  }

  /**
   * Handles signup form submission.
   * Flow: Calls AuthService to register, updates isLoggedIn, and fetches workouts.
   */
  onRegister() {
    this.authService.register(this.username, this.password).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);
        this.message = 'Registration successful! Logged in.';
        this.isLoggedIn = true;
        this.getRecords();
      },
      error: (err) => this.message = 'Registration failed: ' + err.error
    });
  }

  /**
   * Handles guest login form submission.
   * Flow: Calls AuthService to authenticate, updates isLoggedIn, and fetches workouts.
   */
  loginAsGuest() {
    let guestId = localStorage.getItem('guestId');
    if (!guestId) {
      guestId = this.generateGuid();
      localStorage.setItem('guestId', guestId);
    }

    this.authService.guestLogin(guestId).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);
        this.isLoggedIn = true;
        this.message = 'Logged in as guest!';
        this.getRecords();
      },
      error: (err) => this.message = 'Guest login failed: ' + err.message
    });
  }

  /**
   * Generate guest login guid
   */
  generateGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Toggles between login and signup forms.
   * Flow: Switches the form display and resets input fields.
   */
  toggleSignup() {
    this.showSignup = !this.showSignup;
    this.username = '';
    this.password = '';
    this.message = '';
  }

  /**
   * Handles logout.
   * Flow: Clears token, resets UI to login form.
   */
  logout() {
    this.authService.logout();
    this.isLoggedIn = false;
    this.records = [];
    this.message = 'Logged out.';
  }

  /**
   * Fetches recent workouts, cardio, and weighins for the logged-in user.
   * Flow: Calls AuthService to get workouts, cardio, and weighins, updates UI with the list.
   */
  getRecords() {
    this.authService.getWorkouts().subscribe({
      next: (response) => {
        this.records = response;
        this.message = 'Records fetched successfully.';
      },
      error: (err) => this.message = 'Failed to get records: ' + err.message
    });
  }

  /**
   * Handles workout creation form submission.
   * Flow: Calls AuthService to create a workout, refreshes the workout list.
   */
  createWorkout() {
    const workoutToCreate = {
      type: WorkoutType.Workout,
      exercise: this.newWorkout.exercise,
      sets: Number(this.newWorkout.sets ?? 0),
      reps: Number(this.newWorkout.reps ?? 0),
      weight: Number(this.newWorkout.weight ?? 0)
    };

    if (!workoutToCreate.exercise || workoutToCreate.sets <= 0 || workoutToCreate.reps <= 0) {
      this.message = 'Please fill in all required fields with valid values.';
      return;
    }

    this.authService.createWorkout(workoutToCreate).subscribe({
      next: () => {
        this.message = 'Workout added successfully!';
        this.newWorkout = { type: WorkoutType.Workout, exercise: '', sets: undefined, reps: undefined, weight: undefined };
        this.getRecords();
      },
      error: (err) => {
        this.message = 'Failed to add workout: ' + err.message;
        console.error('Error details:', err);
      }
    });
  }

  /**
   * Handles cardio creation form submission.
   * Flow: Calls AuthService to create a cardio, refreshes the workout list.
   */
  createCardio() {
    const cardioToCreate = {
      type: WorkoutType.Cardio,
      exercise: this.newCardio.exercise,
      miles: Number(this.newCardio.miles ?? 0),
      time: this.newCardio.time // Backend expects HH:mm:ss format
    };

    if (!cardioToCreate.exercise || cardioToCreate.miles <= 0 || !cardioToCreate.time) {
      this.message = 'Please fill in all required fields with valid values.';
      return;
    }

    this.authService.createWorkout(cardioToCreate).subscribe({
      next: () => {
        this.message = 'Cardio added successfully!';
        this.newCardio = { type: WorkoutType.Cardio, exercise: '', miles: undefined, time: undefined };
        this.getRecords();
      },
      error: (err) => {
        this.message = 'Failed to add cardio: ' + err.message;
        console.error('Error details:', err);
      }
    });
  }

  /**
   * Handles weighin creation form submission.
   * Flow: Calls AuthService to create a weighin, refreshes the workout list.
   */
  createWeighIn() {
    const weighInToCreate = {
      type: WorkoutType.WeighIn,
      weight: Number(this.newWeighIn.weight ?? 0)
    };

    if (weighInToCreate.weight <= 0) {
      this.message = 'Please fill in a valid weight.';
      return;
    }

    this.authService.createWorkout(weighInToCreate).subscribe({
      next: () => {
        this.message = 'Weigh-In added successfully!';
        this.newWeighIn = { type: WorkoutType.WeighIn, weight: undefined };
        this.getRecords();
      },
      error: (err) => {
        this.message = 'Failed to add weigh-in: ' + err.message;
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
    this.editingRecord = { ...workout };
  }

  /**
   * Cancels the current edit operation.
   * Flow: Clears the editingWorkout to hide the edit form.
   */
  cancelEdit() {
    this.editingRecord = null;
    this.message = 'Edit cancelled.';
  }

  /**
   * Updates the currently edited workout.
   * Flow: Calls AuthService to update the workout, refreshes the workout list, and clears the edit form.
   */
  updateRecord() {
    if (this.editingRecord && this.editingRecord.id !== undefined) {
      const recordToUpdate: Partial<Workout> = {
        id: this.editingRecord.id,
        userId: this.editingRecord.userId,
        date: this.editingRecord.date,
        type: this.editingRecord.type
      };

      if (this.editingRecord.type === WorkoutType.Workout) {
        recordToUpdate.exercise = this.editingRecord.exercise;
        recordToUpdate.sets = Number(this.editingRecord.sets);
        recordToUpdate.reps = Number(this.editingRecord.reps);
        recordToUpdate.weight = Number(this.editingRecord.weight);
      } else if (this.editingRecord.type === WorkoutType.Cardio) {
        recordToUpdate.exercise = this.editingRecord.exercise;
        recordToUpdate.miles = Number(this.editingRecord.miles);
        recordToUpdate.time = this.editingRecord.time;
      } else if (this.editingRecord.type === WorkoutType.WeighIn) {
        recordToUpdate.weight = Number(this.editingRecord.weight);
      }

      this.authService.updateWorkout(this.editingRecord.id, recordToUpdate).subscribe({
        next: () => {
          this.message = 'Record updated successfully!';
          this.editingRecord = null;
          this.getRecords();
        },
        error: (err) => this.message = 'Failed to update record: ' + err.message
      });
    } else {
      this.message = 'Cannot update record: ID is missing.';
    }
  }

  /**
   * Deletes a record.
   * Flow: Calls AuthService to delete the record and refreshes the record list.
   * @param id The ID of the workout to delete, if available.
   */
  deleteRecord(id: number | undefined) {
    if (id === undefined) {
      this.message = 'Cannot delete record: ID is missing.';
      return;
    }
    this.authService.deleteWorkout(id).subscribe({
      next: () => {
        this.message = 'Record deleted successfully!';
        this.getRecords();
      },
      error: (err) => this.message = 'Failed to delete record: ' + err.message
    });
  }

  /**
   * Format TimeSpan string (e.g., "00:30:00") to a more readable format
   */
  formatTime(time: string | null | undefined): string {
    if (!time) return '';
    const [hours, minutes, seconds] = time.split(':').map(Number);
    let formatted = '';
    if (hours > 0) formatted += `${hours}h `;
    if (minutes > 0 || hours > 0) formatted += `${minutes}m `;
    formatted += `${seconds}s`;
    return formatted.trim();
  }
}
