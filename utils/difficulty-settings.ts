// utils/difficulty-settings.ts
import { DifficultyLevel } from '@/types/types';

interface DifficultySettings {
  label: string;
  description: string;
  color: string;
  initialTime: number;
  scoreMultiplier: number;
}

export const difficultySettings: Record<DifficultyLevel, DifficultySettings> = {
  beginner: {
    label: 'Beginner',
    description: 'Extended time with forgiving scoring for learning.',
    color: 'green',
    initialTime: 90,
    scoreMultiplier: 0.5,
  },
  intermediate: {
    label: 'Intermediate',
    description: 'Moderate time limits with standard scoring.',
    color: 'blue',
    initialTime: 60,
    scoreMultiplier: 1,
  },
  advanced: {
    label: 'Advanced',
    description: 'Tight time limits with strict scoring for experts.',
    color: 'red',
    initialTime: 45,
    scoreMultiplier: 1.5,
  },
};

export function getScoreWithMultiplier(scoreChange: number, difficulty: DifficultyLevel, scenarioComplexity: number): number {
  return Math.round(scoreChange * difficultySettings[difficulty].scoreMultiplier * (scenarioComplexity / 5));
}

export function getTimeAdjustment(addTime: number, difficulty: DifficultyLevel): number {
  const multiplier = difficulty === 'beginner' ? 1.5 : difficulty === 'intermediate' ? 1 : 0.75;
  return Math.round(addTime * multiplier);
}
