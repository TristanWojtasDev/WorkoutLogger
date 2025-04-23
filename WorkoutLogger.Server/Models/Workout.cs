using System.ComponentModel.DataAnnotations;

namespace WorkoutLogger.Server.Models
{
    public class Workout
    {
        public int Id { get; set; }

        public string? UserId { get; set; }

        public DateTime Date { get; set; }

        [Required(ErrorMessage = "Exercise is required.")]
        public string Exercise { get; set; }

        [Required(ErrorMessage = "Sets is required.")]
        [Range(1, int.MaxValue, ErrorMessage = "Sets must be at least 1.")]
        public int Sets { get; set; }

        [Required(ErrorMessage = "Reps is required.")]
        [Range(1, int.MaxValue, ErrorMessage = "Reps must be at least 1.")]
        public int Reps { get; set; }

        [Required(ErrorMessage = "Weight is required.")]
        [Range(0, int.MaxValue, ErrorMessage = "Weight must be at least 0.")]
        public int Weight { get; set; }
    }
}
