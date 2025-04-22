using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using WorkoutLogger.Server.Models;

namespace WorkoutLogger.Server.Data
{
    public class ApplicationDbContext : IdentityDbContext<IdentityUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // Optional: Add your own DbSets here
        // public DbSet<YourEntity> YourEntities { get; set; }
        public DbSet<Workout> Workouts { get; set; }

    }
}
