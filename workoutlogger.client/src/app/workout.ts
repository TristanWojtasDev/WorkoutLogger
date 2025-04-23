export interface Workout {
  id?: number;
  userId?: string;
  date?: string;
  exercise: string;
  sets?: number | null; // Explicitly allow null
  reps?: number | null; // Explicitly allow null
  weight?: number | null; // Explicitly allow null
}
