/// <summary>
/// Controller for managing workout data.
/// Flow: Provides endpoints to fetch (GET /api/workouts) and create (POST /api/workouts) workouts.
/// </summary>
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WorkoutLogger.Server.Data;
using WorkoutLogger.Server.Models;
using System.Security.Claims;

namespace WorkoutLogger.Server.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class WorkoutsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        /// <summary>
        /// Initializes a new instance of the WorkoutsController.
        /// </summary>
        /// <param name="context">The database context for accessing workouts.</param>
        public WorkoutsController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Fetches workouts for the logged-in user.
        /// </summary>
        /// <returns>A list of workouts for the current user.</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Workout>>> GetWorkouts()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return await _context.Workouts
                .Where(w => w.UserId == userId)
                .ToListAsync();
        }

        /// <summary>
        /// Creates a new workout for the logged-in user.
        /// </summary>
        /// <param name="workout">The workout data to create.</param>
        /// <returns>The created workout with its ID.</returns>
        [HttpPost]
        public async Task<ActionResult<Workout>> CreateWorkout(Workout workout)
        {
            workout.UserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            workout.Date = DateTime.UtcNow;
            _context.Workouts.Add(workout);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetWorkouts), new { id = workout.Id }, workout);
        }
    }
}
