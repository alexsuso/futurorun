
export enum UserLevel {
  BEGINNER = 'Principiante',
  INTERMEDIATE = 'Intermedio',
}

export enum TrainingGoal {
  HEALTH = 'Salud y Bienestar',
  WEIGHT_LOSS = 'Perder Peso',
  FIVE_K = 'Objetivo 5K',
  TEN_K = 'Objetivo 10K',
  PB_IMPROVEMENT = 'Mejorar Tiempos',
}

export interface UserProfile {
  name: string;
  age: number;
  weight: number;
  level: UserLevel;
  experienceYears: number;
  goal: TrainingGoal;
  isRegistered: boolean;
}

export interface TrainingSession {
  day: string;
  type: 'Smooth' | 'Intervals' | 'Tempo' | 'Rest' | 'Long Run';
  description: string;
  durationMinutes: number;
  targetPace?: string;
}

export interface WeeklyPlan {
  weekNumber: number;
  sessions: TrainingSession[];
}

export interface RunRecord {
  id: string;
  date: string;
  distanceKm: number;
  timeSeconds: number;
  calories: number;
  averagePace: string;
}

export interface RunningRoute {
  id: string;
  name: string;
  location: 'Cangas' | 'Moaña';
  distance: number;
  elevation: number;
  difficulty: 'Fácil' | 'Moderada' | 'Difícil';
  description: string;
  coordinates: [number, number];
}
