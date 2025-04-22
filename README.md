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
  - `AuthController` handles `POST /api/auth/login`, returning a JWT token.
  - Angular frontend (`LoginComponent`) allows users to log in with username/password.
  - Protected endpoints (e.g., `/api/test`, `/api/workouts`) require authentication.
- **ORM**:
  - Set up Entity Framework Core with SQLite for user management.
  - Added `Workout` model and migrations for workout logging.
- **Frontend Integration**:
  - Angular app integrated with .NET backend via SPA proxy (`Microsoft.AspNetCore.SpaProxy`).
  - Login form works at `https://localhost:7090/` (backend port).
  - `apiUrl` in `auth.service.ts` hardcoded to `https://localhost:7090/api/auth` due to proxy routing issues.
- **Workout Logging**:
  - Added `WorkoutsController` for basic CRUD (`GET /api/workouts`, `POST /api/workouts`).
  - Updated `LoginComponent` to fetch workouts after login.
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
- bash
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

- **Enhance Workout Features**:
  - Add a form to create workouts (`POST /api/workouts`).
  - Display the workout list with details (exercise, sets, reps, weight, date).

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
