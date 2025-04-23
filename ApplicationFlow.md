# Application Flow and Key Files

This document outlines the flow of the `WorkoutLogger` application from startup to displaying the login form, workout creation, editing, and deletion, highlighting key files and their roles. It compares Angular concepts to .NET C# MVC equivalents for clarity.

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

### 2. Displaying the Login Form

- **Component**: `login.component.ts`
  - **Key Pieces**:
    - A standalone component that imports modules for form handling (`FormsModule`) and common directives (`CommonModule`).
    - Contains a template with two sections: a login form (shown when not logged in) and a workout section (shown after login).
    - The login form is centered using a `form-container` class with Flexbox styles (`display: flex; flex-direction: column; align-items: center;`).
    - Properties for `username` and `password` are bound to the login form inputs using `ngModel`.
    - A flag (`isLoggedIn`) tracks the login state, checked on initialization using `AuthService`.
    - A method (`onSubmit`) handles login form submission by calling the authentication service.
  - **MVC Equivalent**: The login form section is like `Views/Account/Login.cshtml` with a form in MVC, where the form submits to a controller action that validates credentials and redirects.
  - **Flow**: When the app loads, the login state is `false` (no token in local storage), so the centered login form is displayed. The user enters credentials (e.g., `testuser` and `Test@123`) and submits.

### 3. Authenticating the User

- **Service**: `auth.service.ts`
  - **Key Pieces**:
    - Defines URLs for the backend API (currently hardcoded to `https://localhost:7090/api/auth` and `https://localhost:7090/api/workouts`).
    - A `login` method sends a `POST` request to `/api/auth/login` with the username and password, stores the JWT token in local storage, and logs the user’s name.
    - A method (`isLoggedIn`) checks if a token exists to determine login state.
    - Methods for workout CRUD operations: `getWorkouts` (`GET`), `createWorkout` (`POST`), `updateWorkout` (`PUT`), and `deleteWorkout` (`DELETE`).
  - **MVC Equivalent**: Like a `UserService` or `AccountService` in MVC, which a controller uses to validate credentials and sign in the user, plus additional methods for data operations.
  - **Flow**: The login form submission calls the service’s `login` method, which sends a request to the backend. The backend validates the credentials and returns a JWT token. The service stores the token, and the component updates the login state, switching the UI to the workout section.

- **Interceptor**: `jwt.interceptor.ts`
  - **Key Pieces**:
    - Adds the JWT token to the headers of outgoing HTTP requests.
  - **MVC Equivalent**: Like authentication middleware in MVC, which attaches the user’s identity to the request.
  - **Flow**: When the service makes HTTP requests (e.g., to fetch workouts), the interceptor adds the token, ensuring the backend authorizes the request.

### 4. Displaying the Workout Section (Create, Edit, Delete)

- **Component**: `LoginComponent` (Workout Section)
  - **Key Pieces**:
    - A section shown only after login, containing:
      - A logout button to clear the token and reset the UI.
      - A centered workout creation form (using `form-container` class), with inputs for `exercise`, `sets`, `reps`, and `weight`, bound to a `newWorkout` object using `ngModel`. Numeric fields are initialized as `undefined` to show placeholders (`Sets`, `Reps`, `Weight (lbs)`).
      - A centered edit form (shown when editing a workout), with inputs bound to an `editingWorkout` object, and “Save” and “Cancel” buttons.
      - A list of workouts with “Edit” and “Delete” buttons for each entry.
    - Methods to handle workout operations:
      - `createWorkout`: Submits the creation form, converts numeric fields to numbers, and calls the service to create a workout.
      - `getWorkouts`: Fetches the user’s workouts and updates the list.
      - `startEdit`: Copies a workout into `editingWorkout` to populate the edit form.
      - `updateWorkout`: Submits the edit form and updates the workout via the service.
      - `deleteWorkout`: Deletes a workout via the service and refreshes the list.
    - Handles `undefined` `id` values in `updateWorkout` and `deleteWorkout` to ensure type safety.
  - **MVC Equivalent**: Like `Views/Workouts/Index.cshtml` in MVC, which includes a form to create/edit workouts and a list of existing workouts with edit/delete actions, with controller actions handling form submission and data retrieval.
  - **Flow**:
    - After login, the component switches to the workout section.
    - It fetches existing workouts using the service (`GET /api/workouts`).
    - The interceptor adds the token to the request.
    - The backend returns the user’s workouts, displayed in a list.
    - **Create Workflow**:
      - The user fills out the centered creation form (e.g., Exercise: “Squat”, Sets: 3, Reps: 10, Weight: 185) and submits.
      - `createWorkout` calls the service to create the workout (`POST /api/workouts`).
      - The backend saves the workout and returns it.
      - The component refreshes the list, updating the UI.
    - **Edit Workflow**:
      - The user clicks “Edit” on a workout.
      - `startEdit` populates the centered edit form with the workout’s details.
      - The user updates the details and clicks “Save”.
      - `updateWorkout` calls the service to update the workout (`PUT /api/workouts/{id}`).
      - The backend updates the workout and returns a success response.
      - The component refreshes the list.
    - **Delete Workflow**:
      - The user clicks “Delete” on a workout.
      - `deleteWorkout` calls the service to delete the workout (`DELETE /api/workouts/{id}`).
      - The backend deletes the workout and returns a success response.
      - The component refreshes the list.

- **Backend**: `WorkoutsController` (in `WorkoutLogger.Server`)
  - **Key Pieces**:
    - Requires authentication for all endpoints using `[Authorize]`.
    - `GetWorkouts` (`GET /api/workouts`): Fetches workouts for the logged-in user.
    - `CreateWorkout` (`POST /api/workouts`): Saves a new workout, setting the `UserId` (from JWT claims) and `Date`.
    - `UpdateWorkout` (`PUT /api/workouts/{id}`): Updates an existing workout, ensuring the user owns it.
    - `DeleteWorkout` (`DELETE /api/workouts/{id}`): Deletes a workout, ensuring the user owns it.
    - Uses `ApplicationDbContext` to interact with the SQLite database.
  - **MVC Equivalent**: Like a `WorkoutsController` in MVC, where actions handle fetching, creating, updating, and deleting workouts, returning views or redirecting as needed.
  - **Flow**: The backend receives requests to fetch, create, update, or delete workouts, processes them using the database context, and returns the results as JSON (or status codes for updates/deletes), which Angular uses to update the UI.
