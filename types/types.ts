// types.ts
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Scenario {
  id: string;
  title: string;
  description: string;
  complexity: number;
  initialStep: string;
  patientInfo: {
    age: number;
    weight: number;
    burnPercentage: number;
    burnDepth: string;
    timeFromInjury: string;
    location: string;
    climate: string;
  };
  steps: Step[];
}

export interface Step {
  id: string;
  title: string;
  description: string;
  question: string;
  decisions: Decision[];
}

export interface Decision {
  id: string;
  text: string;
  isUrgent?: boolean;
  outcome: Outcome;
}

export interface Outcome {
  feedback: string;
  nextStep?: string;
  isGameOver?: boolean;
  isCorrect: boolean;
  scoreChange: number;
  addTime?: number;
}
