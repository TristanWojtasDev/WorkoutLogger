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
        /// Fetches all records (Workouts, Cardio, Weigh-Ins) for the logged-in user.
        /// </summary>
        /// <returns>A list of records, ordered by Date and Type (WeighIn, Cardio, Workout).</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Workout>>> GetWorkouts()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return await _context.Workouts
                .Where(w => w.UserId == userId)
                .OrderBy(w => w.Date)
                .ThenBy(w => w.Type) // WeighIn (0), Cardio (1), Workout (2)
                .ToListAsync();
        }

        /// <summary>
        /// Creates a new record (Workout, Cardio, or Weigh-In) for the logged-in user.
        /// </summary>
        /// <param name="workout">The record data to create.</param>
        /// <returns>The created record with its ID.</returns>
        [HttpPost]
        public async Task<ActionResult<Workout>> CreateWorkout([FromBody] Workout workout)
        {
            if (workout == null)
            {
                return BadRequest("Request body is empty or invalid.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Validate fields based on Type
            if (workout.Type == WorkoutType.Workout)
            {
                if (string.IsNullOrEmpty(workout.Exercise) || workout.Sets == null || workout.Sets <= 0 || workout.Reps == null || workout.Reps <= 0 || workout.Weight == null)
                {
                    return BadRequest("Workout requires Exercise, Sets (>0), Reps (>0), and Weight.");
                }
                workout.Miles = null;
                workout.Time = null;
            }
            else if (workout.Type == WorkoutType.Cardio)
            {
                if (string.IsNullOrEmpty(workout.Exercise) || workout.Miles == null || workout.Miles <= 0 || workout.Time == null)
                {
                    return BadRequest("Cardio requires Exercise, Miles (>0), and Time.");
                }
                workout.Sets = null;
                workout.Reps = null;
                workout.Weight = null;
            }
            else if (workout.Type == WorkoutType.WeighIn)
            {
                if (workout.Weight == null || workout.Weight <= 0)
                {
                    return BadRequest("Weigh-In requires Weight (>0).");
                }
                workout.Exercise = null;
                workout.Sets = null;
                workout.Reps = null;
                workout.Miles = null;
                workout.Time = null;
            }
            else
            {
                return BadRequest("Invalid Type value.");
            }

            workout.UserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            workout.Date = DateTime.UtcNow;
            _context.Workouts.Add(workout);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetWorkouts), new { id = workout.Id }, workout);
        }

        /// <summary>
        /// Updates an existing record for the logged-in user.
        /// </summary>
        /// <param name="id">The ID of the record to update.</param>
        /// <param name="updatedWorkout">The updated record data.</param>
        /// <returns>No content if successful; otherwise, an error response.</returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateWorkout(int id, Workout updatedWorkout)
        {
            if (id != updatedWorkout.Id)
            {
                return BadRequest("Record ID mismatch.");
            }

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var workout = await _context.Workouts.FindAsync(id);

            if (workout == null)
            {
                return NotFound("Record not found.");
            }

            if (workout.UserId != userId)
            {
                return Forbid("You can only update your own records.");
            }

            // Validate fields based on Type
            if (updatedWorkout.Type == WorkoutType.Workout)
            {
                if (string.IsNullOrEmpty(updatedWorkout.Exercise) || updatedWorkout.Sets == null || updatedWorkout.Sets <= 0 || updatedWorkout.Reps == null || updatedWorkout.Reps <= 0 || updatedWorkout.Weight == null)
                {
                    return BadRequest("Workout requires Exercise, Sets (>0), Reps (>0), and Weight.");
                }
                updatedWorkout.Miles = null;
                updatedWorkout.Time = null;
            }
            else if (updatedWorkout.Type == WorkoutType.Cardio)
            {
                if (string.IsNullOrEmpty(updatedWorkout.Exercise) || updatedWorkout.Miles == null || updatedWorkout.Miles <= 0 || updatedWorkout.Time == null)
                {
                    return BadRequest("Cardio requires Exercise, Miles (>0), and Time.");
                }
                updatedWorkout.Sets = null;
                updatedWorkout.Reps = null;
                updatedWorkout.Weight = null;
            }
            else if (updatedWorkout.Type == WorkoutType.WeighIn)
            {
                if (updatedWorkout.Weight == null || updatedWorkout.Weight <= 0)
                {
                    return BadRequest("Weigh-In requires Weight (>0).");
                }
                updatedWorkout.Exercise = null;
                updatedWorkout.Sets = null;
                updatedWorkout.Reps = null;
                updatedWorkout.Miles = null;
                updatedWorkout.Time = null;
            }

            workout.Type = updatedWorkout.Type;
            workout.Exercise = updatedWorkout.Exercise;
            workout.Sets = updatedWorkout.Sets;
            workout.Reps = updatedWorkout.Reps;
            workout.Weight = updatedWorkout.Weight;
            workout.Miles = updatedWorkout.Miles;
            workout.Time = updatedWorkout.Time;
            workout.Date = updatedWorkout.Date;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!WorkoutExists(id))
                {
                    return NotFound("Record not found.");
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
