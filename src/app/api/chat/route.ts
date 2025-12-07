import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import fs from "fs"
import path from "path"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { message, context, conversationHistory } = await request.json()

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    // Fetch user data for context
    const dataContext = await fetchUserDataContext(context)

    // Build system prompt with data context
    const systemPrompt = `You are RevIntel's AI assistant, helping users understand their AI search visibility and website analytics data.

Current Page Context: ${context || "dashboard"}

Available Data:
${dataContext}

Your role:
- Answer questions about the user's metrics, trends, and data
- Provide actionable insights and recommendations
- Explain complex concepts in simple terms
- Be concise and helpful
- Use specific numbers from their data when relevant
- Suggest next steps or optimizations

Keep responses brief (2-3 sentences unless more detail is needed).`

    // Build messages array
    const messages: any[] = [
      { role: "system", content: systemPrompt }
    ]

    // Add conversation history (last 4 messages)
    if (conversationHistory && Array.isArray(conversationHistory)) {
      conversationHistory.slice(-4).forEach((msg: any) => {
        messages.push({
          role: msg.role,
          content: msg.content
        })
      })
    }

    // Add current message
    messages.push({
      role: "user",
      content: message
    })

    // Call OpenAI with GPT-4o-mini for cost efficiency
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Cheapest model: $0.150/1M input, $0.600/1M output tokens
      messages,
      temperature: 0.7,
      max_tokens: 500, // Keep responses concise
    })

    const response = completion.choices[0]?.message?.content || "I'm not sure how to help with that."

    return NextResponse.json({
      response,
      usage: completion.usage
    })

  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    )
  }
}

async function fetchUserDataContext(pageContext: string): Promise<string> {
  try {
    // Fetch monitoring data
    const monitoringPath = path.join(process.cwd(), "data", "monitoring-runs.json")
    let monitoringData: any = { runs: [] }
    if (fs.existsSync(monitoringPath)) {
      monitoringData = JSON.parse(fs.readFileSync(monitoringPath, "utf-8"))
    }

    // Fetch audit data
    const auditsPath = path.join(process.cwd(), "data", "page-audits.json")
    let auditsData: any = { audits: [] }
    if (fs.existsSync(auditsPath)) {
      auditsData = JSON.parse(fs.readFileSync(auditsPath, "utf-8"))
    }

    // Calculate key metrics
    const runs = monitoringData.runs || []
    const audits = auditsData.audits || []

    const latestRuns = runs
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5)

    const avgVisibility = latestRuns.length > 0
      ? Math.round(latestRuns.reduce((sum: number, r: any) => sum + r.visibility_score, 0) / latestRuns.length)
      : 0

    const totalMentions = latestRuns.reduce((sum: number, r: any) => sum + r.total_mentions, 0)
    const totalQueries = latestRuns.reduce((sum: number, r: any) => sum + r.queries_tested, 0)

    const avgAEO = audits.length > 0
      ? Math.round(audits.reduce((sum: number, a: any) => sum + (a.aeo_score || 0), 0) / audits.length)
      : 0

    const avgTechnical = audits.length > 0
      ? Math.round(audits.reduce((sum: number, a: any) => sum + (a.technical_score || 0), 0) / audits.length)
      : 0

    const avgContent = audits.length > 0
      ? Math.round(audits.reduce((sum: number, a: any) => sum + (a.content_score || 0), 0) / audits.length)
      : 0

    // Check for GA data
    const gaConnectionPath = path.join(process.cwd(), "data", "ga-connection.json")
    const hasGA = fs.existsSync(gaConnectionPath)

    // Build context string
    let contextStr = `AI Search Metrics:
- Average Visibility Score: ${avgVisibility}/100 (based on ${latestRuns.length} recent runs)
- Total Brand Mentions: ${totalMentions} out of ${totalQueries} queries
- Mention Rate: ${totalQueries > 0 ? Math.round((totalMentions / totalQueries) * 100) : 0}%

Content Optimization:
- Pages Audited: ${audits.length}
- Average AEO Score: ${avgAEO}/100
- Average Technical SEO: ${avgTechnical}/100
- Average Content Quality: ${avgContent}/100

Google Analytics: ${hasGA ? "Connected" : "Not connected"}`

    // Add recent monitoring results
    if (latestRuns.length > 0) {
      const latest = latestRuns[0]
      contextStr += `\n\nMost Recent Monitoring Run:
- Brand: ${latest.brand_name}
- Visibility: ${latest.visibility_score}/100
- Mentions: ${latest.total_mentions}/${latest.queries_tested}
- Date: ${new Date(latest.timestamp).toLocaleDateString()}`
    }

    // Add top/bottom pages by AEO if available
    if (audits.length > 0) {
      const sortedAudits = [...audits].sort((a: any, b: any) => (b.aeo_score || 0) - (a.aeo_score || 0))
      const topPage = sortedAudits[0]
      const bottomPage = sortedAudits[sortedAudits.length - 1]

      contextStr += `\n\nTop Performing Page:
- ${topPage.page_title || topPage.page_url}
- AEO: ${topPage.aeo_score}/100

Lowest Performing Page:
- ${bottomPage.page_title || bottomPage.page_url}
- AEO: ${bottomPage.aeo_score}/100`
    }

    return contextStr

  } catch (error) {
    console.error("Error fetching data context:", error)
    return "No data available yet. Please run monitoring or audit pages to get started."
  }
}
