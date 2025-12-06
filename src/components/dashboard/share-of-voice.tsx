"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ShareOfVoiceProps {
  percentage: number
  change: number
  competitors: Array<{ brand: string; mentions: number; share: number }>
}

export function ShareOfVoice({ percentage, change, competitors }: ShareOfVoiceProps) {
  const isPositive = change >= 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Share of Voice</CardTitle>
        <CardDescription>
          Mentions of Searchable in AI-generated answers in relation to competitors.
        </CardDescription>
        <div className="flex items-baseline gap-2 mt-4">
          <div className="text-4xl font-bold">{percentage}%</div>
          <div className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{change}% vs yesterday
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {competitors.map((competitor, index) => (
            <div key={competitor.brand} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{competitor.brand}</span>
                <span className="text-muted-foreground">{competitor.share}%</span>
              </div>
              <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-400"
                  style={{ width: `${competitor.share}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
