'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Heart, Thermometer, User, Award, RotateCcw } from 'lucide-react';

interface Scenario {
  id: string;
  title: string;
  description: string;
  patientInfo: {
    age: number;
    weight: number;
    burnPercentage: number;
    burnDepth: string;
    timeFromInjury: string;
    location: string;
    climate: string;
  };
  question: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
    consequences?: string;
  }[];
  educationalContent: string;
}

interface GameState {
  currentScenario: number;
  selectedOption: string | null;
  showResult: boolean;
  score: number;
  completedScenarios: string[];
}

const scenarios: Scenario[] = [
  {
    id: "scenario1",
    title: "Rural Kitchen Burn - Rajasthan",
    description: "A 35-year-old woman from a rural village in Rajasthan sustained burns while cooking on a traditional chulha. The accident occurred during summer with ambient temperature of 45°C.",
    patientInfo: {
      age: 35,
      weight: 55,
      burnPercentage: 25,
      burnDepth: "Mixed 2nd and 3rd degree",
      timeFromInjury: "3 hours",
      location: "Rural Rajasthan",
      climate: "Hot, dry (45°C)"
    },
    question: "What is the initial fluid requirement for the first 24 hours using the Parkland formula, considering the hot climate?",
    options: [
      {
        id: "a",
        text: "4 ml × 55 kg × 25% = 5,500 ml",
        isCorrect: false,
        explanation: "This is the standard Parkland formula but doesn't account for increased fluid losses due to hot climate and delayed presentation.",
        consequences: "Patient may develop hypovolemic shock due to inadequate fluid replacement."
      },
      {
        id: "b",
        text: "4 ml × 55 kg × 25% = 5,500 ml + 20% extra for climate = 6,600 ml",
        isCorrect: true,
        explanation: "Correct! In hot climates like Rajasthan, additional 15-20% fluid is needed due to increased insensible losses and dehydration.",
        consequences: "Good fluid management prevents shock and maintains adequate perfusion."
      },
      {
        id: "c",
        text: "6 ml × 55 kg × 25% = 8,250 ml",
        isCorrect: false,
        explanation: "This is excessive and may lead to fluid overload, pulmonary edema, and compartment syndrome.",
        consequences: "Risk of fluid overload complications including respiratory distress."
      }
    ],
    educationalContent: "In Indian conditions, especially in hot climates, burn patients have increased fluid requirements due to: 1) Higher insensible losses, 2) Pre-existing dehydration, 3) Delayed presentation to healthcare facilities."
  },
  {
    id: "scenario2",
    title: "Industrial Accident - Mumbai",
    description: "A 28-year-old factory worker in Mumbai sustained chemical burns during monsoon season. High humidity (85%) and delayed transport due to traffic.",
    patientInfo: {
      age: 28,
      weight: 70,
      burnPercentage: 35,
      burnDepth: "Deep 2nd and 3rd degree",
      timeFromInjury: "5 hours",
      location: "Mumbai",
      climate: "Humid monsoon (85% humidity)"
    },
    question: "How should you modify fluid management for this delayed presentation with chemical burns?",
    options: [
      {
        id: "a",
        text: "Give remaining fluid over next 19 hours as per standard protocol",
        isCorrect: false,
        explanation: "This doesn't account for the 5-hour delay and chemical burn complications.",
        consequences: "Inadequate resuscitation may lead to acute kidney injury."
      },
      {
        id: "b",
        text: "Calculate total 24-hour requirement, subtract estimated losses, give remainder over 19 hours + monitor urine output",
        isCorrect: true,
        explanation: "Correct approach for delayed presentation. Monitor urine output (0.5-1 ml/kg/hr) and adjust accordingly.",
        consequences: "Proper fluid balance maintained with good organ perfusion."
      },
      {
        id: "c",
        text: "Start fresh 24-hour protocol regardless of delay",
        isCorrect: false,
        explanation: "This would result in massive fluid overload as the patient has already lost significant fluid.",
        consequences: "Severe fluid overload leading to pulmonary edema and cardiac complications."
      }
    ],
    educationalContent: "Chemical burns require special consideration: 1) Continued tissue damage increases fluid requirements, 2) Nephrotoxic effects need monitoring, 3) Humid conditions reduce evaporative losses but increase infection risk."
  },
  {
    id: "scenario3",
    title: "Pediatric Scald - Kerala",
    description: "A 4-year-old child in Kerala sustained scald burns from hot water. Tropical climate with high humidity during monsoon season.",
    patientInfo: {
      age: 4,
      weight: 18,
      burnPercentage: 20,
      burnDepth: "2nd degree",
      timeFromInjury: "1 hour",
      location: "Kerala",
      climate: "Tropical, humid"
    },
    question: "What is the appropriate fluid management for this pediatric patient?",
    options: [
      {
        id: "a",
        text: "Use adult Parkland formula: 4 ml × 18 kg × 20% = 1,440 ml",
        isCorrect: false,
        explanation: "Adult formulas are not appropriate for children. Pediatric patients have different fluid requirements.",
        consequences: "May lead to inadequate resuscitation in children."
      },
      {
        id: "b",
        text: "Pediatric formula: 3 ml × 18 kg × 20% = 1,080 ml + maintenance fluids (1,200 ml/day)",
        isCorrect: true,
        explanation: "Correct! Children need both resuscitation fluids AND maintenance fluids. Total = 2,280 ml/24 hours.",
        consequences: "Appropriate fluid balance for pediatric physiology."
      },
      {
        id: "c",
        text: "Only maintenance fluids needed for burns <25%",
        isCorrect: false,
        explanation: "Even burns >15% in children require specific burn resuscitation fluids in addition to maintenance.",
        consequences: "Inadequate resuscitation leading to shock and organ failure."
      }
    ],
    educationalContent: "Pediatric burn fluid management: 1) Use 3 ml/kg/% burn for resuscitation, 2) ALWAYS add maintenance fluids, 3) Monitor more closely due to smaller fluid reserves, 4) Consider higher surface area to body weight ratio."
  }
]

export default function BurnsTrainingApp() {
  const [gameState, setGameState] = useState<GameState>({
    currentScenario: 0,
    selectedOption: null,
    showResult: false,
    score: 0,
    completedScenarios: [],
  });
  const [isMounted, setIsMounted] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('burnsGameState');
      if (savedState) {
        setGameState(JSON.parse(savedState));
      }
      setIsMounted(true);
    }
  }, []);

  // Save state to localStorage on update
  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      localStorage.setItem('burnsGameState', JSON.stringify(gameState));
      console.log('Game state updated:', gameState);
    }
  }, [gameState, isMounted]);

  const handleOptionSelect = (optionId: string) => {
    setGameState((prev) => ({ ...prev, selectedOption: optionId }));
  };

  const handleSubmit = () => {
    if (!gameState.selectedOption) return;

    const scenario = scenarios[gameState.currentScenario];
    const option = scenario.options.find((opt) => opt.id === gameState.selectedOption);
    setGameState((prev) => ({
      ...prev,
      score: option?.isCorrect ? prev.score + 1 : prev.score,
      completedScenarios: [...prev.completedScenarios, scenario.id],
      showResult: true,
    }));
  };

  const handleNext = () => {
    setGameState((prev) => {
      const nextScenario = prev.currentScenario + 1;
      if (nextScenario < scenarios.length) {
        return {
          ...prev,
          currentScenario: nextScenario,
          selectedOption: null,
          showResult: false,
        };
      }
      return {
        ...prev,
        currentScenario: scenarios.length, // Explicitly set to trigger Results
        selectedOption: null,
        showResult: false,
      };
    });
  };

  const handleRestart = () => {
    setGameState({
      currentScenario: 0,
      selectedOption: null,
      showResult: false,
      score: 0,
      completedScenarios: [],
    });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('burnsGameState');
    }
  };

  // Prevent rendering until mounted to avoid hydration issues
  if (!isMounted) {
    return null;
  }

  // Results page
  if (gameState.completedScenarios.length >= scenarios.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <Award className="h-16 w-16 text-yellow-500" />
              </div>
              <CardTitle className="text-3xl">Training Complete!</CardTitle>
              <CardDescription className="text-lg">
                You've completed all burn fluid management scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-4xl font-bold text-green-600">
                  {gameState.score}/{scenarios.length}
                </div>
                <p className="text-lg">
                  {gameState.score === scenarios.length
                    ? 'Perfect Score! Excellent understanding of burn fluid management.'
                    : gameState.score >= scenarios.length * 0.7
                    ? 'Good job! You have a solid grasp of the concepts.'
                    : 'Keep practicing! Review the educational content and try again.'}
                </p>
                <Button onClick={handleRestart} className="mt-4">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Start Over
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const scenario = scenarios[gameState.currentScenario];
  const selectedOptionData = scenario.options.find((opt) => opt.id === gameState.selectedOption);
  const progress = ((gameState.currentScenario + (gameState.showResult ? 1 : 0)) / scenarios.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-6 w-6 text-red-500" />
                  Burns Fluid Management Training
                </CardTitle>
                <CardDescription>Interactive scenarios for Indian healthcare settings</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Score</div>
                <div className="text-2xl font-bold">
                  {gameState.score}/{scenarios.length}
                </div>
              </div>
            </div>
            <Progress value={progress} className="mt-4" />
            <div className="text-sm text-muted-foreground">
              Scenario {gameState.currentScenario + 1} of {scenarios.length}
            </div>
          </CardHeader>
        </Card>

        {/* Scenario */}
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
                <div>
                  <strong>Age:</strong> {scenario.patientInfo.age} years
                </div>
                <div>
                  <strong>Weight:</strong> {scenario.patientInfo.weight} kg
                </div>
                <div>
                  <strong>Burn %:</strong> {scenario.patientInfo.burnPercentage}%
                </div>
                <div>
                  <strong>Depth:</strong> {scenario.patientInfo.burnDepth}
                </div>
                <div>
                  <strong>Time:</strong> {scenario.patientInfo.timeFromInjury}
                </div>
                <div className="flex items-center gap-1">
                  <Thermometer className="h-4 w-4" />
                  {scenario.patientInfo.climate}
                </div>
              </div>
              <Badge variant="outline" className="w-fit">
                {scenario.patientInfo.location}
              </Badge>
            </CardContent>
          </Card>

          {/* Question and Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Clinical Decision
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="font-medium">{scenario.question}</p>
              <div className="space-y-3">
                {scenario.options.map((option) => (
                  <div
                    key={option.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      gameState.selectedOption === option.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${
                      gameState.showResult && option.isCorrect
                        ? 'border-green-500 bg-green-50'
                        : gameState.showResult && gameState.selectedOption === option.id && !option.isCorrect
                        ? 'border-red-500 bg-red-50'
                        : ''
                    }`}
                    onClick={() => !gameState.showResult && handleOptionSelect(option.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                          gameState.selectedOption === option.id
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-gray-300'
                        }`}
                      >
                        {option.id.toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p>{option.text}</p>
                        {gameState.showResult && gameState.selectedOption === option.id && (
                          <div className="mt-2 space-y-2">
                            <p className={`text-sm ${option.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                              <strong>{option.isCorrect ? '✓ Correct!' : '✗ Incorrect'}</strong>
                            </p>
                            <p className="text-sm text-gray-600">{option.explanation}</p>
                            {option.consequences && (
                              <p className="text-sm text-orange-600">
                                <strong>Clinical Impact:</strong> {option.consequences}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                {!gameState.showResult ? (
                  <Button onClick={handleSubmit} disabled={!gameState.selectedOption} className="w-full">
                    Submit Answer
                  </Button>
                ) : (
                  <Button onClick={handleNext} className="w-full">
                    {gameState.currentScenario < scenarios.length - 1 ? 'Next Scenario' : 'View Results'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Educational Content */}
        {gameState.showResult && (
          <Card>
            <CardHeader>
              <CardTitle>Educational Content</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{scenario.educationalContent}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
