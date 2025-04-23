using System.ComponentModel.DataAnnotations;

namespace WorkoutLogger.Server.Models
{
    public class Workout
    {
        public int Id { get; set; }

        public string? UserId { get; set; }

        public DateTime Date { get; set; }

        [Required(ErrorMessage = "Type is required.")]
        public WorkoutType Type { get; set; }

        // Common fields (used by all types)
        public string? Exercise { get; set; } // Used by Workout and Cardio

        // Workout-specific fields
        public int? Sets { get; set; }
        public int? Reps { get; set; }

        // Cardio-specific fields
        public double? Miles { get; set; } // Used by Cardio
        public TimeSpan? Time { get; set; } // Used by Cardio

        // WeighIn-specific fields
        public double? Weight { get; set; } // Used by Workout and WeighIn
    }
}
