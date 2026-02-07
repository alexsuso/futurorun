
import { RunningRoute, TrainingGoal } from './types';

export const ROUTES: RunningRoute[] = [
  {
    id: 'cangas-1',
    name: 'Paseo de Rodeira',
    location: 'Cangas',
    distance: 4.5,
    elevation: 10,
    difficulty: 'Fácil',
    description: 'Ruta llana al borde del mar, ideal para rodajes suaves y series cortas.',
    coordinates: [42.261, -8.781]
  },
  {
    id: 'cangas-2',
    name: 'Monte do Facho',
    location: 'Cangas',
    distance: 8.2,
    elevation: 160,
    difficulty: 'Difícil',
    description: 'Ascenso técnico con vistas espectaculares de las Cíes. Terreno mixto.',
    coordinates: [42.275, -8.847]
  },
  {
    id: 'moana-1',
    name: 'Paseo Marítimo Moaña',
    location: 'Moaña',
    distance: 5.0,
    elevation: 5,
    difficulty: 'Fácil',
    description: 'Totalmente llano, perfecto para principiantes o recuperación activa.',
    coordinates: [42.288, -8.728]
  },
  {
    id: 'moana-2',
    name: 'Ruta dos Muíños',
    location: 'Moaña',
    distance: 6.5,
    elevation: 220,
    difficulty: 'Moderada',
    description: 'Sendero natural siguiendo el río. Sombra constante y terreno blando.',
    coordinates: [42.295, -8.715]
  }
];

export const GOAL_DESCRIPTIONS: Record<TrainingGoal, string> = {
  [TrainingGoal.HEALTH]: 'Mantenerte activo y mejorar tu salud cardiovascular.',
  [TrainingGoal.WEIGHT_LOSS]: 'Optimizar la quema de grasas mediante rodajes en zona 2.',
  [TrainingGoal.FIVE_K]: 'Preparar tu primera carrera de 5 kilómetros.',
  [TrainingGoal.TEN_K]: 'Aumentar tu resistencia para completar 10 kilómetros.',
  [TrainingGoal.PB_IMPROVEMENT]: 'Entrenamientos de calidad para pulverizar tus récords.',
};
