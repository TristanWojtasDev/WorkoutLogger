export enum WorkoutType {
  Workout = 'Workout',
  Cardio = 'Cardio',
  WeighIn = 'WeighIn'
}

export interface Workout {
  id?: number;
  userId?: string;
  date?: string;
  type: WorkoutType;
  exercise?: string;
  sets?: number | null;
  reps?: number | null;
  weight?: number | null;
  miles?: number | null;
  time?: string | null; // TimeSpan will be serialized as a string (e.g., "00:30:00")
}
