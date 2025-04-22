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

        public WorkoutsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Workout>>> GetWorkouts()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return await _context.Workouts
                .Where(w => w.UserId == userId)
                .ToListAsync();
        }

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
