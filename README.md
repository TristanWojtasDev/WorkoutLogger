# WorkoutLogger

A full-stack web application for logging and managing workout activities, built with Angular 19 and .NET Core 8.

## Project Structure
- **Solution**: `WorkoutLogger.sln`
- **Backend**: `WorkoutLogger.Server` (.NET Core 8, API, EF Core, SQLite)
- **Frontend**: `workoutlogger.client` (Angular 19)
- **Database**: SQLite (`app.db`)

## What Has Been Done
- **Authentication/Authorization**:
  - Implemented JWT-based authentication using ASP.NET Core Identity.
  - `AuthController` handles:
    - `POST /api/auth/login`: Authenticates users and returns a JWT token.
    - `POST /api/auth/register`: Creates new user accounts and returns a JWT token.
  - `GuestAuthController` handles `POST /api/guest-auth/login`: Allows guest users to log in with a generated GUID, creating a guest account if needed.
  - Angular frontend (`LoginComponent`) supports:
    - Login with username/password.
    - Account creation via a signup form.
    - Guest login with automatic GUID generation.
    - Toggle between login and signup forms.
  - Protected endpoints (e.g., `/api/workouts`) require authentication.
- **ORM**:
  - Set up Entity Framework Core with SQLite for user and workout management.
  - Added `Workout` model with support for Workout, Cardio, and Weigh-In types, including migrations.
- **Frontend Integration**:
  - Angular app integrated with .NET backend via SPA proxy (`Microsoft.AspNetCore.SpaProxy`).
  - Login, signup, and guest login forms work at `https://localhost:7090/` (backend port).
  - `apiUrl` in `auth.service.ts` hardcoded to `https://localhost:7090/api/auth` due to proxy routing issues.
- **Workout Logging**:
  - Added `WorkoutsController` for CRUD operations:
    - `GET /api/workouts`: Fetches workouts (Workout, Cardio, Weigh-In) for the logged-in or guest user.
    - `POST /api/workouts`: Creates a new Workout, Cardio, or Weigh-In entry.
    - `PUT /api/workouts/{id}`: Updates an existing workout entry.
    - `DELETE /api/workouts/{id}`: Deletes a workout entry.
  - Updated `Workout` model to:
    - Support `WorkoutType` enum (`Workout`, `Cardio`, `WeighIn`).
    - Make `UserId` nullable to fix validation issues during creation.
  - Updated `LoginComponent` to:
    - Fetch and display all workout types (Workout, Cardio, Weigh-In) after login.
    - Include forms to create Workout (`exercise`, `sets`, `reps`, `weight`), Cardio (`exercise`, `miles`, `time`), and Weigh-In (`weight`) entries.
    - Display workout list with details:
      - Workout: exercise, sets, reps, weight, date.
      - Cardio: exercise, miles, time (formatted as `h m s`), date.
      - Weigh-In: weight, date.
    - Support edit and delete functionality for all workout types.
    - Center forms (login, signup, create/edit Workout, Cardio, Weigh-In) using Flexbox (`form-container` class).
    - Fix form placeholders to show `Sets`, `Reps`, `Weight (lbs)`, `Miles`, `Time (HH:mm:ss)` instead of `0` by initializing with `undefined`.
- **Documentation**:
  - Added JSDoc comments to `LoginComponent` and `AuthService` for login, signup, guest login, and workout management.
  - Configured TypeDoc to generate documentation for the frontend (`workoutlogger.client`).
  - Updated `tsconfig.json` to include `src/**/*.ts` and exclude `node_modules` and test files for TypeDoc.
  - Generated documentation in `workoutlogger.client/docs` with `npm run docs`.
- **Type Safety**:
  - Fixed TypeScript errors in `LoginComponent` related to `null` vs. `undefined` for form fields.
  - Updated `deleteWorkout` and `updateWorkout` methods to handle `number | undefined` for `id` parameters, ensuring type safety.
- **Deployment Prep**:
  - Created a `Dockerfile` for containerizing the app.

## How to Test
### Prerequisites
- .NET 8 SDK
- Node.js 20.x
- Visual Studio 2022
- Docker (for deployment)

### Setup
1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd WorkoutLogger

2. **Backend Setup:**:
- Open `WorkoutLogger.Server` in Visual Studio.
- Ensure WorkoutLogger.Server is the startup project first.
- Run migrations:
cd WorkoutLogger.Server
dotnet ef database update

3. **Frontend Setup**:
- Install Angular Dependencies
cd workoutlogger.client
npm install


### Running the App
1. Start the application
2. Go to URL https://localhost:7090/
3. Test Login:
- Enter testuser and Test@123
- Click Login

## What's Left

- **Fix SPA Proxy Routing**:
  - Currently using a hardcoded `apiUrl` in `auth.service.ts`. Should use a relative `/api/auth` with proper SPA proxy routing to `7090`.
  - Debug why `/api/*` requests hit `54522` instead of `7090`.
  - Potential fix:
    - Add manual proxy middleware for `/api/*` in `Program.cs`.
    - Ensure `proxy.conf.json` is applied correctly.

- **Deployment**:
  - Build Angular for production and integrate into `WorkoutLogger.Server/wwwroot`:
    ```powershell
    cd workoutlogger.client
    ng build --configuration production
    ```
  - Copy `dist/workoutlogger.client/browser` to `WorkoutLogger.Server/wwwroot`.
  - Update `Program.cs` to serve static files:
    ```csharp
    app.UseSpa(spa =>
    {
        spa.Options.SourcePath = "wwwroot";
    });
    ```
  - Test Docker deployment locally:
    ```powershell
    cd WorkoutLogger.Server
    docker build -t workoutlogger .
    docker run -d -p 8080:80 --name workoutlogger workoutlogger
    ```
  - Access the app at `http://localhost:8080`.
  - Optionally deploy to a cloud provider (e.g., DigitalOcean).

## Next Steps
- Add a form in Angular to create workouts (`POST /api/workouts`).
- Test Docker deployment locally.
- Optionally debug the SPA proxy to use a relative `apiUrl` without CORS.

## Notes
- The SPA proxy issue requires further debugging to avoid CORS and hardcoding. A manual proxy middleware for `/api/*` was suggested but not fully tested.
- Expand the workout feature based on user needs (e.g., edit/delete workouts, filtering).

