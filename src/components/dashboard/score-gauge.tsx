"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ScoreGaugeProps {
  title: string
  description: string
  score: number
  maxScore?: number
}

export function ScoreGauge({ title, description, score, maxScore = 100 }: ScoreGaugeProps) {
  const percentage = (score / maxScore) * 100
  const circumference = 2 * Math.PI * 70
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  // Color based on score
  const getColor = (score: number) => {
    if (score >= 80) return "#10b981" // green
    if (score >= 60) return "#f59e0b" // amber
    return "#ef4444" // red
  }

  const color = getColor(score)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium flex items-center gap-2">
          {title}
          <span className="text-muted-foreground">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 5v3M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          {/* SVG Gauge */}
          <div className="relative w-48 h-48">
            <svg className="transform -rotate-90 w-48 h-48">
              {/* Background circle */}
              <circle
                cx="96"
                cy="96"
                r="70"
                stroke="#e5e7eb"
                strokeWidth="12"
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx="96"
                cy="96"
                r="70"
                stroke={color}
                strokeWidth="12"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{
                  transition: "stroke-dashoffset 0.5s ease",
                }}
              />
            </svg>
            {/* Score text in center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-5xl font-bold">{score}%</div>
            </div>
          </div>

          {/* Description */}
          <CardDescription className="text-center mt-4">
            {description}
          </CardDescription>
        </div>
      </CardContent>
    </Card>
  )
}
