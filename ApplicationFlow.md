# Application Flow and Key Files

This document outlines the flow of the `WorkoutLogger` application from startup to displaying the login form and workout creation form, highlighting key files and their roles. It compares Angular concepts to .NET C# MVC equivalents for clarity.

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
    - A standalone component that imports modules for form handling and common directives.
    - Contains a template with two sections: a login form (shown when not logged in) and a workout section (shown after login).
    - Properties for username and password are bound to the login form inputs.
    - A flag tracks the login state, checked on initialization using a service.
    - A method handles login form submission by calling the authentication service.
  - **MVC Equivalent**: The login form section is like `Views/Account/Login.cshtml` with a form in MVC, where the form submits to a controller action that validates credentials and redirects.
  - **Flow**: When the app loads, the login state is false (no token in local storage), so the login form is displayed. The user enters credentials and submits.

### 3. Authenticating the User

- **Service**: `auth.service.ts`
  - **Key Pieces**:
    - Defines URLs for the backend API (currently hardcoded).
    - A login method sends a request to the backend with the username and password, stores the JWT token in local storage, and logs the user’s name.
    - A method checks if a token exists to determine login state.
  - **MVC Equivalent**: Like a `UserService` or `AccountService` in MVC, which a controller uses to validate credentials and sign in the user.
  - **Flow**: The login form submission calls the service’s login method, which sends a request to the backend. The backend validates the credentials and returns a JWT token. The service stores the token, and the component updates the login state, switching the UI to the workout section.

- **Interceptor**: `jwt.interceptor.ts`
  - **Key Pieces**:
    - Adds the JWT token to the headers of outgoing HTTP requests.
  - **MVC Equivalent**: Like authentication middleware in MVC, which attaches the user’s identity to the request.
  - **Flow**: When the service makes HTTP requests (e.g., to fetch workouts), the interceptor adds the token, ensuring the backend authorizes the request.

### 4. Displaying the Exercise Form

- **Component**: `LoginComponent` (Workout Section)
  - **Key Pieces**:
    - A section shown only after login, containing a logout button, a workout creation form, and a list of workouts.
    - The creation form binds inputs to a workout object.
    - A method submits the form by calling the service to create a workout.
    - An array stores fetched workouts, and a method refreshes the list.
  - **MVC Equivalent**: Like `Views/Workouts/Index.cshtml` in MVC, which includes a form to create workouts and a list of existing workouts, with controller actions handling form submission and data retrieval.
  - **Flow**:
    - After login, the component switches to the workout section.
    - It fetches existing workouts using the service.
    - The interceptor adds the token to the request.
    - The backend returns the user’s workouts.
    - The user fills out the form and submits.
    - The component calls the service to create the workout, which sends a request to the backend.
    - The backend saves the workout and returns it.
    - The component refreshes the list, updating the UI.

- **Backend**: `WorkoutsController` (in `WorkoutLogger.Server`)
  - **Key Pieces**:
    - Requires authentication for all endpoints.
    - A method fetches workouts for the logged-in user.
    - A method saves a new workout, setting the user ID and date.
  - **MVC Equivalent**: Like a `WorkoutsController` in MVC, where one action returns a view with a workout list, and another handles form submission to create a workout and redirect.
  - **Flow**: The backend receives requests to fetch or create workouts, processes them using the database context, and returns the results as JSON, which Angular uses to update the UI.
