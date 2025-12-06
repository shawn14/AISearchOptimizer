"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface VisibilityChartProps {
  data: Array<{ date: string; score: number }>
  currentScore: number
  change: number
}

export function VisibilityChart({ data, currentScore, change }: VisibilityChartProps) {
  const isPositive = change >= 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Visibility Score</CardTitle>
        <CardDescription>Trend over the last 7 days</CardDescription>
        <div className="flex items-baseline gap-2 mt-4">
          <div className="text-4xl font-bold">{currentScore}%</div>
          <div className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{change}% vs yesterday
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
              }}
              formatter={(value: number) => [`${value}%`, 'Visibility']}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#f87171"
              strokeWidth={2}
              dot={false}
              fill="url(#colorScore)"
            />
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f87171" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
