"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Competitor {
  rank: number
  brand: string
  mentions: number
  position: number
  change: number
  visibility: number
}

interface CompetitorRankingProps {
  data: Competitor[]
  currentScore: number
  change: number
}

export function CompetitorRanking({ data, currentScore, change }: CompetitorRankingProps) {
  const isPositive = change >= 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Industry Ranking</CardTitle>
        <CardDescription>Brands with highest visibility</CardDescription>
        <div className="flex items-baseline gap-2 mt-4">
          <div className="text-4xl font-bold">{currentScore}%</div>
          <div className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{change}% vs yesterday
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Header */}
          <div className="grid grid-cols-[40px_1fr_80px_80px_80px_80px] gap-4 text-xs font-medium text-muted-foreground border-b pb-2">
            <div>#</div>
            <div>BRAND</div>
            <div className="text-right">MENTIONS</div>
            <div className="text-right">POSITION</div>
            <div className="text-right">CHANGE</div>
            <div className="text-right">VISIBILITY</div>
          </div>

          {/* Rows */}
          {data.map((competitor) => (
            <div
              key={competitor.rank}
              className="grid grid-cols-[40px_1fr_80px_80px_80px_80px] gap-4 items-center text-sm"
            >
              <div className="font-medium">{competitor.rank}</div>
              <div className="font-medium">{competitor.brand}</div>
              <div className="text-right">{competitor.mentions}</div>
              <div className="text-right">{competitor.position.toFixed(1)}</div>
              <div className="text-right">
                <span className={competitor.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {competitor.change >= 0 ? '+' : ''}{competitor.change}%
                </span>
              </div>
              <div className="text-right font-semibold">{competitor.visibility}%</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
