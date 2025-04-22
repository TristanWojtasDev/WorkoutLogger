namespace WorkoutLogger.Server.Models
{
    public class Workout
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public string Exercise { get; set; }
        public int Sets { get; set; }
        public int Reps { get; set; }
        public double Weight { get; set; }
        public DateTime Date { get; set; }
    }
}
