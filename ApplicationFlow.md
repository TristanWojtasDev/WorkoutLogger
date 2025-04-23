# Application Flow and Key Files

This document outlines the flow of the `WorkoutLogger` application from startup to displaying the login, signup, guest login, workout creation, editing, and deletion, highlighting key files and their roles. It compares Angular concepts to .NET C# MVC equivalents for clarity.

## Detailed Flow and Key Files

### 1. Angular Client Boots Up

- **Entry Point**: `main.ts`
  - **Role**: Bootstraps the Angular application by loading the root module.
  - **MVC Equivalent**: Similar to `Program.cs` in MVC, where the app starts and configures the pipeline.
  - **Flow**: Loads the root module to start the app.

- **Root Module**: `app.module.ts`
  - **Key Pieces**:
    - Configures the app with necessary imports for browser rendering, HTTP requests, routing, and the standalone login component.
    - Registers an HTTP interceptor to attach JWT tokens to requests.
    - Specifies the root component to bootstrap.
  - **MVC Equivalent**: Like `Startup.cs` in MVC, where services and the app pipeline are configured.
  - **Flow**: Loads the root component as the entry point of the app.

- **Root Component**: `app.component.ts`
  - **Key Pieces**:
    - Defines the root HTML tag where the app renders.
    - Includes a template that renders the login component.
  - **MVC Equivalent**: Like `Views/Shared/_Layout.cshtml` in MVC, which defines the overall layout and includes a placeholder for the main view.
  - **Flow**: Renders the login component via its HTML tag.

- **Index HTML**: `index.html`
  - **Key Pieces**:
    - Contains a placeholder tag where the root component is rendered.
  - **MVC Equivalent**: Like the initial HTML response in MVC, where the layout is rendered with a placeholder for the view.
  - **Flow**: Angular replaces the placeholder tag with the root component’s template, which includes the login component.

### 2. Displaying the Login, Signup, and Guest Login Forms

- **Component**: `login.component.ts`
  - **Key Pieces**:
    - A standalone component that imports modules for form handling (`FormsModule`) and common directives (`CommonModule`).
    - Contains a template with two main sections: an authentication section (shown when not logged in) and a workout section (shown after login).
    - The authentication section includes:
      - A login form (shown when `showSignup` is `false`) with inputs for `username` and `password`, bound using `ngModel`.
      - A signup form (shown when `showSignup` is `true`) with identical inputs for `username` and `password`.
      - A “Login as Guest” button to initiate guest login.
      - A “Switch to Sign Up/Login” button to toggle between login and signup forms.
      - All forms are centered using a `form-container` class with Flexbox styles (`display: flex; flex-direction: column; align-items: center;`).
    - Properties for `username`, `password`, and `showSignup` manage form state.
    - A flag (`isLoggedIn`) tracks the login state, checked on initialization using `AuthService`.
    - Methods to handle authentication:
      - `onSubmit`: Submits the login form to authenticate via `AuthService`.
      - `onRegister`: Submits the signup form to create a new account via `AuthService`.
      - `loginAsGuest`: Initiates guest login with a generated GUID.
      - `toggleSignup`: Switches between login and signup forms, resetting inputs.
  - **MVC Equivalent**: The authentication section is like `Views/Account/Login.cshtml` and `Views/Account/Register.cshtml` in MVC, where forms submit to controller actions for login or registration.
  - **Flow**: When the app loads, `isLoggedIn` is `false` (no token in local storage), so the authentication section displays the centered login form by default. Users can:
    - Enter credentials (e.g., `testuser` and `Test@123`) and submit to log in.
    - Click “Switch to Sign Up” to show the signup form, enter a new username and password (e.g., `newuser`, `Test@123`), and submit to create an account.
    - Click “Login as Guest” to access the app without credentials.

### 3. Authenticating the User

- **Service**: `auth.service.ts`
  - **Key Pieces**:
    - Defines URLs for the backend API (hardcoded to `https://localhost:7090/api/auth`, `https://localhost:7090/api/guest-auth`, and `https://localhost:7090/api/workouts`).
    - A `login` method sends a `POST` request to `/api/auth/login` with username and password, stores the JWT token in local storage, and logs the user’s name.
    - A `register` method sends a `POST` request to `/api/auth/register` with username and password, stores the JWT token, and logs the user’s name.
    - A `guestLogin` method sends a `POST` request to `/api/guest-auth/login` with a guest ID (GUID), stores the JWT token, and logs the guest user’s name.
    - A method (`isLoggedIn`) checks if a token exists to determine login state.
    - Methods for workout CRUD operations: `getWorkouts` (`GET`), `createWorkout` (`POST`), `updateWorkout` (`PUT`), and `deleteWorkout` (`DELETE`).
  - **MVC Equivalent**: Like a `UserService` or `AccountService` in MVC, which a controller uses to validate credentials, register users, or manage guest access, plus methods for data operations.
  - **Flow**:
    - **Login**: The login form submission calls `login`, sending a request to `/api/auth/login`. The backend validates credentials and returns a JWT token. The service stores the token, and the component sets `isLoggedIn` to `true`, showing the workout section.
    - **Signup**: The signup form submission calls `register`, sending a request to `/api/auth/register`. The backend creates the user, returns a JWT token, and the service stores it, switching to the workout section.
    - **Guest Login**: The guest login button calls `guestLogin` with a GUID (generated or retrieved from local storage). The backend creates or retrieves a guest user, returns a JWT token, and the service stores it, showing the workout section.

- **Interceptor**: `jwt.interceptor.ts`
  - **Key Pieces**:
    - Adds the JWT token to the headers of outgoing HTTP requests.
  - **MVC Equivalent**: Like authentication middleware in MVC, which attaches the user’s identity to the request.
  - **Flow**: When the service makes HTTP requests (e.g., to fetch workouts), the interceptor adds the token, ensuring the backend authorizes the request for logged-in or guest users.

### 4. Displaying the Workout Section (Create, Edit, Delete)

- **Component**: `LoginComponent` (Workout Section)
  - **Key Pieces**:
    - A section shown only after login (regular, guest, or signup), containing:
      - A logout button to clear the token and reset the UI to the login form.
      - Centered creation forms (using `form-container` class) for:
        - **Workout**: Inputs for `exercise`, `sets`, `reps`, and `weight`, bound to a `newWorkout` object using `ngModel`.
        - **Cardio**: Inputs for `exercise`, `miles`, and `time` (HH:mm:ss), bound to a `newCardio` object.
        - **Weigh-In**: Input for `weight`, bound to a `newWeighIn` object.
        - Numeric fields initialized as `undefined` to show placeholders (`Sets`, `Reps`, `Weight (lbs)`, `Miles`, `Time (HH:mm:ss)`).
      - A centered edit form (shown when editing), with inputs bound to an `editingRecord` object, supporting Workout, Cardio, or Weigh-In fields, with “Save” and “Cancel” buttons.
      - A list of all workout entries (Workout, Cardio, Weigh-In) with details:
        - Workout: `exercise`, `sets`, `reps`, `weight`, formatted date.
        - Cardio: `exercise`, `miles`, `time` (formatted as `h m s`), date.
        - Weigh-In: `weight`, date.
        - Each entry has “Edit” and “Delete” buttons.
    - Methods to handle workout operations:
      - `createWorkout`: Submits the Workout creation form, converts numeric fields to numbers, and calls the service to create a Workout entry.
      - `createCardio`: Submits the Cardio creation form, validates inputs, and creates a Cardio entry.
      - `createWeighIn`: Submits the Weigh-In creation form, validates weight, and creates a Weigh-In entry.
      - `getRecords`: Fetches all user workouts (Workout, Cardio, Weigh-In) and updates the list.
      - `startEdit`: Copies a workout entry into `editingRecord` to populate the edit form.
      - `updateRecord`: Submits the edit form and updates the workout via the service.
      - `deleteRecord`: Deletes a workout via the service and refreshes the list.
      - `formatTime`: Formats Cardio `time` (e.g., `00:30:00` to `30m 0s`).
    - Handles `undefined` `id` values in `updateRecord` and `deleteRecord` to ensure type safety.
  - **MVC Equivalent**: Like `Views/Workouts/Index.cshtml` in MVC, which includes forms to create/edit workouts and a list of existing workouts with edit/delete actions, with controller actions handling form submission and data retrieval.
  - **Flow**:
    - After login/signup/guest login, the component switches to the workout section.
    - It fetches existing workouts using `getRecords` (`GET /api/workouts`).
    - The interceptor adds the JWT token to the request.
    - The backend returns the user’s workouts (Workout, Cardio, Weigh-In), displayed in a list.
    - **Create Workflow**:
      - **Workout**: User fills out the Workout form (e.g., Exercise: “Squat”, Sets: 3, Reps: 10, Weight: 185) and submits. `createWorkout` calls the service (`POST /api/workouts`). The backend saves the Workout and returns it.
      - **Cardio**: User fills out the Cardio form (e.g., Exercise: “Running”, Miles: 3.5, Time: `00:30:00`) and submits. `createCardio` calls the service. The backend saves the Cardio entry.
      - **Weigh-In**: User fills out the Weigh-In form (e.g., Weight: 175) and submits. `createWeighIn` calls the service. The backend saves the Weigh-In entry.
      - The component refreshes the list, updating the UI.
    - **Edit Workflow**:
      - User clicks “Edit” on a workout entry (Workout, Cardio, or Weigh-In).
      - `startEdit` populates the edit form with the entry’s details.
      - User updates the details and clicks “Save”.
      - `updateRecord` calls the service (`PUT /api/workouts/{id}`).
      - The backend updates the entry and returns a success response.
      - The component refreshes the list.
    - **Delete Workflow**:
      - User clicks “Delete” on a workout entry.
      - `deleteRecord` calls the service (`DELETE /api/workouts/{id}`).
      - The backend deletes the entry and returns a success response.
      - The component refreshes the list.

- **Backend**: `WorkoutsController` (in `WorkoutLogger.Server`)
  - **Key Pieces**:
    - Requires authentication for all endpoints using `[Authorize]`.
    - `GetWorkouts` (`GET /api/workouts`): Fetches all workouts (Workout, Cardio, Weigh-In) for the logged-in or guest user.
    - `CreateWorkout` (`POST /api/workouts`): Saves a new Workout, Cardio, or Weigh-In entry, setting the `UserId` (from JWT claims) and `Date`.
    - `UpdateWorkout` (`PUT /api/workouts/{id}`): Updates an existing workout entry, ensuring the user owns it.
    - `DeleteWorkout` (`DELETE /api/workouts/{id}`): Deletes a workout entry, ensuring the user owns it.
    - Uses `ApplicationDbContext` to interact with the SQLite database.
  - **MVC Equivalent**: Like a `WorkoutsController` in MVC, where actions handle fetching, creating, updating, and deleting workouts, returning views or redirecting as needed.
  - **Flow**: The backend receives requests to fetch, create, update, or delete workouts, processes them using the database context, and returns the results as JSON (or status codes for updates/deletes), which Angular uses to update the UI.

- **Backend**: `AuthController` (in `WorkoutLogger.Server`)
  - **Key Pieces**:
    - Handles `POST /api/auth/login` to authenticate users and return a JWT token.
    - Handles `POST /api/auth/register` to create new user accounts and return a JWT token.
  - **MVC Equivalent**: Like an `AccountController` in MVC, with actions for login and registration.
  - **Flow**: Validates credentials or creates users, returning JWT tokens for Angular to store and use.

- **Backend**: `GuestAuthController` (in `WorkoutLogger.Server`)
  - **Key Pieces**:
    - Handles `POST /api/guest-auth/login` to create or retrieve a guest user based on a GUID and return a JWT token.
  - **MVC Equivalent**: Like a custom controller action for anonymous access in MVC.
  - **Flow**: Generates or retrieves a guest user, returning a JWT token for guest access.
