// components/difficulty-selector.tsx
"use client"
import { Card } from "@/components/ui/card"
import { difficultySettings } from "@/utils/difficulty-settings"
import type { DifficultyLevel } from "@/types/types"
import { Brain, Clock, Trophy } from "lucide-react"

interface DifficultyCardProps {
  difficulty: DifficultyLevel
  isSelected: boolean
  onSelect: (difficulty: DifficultyLevel) => void
}

const DifficultyCard = ({ difficulty, isSelected, onSelect }: DifficultyCardProps) => {
  const settings = difficultySettings[difficulty]

  const getBgColor = () => {
    if (isSelected) {
      switch (settings.color) {
        case "green":
          return "bg-green-100 border-green-500"
        case "blue":
          return "bg-blue-100 border-blue-500"
        case "red":
          return "bg-red-100 border-red-500"
        default:
          return "bg-blue-100 border-blue-500"
      }
    }
    return "bg-white border-gray-200 hover:border-gray-300"
  }

  const getIconColor = () => {
    switch (settings.color) {
      case "green":
        return "text-green-600"
      case "blue":
        return "text-blue-600"
      case "red":
        return "text-red-600"
      default:
        return "text-blue-600"
    }
  }

  return (
    <Card
      className={`p-4 cursor-pointer border-2 transition-all ${getBgColor()} ${isSelected ? "shadow-md" : "shadow-sm"}`}
      onClick={() => onSelect(difficulty)}
    >
      <div className="flex items-start space-x-3">
        <div className={`mt-1 ${getIconColor()}`}>
          {difficulty === "beginner" && <Brain size={24} />}
          {difficulty === "intermediate" && <Clock size={24} />}
          {difficulty === "advanced" && <Trophy size={24} />}
        </div>
        <div>
          <h3 className="font-bold text-gray-900">{settings.label}</h3>
          <div className="mt-1 text-sm text-gray-600">{settings.description}</div>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Time: {settings.initialTime}s
            </span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Score: {settings.scoreMultiplier}x
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}

interface DifficultySelectorProps {
  selectedDifficulty: DifficultyLevel
  onSelectDifficulty: (difficulty: DifficultyLevel) => void
}

export default function DifficultySelector({ selectedDifficulty, onSelectDifficulty }: DifficultySelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Select Difficulty Level</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        {(Object.keys(difficultySettings) as DifficultyLevel[]).map((level) => (
          <DifficultyCard
            key={level}
            difficulty={level}
            isSelected={selectedDifficulty === level}
            onSelect={onSelectDifficulty}
          />
        ))}
      </div>
    </div>
  )
}
