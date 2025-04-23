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
        public async Task<ActionResult<Workout>> CreateWorkout([FromBody] Workout workout)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            workout.UserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            workout.Date = DateTime.UtcNow;
            _context.Workouts.Add(workout);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetWorkouts), new { id = workout.Id }, workout);
        }

        /// <summary>
        /// Updates an existing workout for the logged-in user.
        /// </summary>
        /// <param name="id">The ID of the workout to update.</param>
        /// <param name="updatedWorkout">The updated workout data.</param>
        /// <returns>No content if successful; otherwise, an error response.</returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateWorkout(int id, Workout updatedWorkout)
        {
            if (id != updatedWorkout.Id)
            {
                return BadRequest("Workout ID mismatch.");
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var workout = await _context.Workouts.FindAsync(id);

            if (workout == null)
            {
                return NotFound("Workout not found.");
            }

            if (workout.UserId != userId)
            {
                return Forbid("You can only update your own workouts.");
            }

            workout.Exercise = updatedWorkout.Exercise;
            workout.Sets = updatedWorkout.Sets;
            workout.Reps = updatedWorkout.Reps;
            workout.Weight = updatedWorkout.Weight;
            workout.Date = updatedWorkout.Date;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!WorkoutExists(id))
                {
                    return NotFound("Workout not found.");
                }
                throw;
            }

            return NoContent();
        }

        /// <summary>
        /// Deletes a workout for the logged-in user.
        /// </summary>
        /// <param name="id">The ID of the workout to delete.</param>
        /// <returns>No content if successful; otherwise, an error response.</returns>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWorkout(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var workout = await _context.Workouts.FindAsync(id);

            if (workout == null)
            {
                return NotFound("Workout not found.");
            }

            if (workout.UserId != userId)
            {
                return Forbid("You can only delete your own workouts.");
            }

            _context.Workouts.Remove(workout);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool WorkoutExists(int id)
        {
            return _context.Workouts.Any(e => e.Id == id);
        }
    }
}
