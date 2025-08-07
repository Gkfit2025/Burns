'use client'; 

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Heart, Clock, AlertTriangle, CheckCircle, XCircle, RotateCcw, FireExtinguisher, Trophy, Brain, Thermometer, User } from 'lucide-react';
import DifficultySelector from '@/components/difficulty-selector';
import { difficultySettings, getScoreWithMultiplier, getTimeAdjustment } from '@/utils/difficulty-settings';
import type { Scenario, Step, Decision, Outcome, DifficultyLevel } from '@/types/types';

const scenarios: Scenario[] = [
  {
    id: 'rural-kitchen-burn',
    title: 'Rural Kitchen Burn - Rajasthan',
    description: 'A 35-year-old woman from a rural village in Rajasthan sustained burns while cooking on a traditional chulha during summer (45°C).',
    complexity: 6,
    initialStep: 'initial-assessment',
    patientInfo: {
      age: 35,
      weight: 55,
      burnPercentage: 25,
      burnDepth: 'Mixed 2nd and 3rd degree',
      timeFromInjury: '3 hours',
      location: 'Rural Rajasthan',
      climate: 'Hot, dry (45°C)',
    },
    steps: [
      {
        id: 'initial-assessment',
        title: 'Initial Assessment',
        description: 'The patient presents with burns to her arms and torso. She is alert but in pain. Vital signs: HR 110, BP 110/70, RR 20, SpO2 96%. What is your first action?',
        question: 'What is the first step in managing this burn patient?',
        decisions: [
          {
            id: 'assess-burn',
            text: 'Assess burn extent and depth using the Rule of Nines',
            outcome: {
              feedback: 'Correct! Assessing burn extent and depth is critical to determine fluid requirements and severity.',
              nextStep: 'fluid-calculation',
              isCorrect: true,
              scoreChange: 10,
              addTime: 10,
            },
          },
          {
            id: 'pain-relief',
            text: 'Administer pain relief immediately',
            outcome: {
              feedback: 'Incorrect priority. Pain management is important but should follow burn assessment and initial fluid resuscitation.',
              nextStep: 'fluid-calculation',
              isCorrect: false,
              scoreChange: -5,
            },
          },
          {
            id: 'cool-burn',
            text: 'Cool the burn with cold water for 10 minutes',
            outcome: {
              feedback: 'Incorrect timing. Cooling is appropriate within the first hour post-injury. After 3 hours, it may cause hypothermia and delay resuscitation.',
              nextStep: 'fluid-calculation',
              isCorrect: false,
              scoreChange: -10,
            },
          },
        ],
      },
      {
        id: 'fluid-calculation',
        title: 'Fluid Calculation',
        description: 'Using the Rule of Nines, you confirm 25% TBSA burns. The patient weighs 55 kg. The hot climate increases fluid needs.',
        question: 'What is the initial fluid requirement for the first 24 hours using the Parkland formula, considering the hot climate?',
        decisions: [
          {
            id: 'standard-parkland',
            text: '4 ml × 55 kg × 25% = 5,500 ml',
            outcome: {
              feedback: 'Incorrect. The standard Parkland formula doesn’t account for increased fluid losses due to hot climate and delayed presentation.',
              nextStep: 'fluid-administration',
              isCorrect: false,
              scoreChange: -10,
            },
          },
          {
            id: 'adjusted-parkland',
            text: '4 ml × 55 kg × 25% = 5,500 ml + 20% extra for climate = 6,600 ml',
            outcome: {
              feedback: 'Correct! In hot climates like Rajasthan, an additional 15-20% fluid is needed due to increased insensible losses.',
              nextStep: 'fluid-administration',
              isCorrect: true,
              scoreChange: 15,
              addTime: 10,
            },
          },
          {
            id: 'overdose-parkland',
            text: '6 ml × 55 kg × 25% = 8,250 ml',
            outcome: {
              feedback: 'Incorrect. Excessive fluid may lead to overload, pulmonary edema, and compartment syndrome.',
              nextStep: 'fluid-administration',
              isCorrect: false,
              scoreChange: -15,
            },
          },
        ],
      },
      {
        id: 'fluid-administration',
        title: 'Fluid Administration',
        description: 'You’ve calculated the fluid requirement. The patient has been waiting 3 hours since the injury.',
        question: 'How should you administer the calculated fluid volume?',
        decisions: [
          {
            id: 'adjusted-administration',
            text: 'Give half the total volume (3,300 ml) over the next 5 hours, then the rest over 16 hours',
            outcome: {
              feedback: 'Correct! For delayed presentation, adjust the first half of fluids to account for time elapsed (3 hours), giving it over the remaining 5 hours of the first 8-hour period.',
              isGameOver: true,
              isCorrect: true,
              scoreChange: 20,
            },
          },
          {
            id: 'standard-administration',
            text: 'Give half the total volume over the next 8 hours, then the rest over 16 hours',
            outcome: {
              feedback: 'Incorrect. This doesn’t account for the 3-hour delay, risking under-resuscitation in the critical early phase.',
              isGameOver: true,
              isCorrect: false,
              scoreChange: -10,
            },
          },
          {
            id: 'full-volume-now',
            text: 'Give the full volume over the next 5 hours to catch up',
            outcome: {
              feedback: 'Dangerous! Administering the full volume too quickly risks fluid overload and complications like pulmonary edema.',
              isGameOver: true,
              isCorrect: false,
              scoreChange: -20,
            },
          },
        ],
      },
    ],
  },
  {
    id: 'industrial-chemical-burn',
    title: 'Industrial Accident - Mumbai',
    description: 'A 28-year-old factory worker in Mumbai sustained chemical burns during monsoon season (85% humidity, delayed transport).',
    complexity: 8,
    initialStep: 'initial-assessment',
    patientInfo: {
      age: 28,
      weight: 70,
      burnPercentage: 35,
      burnDepth: 'Deep 2nd and 3rd degree',
      timeFromInjury: '5 hours',
      location: 'Mumbai',
      climate: 'Humid monsoon (85% humidity)',
    },
    steps: [
      {
        id: 'initial-assessment',
        title: 'Initial Assessment',
        description: 'The patient presents with chemical burns to the chest and legs, in pain and anxious. Vital signs: HR 120, BP 100/60, RR 22, SpO2 95%. What is your first action?',
        question: 'What is the first step in managing this chemical burn patient?',
        decisions: [
          {
            id: 'decontaminate',
            text: 'Remove contaminated clothing and irrigate with water for 20 minutes',
            outcome: {
              feedback: 'Correct! Immediate decontamination is critical for chemical burns to limit ongoing tissue damage.',
              nextStep: 'burn-assessment',
              isCorrect: true,
              scoreChange: 15,
              addTime: 10,
            },
          },
          {
            id: 'assess-burn',
            text: 'Assess burn extent and depth immediately',
            outcome: {
              feedback: 'Incorrect priority. Decontamination must come first to stop chemical damage before assessing the burn.',
              nextStep: 'burn-assessment',
              isCorrect: false,
              scoreChange: -10,
            },
          },
          {
            id: 'pain-relief',
            text: 'Administer IV pain relief immediately',
            outcome: {
              feedback: 'Incorrect. Pain management is important but secondary to decontamination to prevent further injury.',
              nextStep: 'burn-assessment',
              isCorrect: false,
              scoreChange: -10,
            },
          },
        ],
      },
      {
        id: 'burn-assessment',
        title: 'Burn Assessment',
        description: 'After decontamination, you assess the burn as 35% TBSA, deep 2nd and 3rd degree. The patient weighs 70 kg.',
        question: 'What is the fluid requirement for the first 24 hours using the Parkland formula?',
        decisions: [
          {
            id: 'standard-parkland',
            text: '4 ml × 70 kg × 35% = 9,800 ml',
            outcome: {
              feedback: 'Correct for standard calculation, but you need to consider chemical burn and delayed presentation adjustments.',
              nextStep: 'fluid-adjustment',
              isCorrect: false,
              scoreChange: 5,
            },
          },
          {
            id: 'adjusted-parkland',
            text: '4 ml × 70 kg × 35% = 9,800 ml + 10% for chemical burns = 10,780 ml',
            outcome: {
              feedback: 'Correct! Chemical burns may require additional fluid due to ongoing tissue damage and delayed presentation.',
              nextStep: 'fluid-adjustment',
              isCorrect: true,
              scoreChange: 15,
              addTime: 10,
            },
          },
          {
            id: 'underestimate',
            text: '3 ml × 70 kg × 35% = 7,350 ml',
            outcome: {
              feedback: 'Incorrect. Underestimating fluid needs risks hypovolemic shock, especially with chemical burns.',
              nextStep: 'fluid-adjustment',
              isCorrect: false,
              scoreChange: -15,
            },
          },
        ],
      },
      {
        id: 'fluid-adjustment',
        title: 'Fluid Adjustment for Delay',
        description: 'The patient presented 5 hours post-injury. You’ve calculated 10,780 ml for 24 hours.',
        question: 'How should you adjust fluid administration for this delayed presentation?',
        decisions: [
          {
            id: 'adjusted-administration',
            text: 'Give half (5,390 ml) over the next 3 hours, then the rest over 16 hours, monitor urine output',
            outcome: {
              feedback: 'Correct! Adjust the first half to account for the 5-hour delay, give over remaining 3 hours of the first 8-hour period, and monitor urine output (0.5-1 ml/kg/hr).',
              isGameOver: true,
              isCorrect: true,
              scoreChange: 20,
            },
          },
          {
            id: 'standard-administration',
            text: 'Give half over the next 8 hours, then the rest over 16 hours',
            outcome: {
              feedback: 'Incorrect. This doesn’t account for the 5-hour delay, risking under-resuscitation.',
              isGameOver: true,
              isCorrect: false,
              scoreChange: -10,
            },
          },
          {
            id: 'catch-up',
            text: 'Give the full volume over the next 3 hours to catch up',
            outcome: {
              feedback: 'Dangerous! Rapid infusion risks fluid overload and complications like pulmonary edema.',
              isGameOver: true,
              isCorrect: false,
              scoreChange: -20,
            },
          },
        ],
      },
    ],
  },
  {
    id: 'pediatric-scald-burn',
    title: 'Pediatric Scald - Kerala',
    description: 'A 4-year-old child in Kerala sustained scald burns from hot water during monsoon season (high humidity).',
    complexity: 7,
    initialStep: 'initial-assessment',
    patientInfo: {
      age: 4,
      weight: 18,
      burnPercentage: 20,
      burnDepth: '2nd degree',
      timeFromInjury: '1 hour',
      location: 'Kerala',
      climate: 'Tropical, humid',
    },
    steps: [
      {
        id: 'initial-assessment',
        title: 'Initial Assessment',
        description: 'The child is crying and in pain. Vital signs: HR 140, BP 90/60, RR 28, SpO2 98%. What is your first action?',
        question: 'What is the first step in managing this pediatric burn patient?',
        decisions: [
          {
            id: 'assess-burn',
            text: 'Assess burn extent using pediatric Rule of Nines',
            outcome: {
              feedback: 'Correct! Pediatric burn assessment uses a modified Rule of Nines due to different body proportions.',
              nextStep: 'fluid-calculation',
              isCorrect: true,
              scoreChange: 10,
              addTime: 10,
            },
          },
          {
            id: 'cool-burn',
            text: 'Cool the burn with cold water for 10 minutes',
            outcome: {
              feedback: 'Correct but not first priority. Cooling is appropriate within the first hour, but assessment guides further management.',
              nextStep: 'fluid-calculation',
              isCorrect: false,
              scoreChange: 0,
            },
          },
          {
            id: 'pain-relief',
            text: 'Administer IV pain relief immediately',
            outcome: {
              feedback: 'Incorrect priority. Pain management follows burn assessment and fluid initiation in pediatric patients.',
              nextStep: 'fluid-calculation',
              isCorrect: false,
              scoreChange: -10,
            },
          },
        ],
      },
      {
        id: 'fluid-calculation',
        title: 'Fluid Calculation',
        description: 'You confirm 20% TBSA burns. The child weighs 18 kg.',
        question: 'What is the appropriate fluid management for this pediatric patient?',
        decisions: [
          {
            id: 'adult-parkland',
            text: 'Use adult Parkland: 4 ml × 18 kg × 20% = 1,440 ml',
            outcome: {
              feedback: 'Incorrect. Adult formulas are not suitable for children due to different fluid requirements.',
              nextStep: 'fluid-administration',
              isCorrect: false,
              scoreChange: -10,
            },
          },
          {
            id: 'pediatric-formula',
            text: 'Pediatric formula: 3 ml × 18 kg × 20% = 1,080 ml + maintenance fluids (1,200 ml/day)',
            outcome: {
              feedback: 'Correct! Children require resuscitation fluids (3 ml/kg/% burn) plus maintenance fluids. Total = 2,280 ml/24 hours.',
              nextStep: 'fluid-administration',
              isCorrect: true,
              scoreChange: 15,
              addTime: 10,
            },
          },
          {
            id: 'maintenance-only',
            text: 'Only maintenance fluids (1,200 ml/day)',
            outcome: {
              feedback: 'Incorrect. Burns >15% in children require resuscitation fluids in addition to maintenance.',
              nextStep: 'fluid-administration',
              isCorrect: false,
              scoreChange: -15,
            },
          },
        ],
      },
      {
        id: 'fluid-administration',
        title: 'Fluid Administration',
        description: 'You’ve calculated 2,280 ml total fluids (1,080 ml resuscitation + 1,200 ml maintenance).',
        question: 'How should you administer these fluids?',
        decisions: [
          {
            id: 'correct-administration',
            text: 'Give half resuscitation fluids (540 ml) over 8 hours, plus maintenance (50 ml/hr), monitor urine output',
            outcome: {
              feedback: 'Correct! Pediatric burns require careful administration of resuscitation and maintenance fluids, with close monitoring of urine output (1-2 ml/kg/hr).',
              isGameOver: true,
              isCorrect: true,
              scoreChange: 20,
            },
          },
          {
            id: 'rapid-administration',
            text: 'Give all fluids over the first 8 hours',
            outcome: {
              feedback: 'Incorrect. Rapid administration risks fluid overload in pediatric patients with smaller fluid reserves.',
              isGameOver: true,
              isCorrect: false,
              scoreChange: -20,
            },
          },
          {
            id: 'no-maintenance',
            text: 'Give only resuscitation fluids (1,080 ml) over 24 hours',
            outcome: {
              feedback: 'Incorrect. Omitting maintenance fluids risks dehydration in pediatric patients.',
              isGameOver: true,
              isCorrect: false,
              scoreChange: -15,
            },
          },
        ],
      },
    ],
  },
];

export default function BurnsTrainingApp() {
  const [gameState, setGameState] = useState<{
    currentScenario: string | null;
    currentStep: string | null;
    selectedDifficulty: DifficultyLevel;
    scenarioSelected: boolean;
    timeRemaining: number;
    isTimerActive: boolean;
    score: number;
    gameOver: boolean;
    success: boolean;
    history: string[];
    feedback: { message: string; type: 'success' | 'error' } | null;
    lastDecisionCorrect: boolean | null;
    isExploding: boolean;
  }>({
    currentScenario: null,
    currentStep: null,
    selectedDifficulty: 'intermediate',
    scenarioSelected: false,
    timeRemaining: difficultySettings.intermediate.initialTime,
    isTimerActive: false,
    score: 0,
    gameOver: false,
    success: false,
    history: [],
    feedback: null,
    lastDecisionCorrect: null,
    isExploding: false,
  });
  const [isMounted, setIsMounted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize and persist state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('burnsGameState');
      if (savedState) {
        setGameState(JSON.parse(savedState));
      }
      setIsMounted(true);
    }
  }, []);

  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      localStorage.setItem('burnsGameState', JSON.stringify(gameState));
      console.log('Game state updated:', gameState);
    }
  }, [gameState, isMounted]);

  // Timer effect
  useEffect(() => {
    if (gameState.gameOver) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    } else if (gameState.isTimerActive && gameState.timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setGameState((prev) => ({ ...prev, timeRemaining: prev.timeRemaining - 1 }));
      }, 1000);
    } else if (gameState.timeRemaining === 0 && gameState.isTimerActive) {
      handleTimeout();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
        feedbackTimeoutRef.current = null;
      }
    };
  }, [gameState.isTimerActive, gameState.timeRemaining, gameState.gameOver]);

  const handleTimeout = () => {
    setGameState((prev) => ({
      ...prev,
      isTimerActive: false,
      gameOver: true,
      feedback: {
        message: 'Time’s up! In burn management, timely fluid resuscitation is critical. The patient’s condition has deteriorated.',
        type: 'error',
      },
      currentScenario: null,
    }));
  };

  const selectScenario = (scenarioId: string) => {
    setGameState((prev) => ({
      ...prev,
      currentScenario: scenarioId,
      scenarioSelected: true,
    }));
  };

  const startNewScenario = () => {
    const scenario = scenarios.find((s) => s.id === gameState.currentScenario);
    if (!scenario) return;

    setGameState((prev) => ({
      ...prev,
      currentStep: scenario.initialStep,
      timeRemaining: difficultySettings[prev.selectedDifficulty].initialTime,
      isTimerActive: true,
      score: 0,
      gameOver: false,
      success: false,
      history: [scenario.title],
      feedback: null,
      lastDecisionCorrect: null,
      scenarioSelected: false,
      isExploding: false,
    }));
  };

  const handleDecision = (decision: Decision) => {
    const scenario = scenarios.find((s) => s.id === gameState.currentScenario);
    if (!scenario || !gameState.currentStep) return;

    const step = scenario.steps.find((s) => s.id === gameState.currentStep);
    if (!step) return;

    const outcome = step.decisions.find((d) => d.id === decision.id)?.outcome;
    if (!outcome) return;

    setGameState((prev) => ({
      ...prev,
      history: [...prev.history, decision.text],
      lastDecisionCorrect: outcome.isCorrect,
      feedback: {
        message: `${outcome.feedback} (${outcome.scoreChange > 0 ? '+' : ''}${outcome.scoreChange} points)`,
        type: outcome.isCorrect ? 'success' : 'error',
      },
    }));

    processOutcome(outcome, scenario.complexity);
  };

  const processOutcome = (outcome: Outcome, complexity: number) => {
    const adjustedScoreChange = getScoreWithMultiplier(outcome.scoreChange, gameState.selectedDifficulty, complexity);

    setGameState((prev) => ({
      ...prev,
      score: prev.score + adjustedScoreChange,
    }));

    if (outcome.isGameOver) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setGameState((prev) => ({
        ...prev,
        isTimerActive: false,
        gameOver: true,
        success: outcome.isCorrect,
        isExploding: outcome.isCorrect ? true : prev.isExploding,
      }));

      if (outcome.isCorrect) {
        setTimeout(() => setGameState((prev) => ({ ...prev, isExploding: false })), 3000);
      }

      feedbackTimeoutRef.current = setTimeout(() => {
        setGameState((prev) => ({ ...prev, currentScenario: null }));
      }, 1500);
      return;
    }

    setGameState((prev) => ({
      ...prev,
      currentStep: outcome.nextStep || null,
      timeRemaining: outcome.addTime
        ? prev.timeRemaining + getTimeAdjustment(outcome.addTime, prev.selectedDifficulty)
        : prev.timeRemaining,
    }));
  };

  const resetToScenarioSelection = () => {
    setGameState((prev) => ({
      ...prev,
      currentScenario: null,
      currentStep: null,
      scenarioSelected: false,
      gameOver: false,
      feedback: null,
    }));
    if (typeof window !== 'undefined') {
      localStorage.removeItem('burnsGameState');
    }
  };

  if (!isMounted) {
    return null;
  }

  const renderGameOver = () => {
    return (
      <div className="space-y-4">
        <div className="flex justify-center">🎉 Success!</div>
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <Trophy className="h-16 w-16 text-yellow-500" />
            </div>
            <CardTitle className="text-2xl">
              {gameState.success ? 'Success!' : 'Training Complete'}
            </CardTitle>
            <CardDescription>
              {gameState.success
                ? 'You successfully managed the burn case!'
                : 'Review the feedback and try again to improve your skills.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-3xl font-bold text-green-600">{gameState.score} points</div>
              <p className="text-lg">
                {gameState.score >= 45
                  ? 'Excellent! You’ve mastered burn fluid management.'
                  : gameState.score >= 30
                  ? 'Good job! You have a solid understanding.'
                  : 'Keep practicing! Review the educational content.'}
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={resetToScenarioSelection} variant="outline">
                  Back to Scenarios
                </Button>
                <Button onClick={startNewScenario}>Restart Scenario</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderScenarioSelection = () => {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Select a Scenario</h3>
        <div className="grid gap-3">
          {scenarios.map((scenario) => (
            <Button
              key={scenario.id}
              variant="outline"
              className="justify-start text-left h-auto py-3 px-4 whitespace-normal bg-white hover:bg-gray-100 text-gray-900 border border-gray-300 shadow-sm"
              onClick={() => selectScenario(scenario.id)}
            >
              <div className="w-full">
                <div className="font-medium break-words">{scenario.title}</div>
                <div className="text-sm text-gray-600 mt-1 break-words">{scenario.description}</div>
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    Complexity: {scenario.complexity}/10
                  </span>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </div>
    );
  };

  const renderDifficultySelection = () => {
    return (
      <div className="space-y-4">
        <DifficultySelector
          selectedDifficulty={gameState.selectedDifficulty}
          onSelectDifficulty={(difficulty) =>
            setGameState((prev) => ({ ...prev, selectedDifficulty: difficulty }))
          }
        />
        <div className="flex gap-2">
          <Button onClick={resetToScenarioSelection} variant="outline">
            Back to Scenarios
          </Button>
          <Button onClick={startNewScenario}>Start Scenario</Button>
        </div>
      </div>
    );
  };

  const renderCurrentStep = () => {
    const scenario = scenarios.find((s) => s.id === gameState.currentScenario);
    if (!scenario || !gameState.currentStep) return null;

    const step = scenario.steps.find((s) => s.id === gameState.currentStep);
    if (!step) return null;

    return (
      <div className="grid md:grid-cols-2 gap-6">
        {/* Patient Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {scenario.title}
            </CardTitle>
            <CardDescription>{scenario.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Age:</strong> {scenario.patientInfo.age} years</div>
              <div><strong>Weight:</strong> {scenario.patientInfo.weight} kg</div>
              <div><strong>Burn %:</strong> {scenario.patientInfo.burnPercentage}%</div>
              <div><strong>Depth:</strong> {scenario.patientInfo.burnDepth}</div>
              <div><strong>Time:</strong> {scenario.patientInfo.timeFromInjury}</div>
              <div className="flex items-center gap-1">
                <Thermometer className="h-4 w-4" />
                {scenario.patientInfo.climate}
              </div>
            </div>
            <Badge variant="outline" className="w-fit">{scenario.patientInfo.location}</Badge>
          </CardContent>
        </Card>

        {/* Question and Decisions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Clinical Decision
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-medium">{step.question}</p>
            <div className="space-y-3">
              {step.decisions.map((decision) => (
                <div
                  key={decision.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    gameState.lastDecisionCorrect !== null &&
                    decision.outcome.isCorrect
                      ? 'border-green-500 bg-green-50'
                      : gameState.lastDecisionCorrect === false &&
                        gameState.feedback &&
                        decision.id === gameState.history[gameState.history.length - 1]
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => !gameState.feedback && handleDecision(decision)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                        gameState.feedback && decision.outcome.isCorrect
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-gray-300'
                      }`}
                    >
                      {decision.id.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p>{decision.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-4 px-2 sm:py-8 sm:px-4 max-w-full sm:max-w-4xl bg-gradient-to-br from-blue-50 to-green-50">
      <Card className="border-2 border-blue-200 shadow-lg overflow-hidden bg-white">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div>
              <CardTitle className="text-xl sm:text-2xl flex items-center text-gray-900">
                <Heart className="mr-2 h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
                Burns Fluid Management Trainer
              </CardTitle>
              <CardDescription className="mt-1 text-gray-600">
                {gameState.currentScenario
                  ? 'Interactive training for burn fluid management in Indian settings'
                  : 'Select a scenario to begin training'}
              </CardDescription>
            </div>
            {gameState.currentScenario && (
              <div className="flex flex-col sm:flex-row gap-2 items-end sm:items-center">
                <Badge variant="outline" className="text-base px-2 py-1 bg-white text-blue-700 border-blue-300">
                  <FireExtinguisher className="mr-1 h-4 w-4 text-blue-500" />
                  Score: {gameState.score}
                </Badge>
                <Badge
                  variant="outline"
                  className={`text-sm px-2 py-1 bg-white ${
                    gameState.selectedDifficulty === 'beginner'
                      ? 'text-green-700 border-green-300'
                      : gameState.selectedDifficulty === 'intermediate'
                      ? 'text-blue-700 border-blue-300'
                      : 'text-red-700 border-red-300'
                  }`}
                >
                  {gameState.selectedDifficulty === 'beginner' && <Brain className="mr-1 h-3 w-3 text-green-600" />}
                  {gameState.selectedDifficulty === 'intermediate' && <Clock className="mr-1 h-3 w-3 text-blue-600" />}
                  {gameState.selectedDifficulty === 'advanced' && <Trophy className="mr-1 h-3 w-3 text-red-600" />}
                  {difficultySettings[gameState.selectedDifficulty].label}
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:pt-6 sm:px-6 bg-white">
          {gameState.gameOver && renderGameOver()}
          {!gameState.gameOver &&
            (gameState.scenarioSelected
              ? renderDifficultySelection()
              : gameState.currentScenario
              ? (
                <>
                  <div className="mb-4 sm:mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium flex items-center text-gray-700">
                        <Clock className="mr-1 h-4 w-4 text-gray-500" /> Time Remaining
                      </span>
                      <span className="text-sm font-medium text-gray-700">{gameState.timeRemaining}s</span>
                    </div>
                    <Progress
                      value={(gameState.timeRemaining / difficultySettings[gameState.selectedDifficulty].initialTime) * 100}
                      className={`h-2 ${
                        gameState.selectedDifficulty === 'beginner'
                          ? 'bg-green-100'
                          : gameState.selectedDifficulty === 'intermediate'
                          ? 'bg-blue-100'
                          : 'bg-red-100'
                      }`}
                    />
                  </div>

                  {gameState.feedback && (
                    <Alert
                      variant={gameState.feedback.type === 'error' ? 'destructive' : 'default'}
                      className={`mb-4 sm:mb-6 ${
                        gameState.feedback.type === 'error'
                          ? 'bg-red-50 text-red-900 border-red-200'
                          : 'bg-green-50 text-green-900 border-green-200'
                      }`}
                    >
                      <AlertTitle className={gameState.feedback.type === 'error' ? 'text-red-900' : 'text-green-900'}>
                        {gameState.feedback.type === 'success' ? (
                          <CheckCircle className="h-4 w-4 inline mr-2 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 inline mr-2 text-red-600" />
                        )}
                        {gameState.feedback.type === 'success' ? 'Correct Decision' : 'Incorrect Decision'}
                      </AlertTitle>
                      <AlertDescription
                        className={`break-words ${gameState.feedback.type === 'error' ? 'text-red-800' : 'text-green-800'}`}
                      >
                        {gameState.feedback.message}
                      </AlertDescription>
                    </Alert>
                  )}

                  {renderCurrentStep()}
                </>
              )
              : renderScenarioSelection())}
        </CardContent>

        {gameState.currentScenario && (
          <CardFooter className="flex-col items-start border-t bg-gray-50 p-4 sm:px-6 sm:py-4">
            <h4 className="text-sm font-semibold mb-2 text-gray-900">Decision History:</h4>
            <div className="w-full space-y-1">
              {gameState.history.map((item, index) => (
                <div
                  key={index}
                  className="text-xs px-2 py-1 rounded bg-gray-100 border border-gray-200 break-words text-gray-800"
                >
                  {index + 1}. {item}
                </div>
              ))}
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
