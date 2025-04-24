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
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="retro-container">
      <div class="retro-screen">
        <div class="screen-header">
          <div class="pixel-corner top-left"></div>
          <h1 class="game-title">WORKOUT QUEST</h1>
          <div class="pixel-corner top-right"></div>
        </div>
        
        <!-- Login/Signup Section -->
        <div *ngIf="!isLoggedIn" class="game-section">
          <div class="pixel-content">
            <h2 class="section-title">{{ showSignup ? 'CREATE CHARACTER' : 'LOAD CHARACTER' }}</h2>
            <!-- Login Form -->
            <form *ngIf="!showSignup" (ngSubmit)="onSubmit()" class="retro-form">
              <div class="form-group">
                <label>USERNAME:</label>
                <input [(ngModel)]="username" name="username" required class="retro-input" />
              </div>
              <div class="form-group">
                <label>PASSWORD:</label>
                <input [(ngModel)]="password" name="password" type="password" required class="retro-input" />
              </div>
              <button type="submit" class="retro-btn primary-btn">CONTINUE</button>
            </form>
            
            <!-- Signup Form -->
            <form *ngIf="showSignup" (ngSubmit)="onRegister()" class="retro-form">
              <div class="form-group">
                <label>NEW USERNAME:</label>
                <input [(ngModel)]="username" name="username" required class="retro-input" />
              </div>
              <div class="form-group">
                <label>NEW PASSWORD:</label>
                <input [(ngModel)]="password" name="password" type="password" required class="retro-input" />
              </div>
              <button type="submit" class="retro-btn primary-btn">CREATE</button>
            </form>
            
            <div class="button-group">
              <button (click)="loginAsGuest()" class="retro-btn secondary-btn">GUEST MODE</button>
              <button (click)="toggleSignup()" class="retro-btn secondary-btn">
                {{ showSignup ? 'LOAD GAME' : 'NEW GAME' }}
              </button>
            </div>
            
            <div *ngIf="message" class="message-box">
              <p>{{ message }}</p>
            </div>
          </div>
        </div>
        
        <!-- Workout Logger Section -->
        <div *ngIf="isLoggedIn" class="game-section">
          <div class="menu-bar">
            <h2 class="section-title">TRAINING MODE</h2>
            <button (click)="logout()" class="retro-btn danger-btn">QUIT GAME</button>
          </div>
          
          <div class="game-content">
            <div class="pixel-tabs">
              <button (click)="activeTab = 'workout'" [class.active]="activeTab === 'workout'" class="tab-btn">STRENGTH</button>
              <button (click)="activeTab = 'cardio'" [class.active]="activeTab === 'cardio'" class="tab-btn">CARDIO</button>
              <button (click)="activeTab = 'weighin'" [class.active]="activeTab === 'weighin'" class="tab-btn">STATS</button>
              <button (click)="activeTab = 'records'; getRecords()" [class.active]="activeTab === 'records'" class="tab-btn">HISTORY</button>
            </div>
            
            <!-- Create Workout Form -->
            <div *ngIf="activeTab === 'workout'" class="tab-content">
              <h3 class="pixel-title">NEW STRENGTH TRAINING</h3>
              <form (ngSubmit)="createWorkout()" class="retro-form">
                <div class="form-group">
                  <label>EXERCISE:</label>
                  <input [(ngModel)]="newWorkout.exercise" name="exercise" required class="retro-input" />
                </div>
                <div class="form-group">
                  <label>SETS:</label>
                  <input [(ngModel)]="newWorkout.sets" name="sets" type="number" required class="retro-input numeric" />
                </div>
                <div class="form-group">
                  <label>REPS:</label>
                  <input [(ngModel)]="newWorkout.reps" name="reps" type="number" required class="retro-input numeric" />
                </div>
                <div class="form-group">
                  <label>WEIGHT:</label>
                  <input [(ngModel)]="newWorkout.weight" name="weight" type="number" step="0.1" required class="retro-input numeric" />
                  <span class="unit">LBS</span>
                </div>
                <button type="submit" class="retro-btn primary-btn">SAVE PROGRESS</button>
              </form>
            </div>
            
            <!-- Create Cardio Form -->
            <div *ngIf="activeTab === 'cardio'" class="tab-content">
              <h3 class="pixel-title">NEW CARDIO QUEST</h3>
              <form (ngSubmit)="createCardio()" class="retro-form">
                <div class="form-group">
                  <label>ACTIVITY:</label>
                  <input [(ngModel)]="newCardio.exercise" name="exercise" required class="retro-input" />
                </div>
                <div class="form-group">
                  <label>MILES:</label>
                  <input [(ngModel)]="newCardio.miles" name="miles" type="number" step="0.01" required class="retro-input numeric" />
                </div>
                <div class="form-group">
                  <label>TIME:</label>
                  <input [(ngModel)]="newCardio.time" name="time" type="text" placeholder="HH:MM:SS" required class="retro-input" />
                </div>
                <button type="submit" class="retro-btn primary-btn">COMPLETE QUEST</button>
              </form>
            </div>
            
            <!-- Create Weigh-In Form -->
            <div *ngIf="activeTab === 'weighin'" class="tab-content">
              <h3 class="pixel-title">CHARACTER STATS</h3>
              <form (ngSubmit)="createWeighIn()" class="retro-form">
                <div class="form-group">
                  <label>WEIGHT:</label>
                  <input [(ngModel)]="newWeighIn.weight" name="weight" type="number" step="0.1" required class="retro-input numeric" />
                  <span class="unit">LBS</span>
                </div>
                <button type="submit" class="retro-btn primary-btn">UPDATE STATS</button>
              </form>
            </div>
            
            <!-- Records List -->
            <div *ngIf="activeTab === 'records'" class="tab-content">
              <h3 class="pixel-title">ADVENTURE LOG</h3>
              <button (click)="getRecords()" class="retro-btn secondary-btn refresh-btn">REFRESH</button>
              
              <div *ngIf="editingRecord" class="edit-form">
                <h4 class="pixel-subtitle">EDIT RECORD</h4>
                <form (ngSubmit)="updateRecord()" class="retro-form">
                  <div *ngIf="editingRecord.type === 'Workout'">
                    <div class="form-group">
                      <label>EXERCISE:</label>
                      <input [(ngModel)]="editingRecord.exercise" name="exercise" required class="retro-input" />
                    </div>
                    <div class="form-group">
                      <label>SETS:</label>
                      <input [(ngModel)]="editingRecord.sets" name="sets" type="number" required class="retro-input numeric" />
                    </div>
                    <div class="form-group">
                      <label>REPS:</label>
                      <input [(ngModel)]="editingRecord.reps" name="reps" type="number" required class="retro-input numeric" />
                    </div>
                    <div class="form-group">
                      <label>WEIGHT:</label>
                      <input [(ngModel)]="editingRecord.weight" name="weight" type="number" step="0.1" required class="retro-input numeric" />
                      <span class="unit">LBS</span>
                    </div>
                  </div>
                  <div *ngIf="editingRecord.type === 'Cardio'">
                    <div class="form-group">
                      <label>ACTIVITY:</label>
                      <input [(ngModel)]="editingRecord.exercise" name="exercise" required class="retro-input" />
                    </div>
                    <div class="form-group">
                      <label>MILES:</label>
                      <input [(ngModel)]="editingRecord.miles" name="miles" type="number" step="0.01" required class="retro-input numeric" />
                    </div>
                    <div class="form-group">
                      <label>TIME:</label>
                      <input [(ngModel)]="editingRecord.time" name="time" type="text" required class="retro-input" />
                    </div>
                  </div>
                  <div *ngIf="editingRecord.type === 'WeighIn'">
                    <div class="form-group">
                      <label>WEIGHT:</label>
                      <input [(ngModel)]="editingRecord.weight" name="weight" type="number" step="0.1" required class="retro-input numeric" />
                      <span class="unit">LBS</span>
                    </div>
                  </div>
                  <div class="button-group">
                    <button type="submit" class="retro-btn primary-btn">SAVE</button>
                    <button type="button" (click)="cancelEdit()" class="retro-btn danger-btn">CANCEL</button>
                  </div>
                </form>
              </div>
              
              <div class="records-list">
                <div *ngIf="records.length > 0; else noRecords" class="retro-list">
                  <div *ngFor="let record of records" class="record-item">
                    <div class="record-content">
                      <span *ngIf="record.type === 'Workout'" class="record-text">
                        <span class="record-date">{{ record.date | date:'MM/dd/yy HH:mm' }}</span>
                        <span class="record-type strength-type">STRENGTH</span>
                        {{ record.exercise }}: {{ record.sets }} sets × {{ record.reps }} reps × {{ record.weight | number:'1.1-1' }} lbs
                      </span>
                      <span *ngIf="record.type === 'Cardio'" class="record-text">
                        <span class="record-date">{{ record.date | date:'MM/dd/yy HH:mm' }}</span>
                        <span class="record-type cardio-type">CARDIO</span>
                        {{ record.exercise }}: {{ record.miles | number:'1.2-2' }} miles, {{ formatTime(record.time) }}
                      </span>
                      <span *ngIf="record.type === 'WeighIn'" class="record-text">
                        <span class="record-date">{{ record.date | date:'MM/dd/yy HH:mm' }}</span>
                        <span class="record-type stats-type">STATS</span>
                        Weight: {{ record.weight | number:'1.1-1' }} lbs
                      </span>
                    </div>
                    <div class="record-actions">
                      <button (click)="startEdit(record)" class="action-btn edit-btn">EDIT</button>
                      <button (click)="deleteRecord(record.id)" class="action-btn delete-btn">DELETE</button>
                    </div>
                  </div>
                </div>
                <ng-template #noRecords>
                  <div class="empty-state">
                    <p>NO ADVENTURES LOGGED YET.</p>
                    <p>BEGIN YOUR QUEST!</p>
                  </div>
                </ng-template>
              </div>
            </div>
            
            <div *ngIf="message" class="message-box">
              <p>{{ message }}</p>
            </div>
          </div>
        </div>
        
        <div class="screen-footer">
          <div class="pixel-corner bottom-left"></div>
          <p class="copyright">2025 WORKOUT QUEST</p>
          <div class="pixel-corner bottom-right"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Global Pixel Font */
    @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
    
    /* Main Container */
    .retro-container {
      font-family: 'Press Start 2P', cursive;
      background-color: #111;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
      color: #fff;
      letter-spacing: 1px;
      line-height: 1.5;
    }
    
    /* Screen Effects */
    .retro-screen {
      background-color: #000;
      border: 8px solid #444;
      border-radius: 10px;
      padding: 15px;
      width: 100%;
      max-width: 800px;
      min-height: 600px;
      box-shadow: 0 0 20px rgba(0, 255, 0, 0.3),
                  inset 0 0 15px rgba(0, 255, 0, 0.2);
      position: relative;
      overflow: hidden;
    }
    
    /* Screen Scan Lines Effect */
    .retro-screen::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: repeating-linear-gradient(
        transparent 0px,
        rgba(0, 255, 0, 0.03) 1px,
        transparent 2px,
        transparent 4px
      );
      pointer-events: none;
      z-index: 100;
    }
    
    /* Header */
    .screen-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 4px solid #00ff00;
      margin-bottom: 15px;
      padding-bottom: 10px;
      position: relative;
    }
    
    /* Footer */
    .screen-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 4px solid #00ff00;
      margin-top: 15px;
      padding-top: 10px;
      position: relative;
    }
    
    /* Pixel Corners */
    .pixel-corner {
      width: 15px;
      height: 15px;
      background-color: #00ff00;
    }
    
    .top-left {
      clip-path: polygon(0 0, 100% 0, 0 100%);
    }
    
    .top-right {
      clip-path: polygon(0 0, 100% 0, 100% 100%);
    }
    
    .bottom-left {
      clip-path: polygon(0 0, 100% 100%, 0 100%);
    }
    
    .bottom-right {
      clip-path: polygon(100% 0, 100% 100%, 0 100%);
    }
    
    /* Game Title */
    .game-title {
      font-size: 24px;
      color: #00ff00;
      text-shadow: 0 0 5px rgba(0, 255, 0, 0.7);
      margin: 0;
      text-align: center;
      text-transform: uppercase;
    }
    
    .copyright {
      font-size: 8px;
      color: #00aa00;
      margin: 0;
    }
    
    /* Sections */
    .game-section {
      padding: 10px;
    }
    
    .pixel-content {
      border: 4px solid #00aa00;
      background: rgba(0, 20, 0, 0.7);
      padding: 15px;
      margin-bottom: 15px;
    }
    
    .section-title {
      font-size: 18px;
      color: #ffff00;
      margin-top: 0;
      margin-bottom: 15px;
      text-align: center;
      text-shadow: 0 0 5px rgba(255, 255, 0, 0.7);
    }
    
    /* Form Elements */
    .retro-form {
      margin-bottom: 20px;
    }
    
    .form-group {
      margin-bottom: 12px;
      display: flex;
      align-items: center;
    }
    
    label {
      color: #00ff00;
      margin-right: 10px;
      min-width: 120px;
      font-size: 12px;
    }
    
    .retro-input {
      background-color: #000;
      border: 2px solid #00aa00;
      color: #00ff00;
      padding: 8px;
      font-family: 'Press Start 2P', cursive;
      font-size: 12px;
      width: 100%;
    }
    
    .retro-input:focus {
      outline: none;
      border-color: #00ff00;
      box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
    }
    
    .retro-input.numeric {
      width: 80px;
      text-align: right;
    }
    
    .unit {
      margin-left: 5px;
      color: #00aa00;
      font-size: 10px;
    }
    
    /* Buttons */
    .retro-btn {
      background-color: #222;
      border: 3px solid #00aa00;
      color: #00ff00;
      font-family: 'Press Start 2P', cursive;
      padding: 10px 15px;
      margin: 5px;
      cursor: pointer;
      font-size: 12px;
      position: relative;
      transition: all 0.1s;
    }
    
    .retro-btn:hover {
      background-color: #333;
      transform: translateY(-2px);
      box-shadow: 0 2px 0 #00aa00;
    }
    
    .retro-btn:active {
      transform: translateY(0);
      box-shadow: none;
      background-color: #444;
    }
    
    .primary-btn {
      background-color: #003300;
      border-color: #00aa00;
    }
    
    .secondary-btn {
      background-color: #002244;
      border-color: #0088ff;
      color: #00aaff;
    }
    
    .danger-btn {
      background-color: #330000;
      border-color: #aa0000;
      color: #ff0000;
    }
    
    .button-group {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      margin-top: 15px;
    }
    
    /* Message Box */
    .message-box {
      border: 2px dashed #ffff00;
      background-color: rgba(40, 40, 0, 0.5);
      padding: 10px;
      margin-top: 15px;
      color: #ffff00;
      font-size: 10px;
      text-align: center;
    }
    
    /* Tabs */
    .pixel-tabs {
      display: flex;
      flex-wrap: wrap;
      margin-bottom: 15px;
      border-bottom: 2px solid #00aa00;
    }
    
    .tab-btn {
      background-color: #000;
      border: 2px solid #00aa00;
      border-bottom: none;
      color: #00aa00;
      padding: 5px 10px;
      margin-right: 5px;
      cursor: pointer;
      font-family: 'Press Start 2P', cursive;
      font-size: 10px;
      position: relative;
      top: 2px;
    }
    
    .tab-btn.active {
      background-color: #003300;
      color: #00ff00;
      border-bottom: 2px solid #003300;
    }
    
    .tab-content {
      background: rgba(0, 20, 0, 0.7);
      border: 2px solid #00aa00;
      padding: 15px;
      margin-bottom: 15px;
    }
    
    /* Titles */
    .pixel-title {
      color: #00ff00;
      font-size: 14px;
      text-align: center;
      margin-top: 0;
      margin-bottom: 15px;
      text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
    }
    
    .pixel-subtitle {
      color: #00aaff;
      font-size: 12px;
      margin-top: 0;
      margin-bottom: 10px;
    }
    
    /* Records List */
    .records-list {
      max-height: 300px;
      overflow-y: auto;
      padding-right: 5px;
      margin-top: 15px;
    }
    
    .records-list::-webkit-scrollbar {
      width: 8px;
      background-color: #111;
    }
    
    .records-list::-webkit-scrollbar-thumb {
      background-color: #00aa00;
      border-radius: 4px;
    }
    
    .record-item {
      border: 2px solid #00aa00;
      margin-bottom: 8px;
      background-color: rgba(0, 10, 0, 0.5);
      position: relative;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px;
    }
    
    .record-content {
      flex: 1;
    }
    
    .record-text {
      font-size: 10px;
      color: #eee;
      display: block;
    }
    
    .record-date {
      color: #aaa;
      font-size: 8px;
      display: block;
      margin-bottom: 3px;
    }
    
    .record-type {
      display: inline-block;
      padding: 2px 5px;
      margin-right: 5px;
      font-size: 8px;
      border-radius: 3px;
    }
    
    .strength-type {
      background-color: #003300;
      color: #00ff00;
    }
    
    .cardio-type {
      background-color: #002244;
      color: #00aaff;
    }
    
    .stats-type {
      background-color: #332200;
      color: #ffaa00;
    }
    
    .record-actions {
      display: flex;
      flex-direction: column;
      margin-left: 5px;
    }
    
    .action-btn {
      font-family: 'Press Start 2P', cursive;
      font-size: 8px;
      padding: 3px 5px;
      margin: 2px;
      cursor: pointer;
      border: none;
    }
    
    .edit-btn {
      background-color: #002244;
      color: #00aaff;
    }
    
    .delete-btn {
      background-color: #330000;
      color: #ff0000;
    }
    
    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 20px;
      color: #777;
      font-size: 12px;
    }
    
    /* Menu Bar */
    .menu-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }
    
    /* Animation for the flicker effect */
    @keyframes flicker {
      0% { opacity: 0.97; }
      5% { opacity: 0.99; }
      10% { opacity: 0.95; }
      15% { opacity: 1; }
      20% { opacity: 0.98; }
      50% { opacity: 0.94; }
      60% { opacity: 0.98; }
      70% { opacity: 0.97; }
      80% { opacity: 0.99; }
      100% { opacity: 0.95; }
    }
    
    .retro-screen {
      animation: flicker 4s infinite linear;
    }
    
    /* Responsive Design */
    @media (max-width: 768px) {
      .form-group {
        flex-direction: column;
        align-items: flex-start;
      }
      
      label {
        margin-bottom: 5px;
      }
      
      .retro-input {
        width: 100%;
      }
      
      .retro-input.numeric {
        width: 100%;
      }
      
      .record-item {
        flex-direction: column;
      }
      
      .record-actions {
        flex-direction: row;
        margin-top: 10px;
        margin-left: 0;
      }
    }
  `]
})

export class LoginComponent {
  username = '';
  password = '';
  message = '';
  isLoggedIn = false;
  showSignup = false; // Toggle between login and signup forms
  records: Workout[] = [];
  activeTab = 'workout';
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
    this.activeTab = 'records';
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
   * @param time The workout time to formate
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
