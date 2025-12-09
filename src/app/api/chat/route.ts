import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import fs from "fs"
import path from "path"
import { getSession } from "@/lib/auth/session"
import { getGAOAuthTokens } from "@/lib/firebase/storage"
import { BetaAnalyticsDataClient } from '@google-analytics/data'
import { OAuth2Client } from 'google-auth-library'
import { db, COLLECTIONS } from '@/lib/firebase/config'

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

    // Detect if user is asking for a specific date range
    const dateRangeMatch = message.match(/last\s+(\d+)\s+(day|days|week|weeks|month|months)/i)
    let customDateRange = null
    if (dateRangeMatch) {
      const amount = parseInt(dateRangeMatch[1])
      const unit = dateRangeMatch[2].toLowerCase()

      if (unit.startsWith('day')) {
        customDateRange = { startDate: `${amount}daysAgo`, endDate: 'today' }
      } else if (unit.startsWith('week')) {
        customDateRange = { startDate: `${amount * 7}daysAgo`, endDate: 'today' }
      } else if (unit.startsWith('month')) {
        customDateRange = { startDate: `${amount * 30}daysAgo`, endDate: 'today' }
      }
    }

    // Fetch user data for context
    const dataContext = await fetchUserDataContext(context, customDateRange)

    // Build system prompt with data context
    const isSettingsPage = context === "settings"

    const systemPrompt = isSettingsPage
      ? `You are RevIntel's AI assistant, helping users set up their Google Analytics integration.

Current Page: Settings

Your role:
- Help users connect their Google Analytics account step-by-step
- Provide direct URLs to Google Cloud Console and Google Analytics
- Explain what a service account is and why it's needed
- Guide users through finding their GA4 Property ID
- Help troubleshoot connection issues
- Be patient and provide clear, actionable instructions

When users ask setup questions, provide:
1. Clear step-by-step instructions
2. Direct links to the exact pages they need (Google Cloud Console, GA Admin, etc.)
3. What they should look for on each page
4. Common troubleshooting tips

Key URLs to reference:
- Create Service Account: https://console.cloud.google.com/iam-admin/serviceaccounts
- Google Analytics Admin: https://analytics.google.com/analytics/web/#/a/admin
- GA Property Settings: Go to Admin → Property Settings in Google Analytics
- Property Access: Go to Admin → Property Access Management in Google Analytics

Keep responses helpful and conversational. If they're stuck, ask what step they're on.`
      : `You are RevIntel's AI assistant, an expert analyst helping users understand their AI search visibility and Google Analytics data.

Current Page Context: ${context || "dashboard"}

Available Data:
${dataContext}

Your role:
- Answer questions about the user's metrics, trends, and data with depth and insight
- Provide actionable insights and strategic recommendations based on the actual data
- Explain complex concepts in simple, accessible terms
- Use specific numbers from their data when relevant
- Identify trends, patterns, and anomalies in the data
- When asked about Google Analytics metrics, reference the actual GA data provided above
- When asked to create reports, provide comprehensive analysis with:
  * Executive summary
  * Key metrics and trends
  * Insights and interpretation
  * Actionable recommendations
- Compare data across dimensions (sources, devices, geo, etc.) to find insights
- Highlight what's working well and what needs improvement
- Suggest specific next steps or optimizations based on the data

Response style:
- Be thorough and analytical when asked for reports or detailed analysis
- Be concise (2-3 sentences) for quick questions
- Always use actual numbers from the data provided above
- Format reports with clear sections and bullet points
- Provide context for the numbers (e.g., "X% increase compared to Y")
- When appropriate, explain the "why" behind the numbers`

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
      max_tokens: 2000, // Allow for detailed reports and analysis
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

async function fetchUserDataContext(pageContext: string, customDateRange?: { startDate: string, endDate: string } | null): Promise<string> {
  try {
    // Fetch monitoring data
    const monitoringPath = path.join(process.cwd(), "data", "monitoring.json")
    let monitoringData: any = []
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
    const runs = Array.isArray(monitoringData) ? monitoringData : []
    const audits = auditsData.audits || []

    const latestRuns = runs
      .sort((a: any, b: any) => new Date(b.timestamp || b.created_at || 0).getTime() - new Date(a.timestamp || a.created_at || 0).getTime())
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

    // Check if user has real GA data connected
    // NOTE: We do NOT use fake data - only real GA integration
    let gaData: any = null
    let gaConnected = false

    try {
      // Get user session to fetch their actual GA data
      const session = await getSession()
      if (session?.userId) {
        const tokens = await getGAOAuthTokens(session.userId)
        const userDoc = await db.collection(COLLECTIONS.USERS).doc(session.userId).get()
        const userData = userDoc.data()
        const propertyId = userData?.ga_property_id

        if (tokens && propertyId) {
          gaConnected = true

          try {
            // Create OAuth2 client with tokens
            const oauth2Client = new OAuth2Client(
              process.env.GOOGLE_CLIENT_ID,
              process.env.GOOGLE_CLIENT_SECRET
            )

            oauth2Client.setCredentials({
              access_token: tokens.accessToken,
              refresh_token: tokens.refreshToken || undefined,
              expiry_date: tokens.expiryDate || undefined,
            })

            // Initialize GA Data API client with OAuth
            const analyticsDataClient = new BetaAnalyticsDataClient({
              authClient: oauth2Client,
            })

            // Use custom date range if provided, otherwise default to 30 days
            const dateRange = customDateRange || { startDate: '30daysAgo', endDate: 'today' }

            // Fetch metrics for specified date range
            const [response] = await analyticsDataClient.runReport({
              property: `properties/${propertyId}`,
              dateRanges: [dateRange],
              dimensions: [{ name: 'date' }],
              metrics: [
                { name: 'activeUsers' },
                { name: 'sessions' },
                { name: 'screenPageViews' },
              ],
            })

            // Fetch top pages
            const [pagesResponse] = await analyticsDataClient.runReport({
              property: `properties/${propertyId}`,
              dateRanges: [dateRange],
              dimensions: [{ name: 'pageTitle' }, { name: 'pagePath' }],
              metrics: [
                { name: 'screenPageViews' },
                { name: 'activeUsers' },
              ],
              orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
              limit: 5,
            })

            // Fetch traffic sources
            const [sourcesResponse] = await analyticsDataClient.runReport({
              property: `properties/${propertyId}`,
              dateRanges: [dateRange],
              dimensions: [{ name: 'sessionDefaultChannelGroup' }],
              metrics: [
                { name: 'sessions' },
                { name: 'activeUsers' },
                { name: 'engagementRate' },
                { name: 'averageSessionDuration' },
              ],
              orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
              limit: 10,
            })

            // Fetch device breakdown
            const [devicesResponse] = await analyticsDataClient.runReport({
              property: `properties/${propertyId}`,
              dateRanges: [dateRange],
              dimensions: [{ name: 'deviceCategory' }],
              metrics: [
                { name: 'sessions' },
                { name: 'activeUsers' },
                { name: 'engagementRate' },
              ],
              orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
            })

            // Fetch geographic data
            const [geoResponse] = await analyticsDataClient.runReport({
              property: `properties/${propertyId}`,
              dateRanges: [dateRange],
              dimensions: [{ name: 'country' }],
              metrics: [
                { name: 'sessions' },
                { name: 'activeUsers' },
              ],
              orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
              limit: 10,
            })

            // Fetch landing pages
            const [landingPagesResponse] = await analyticsDataClient.runReport({
              property: `properties/${propertyId}`,
              dateRanges: [dateRange],
              dimensions: [{ name: 'landingPagePlusQueryString' }],
              metrics: [
                { name: 'sessions' },
                { name: 'bounceRate' },
                { name: 'engagementRate' },
              ],
              orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
              limit: 10,
            })

            const trafficTrend = response.rows?.map(row => ({
              date: row.dimensionValues?.[0]?.value || '',
              users: parseInt(row.metricValues?.[0]?.value || '0'),
              sessions: parseInt(row.metricValues?.[1]?.value || '0'),
              pageViews: parseInt(row.metricValues?.[2]?.value || '0'),
            })) || []

            const topPages = pagesResponse.rows?.map(row => ({
              page: row.dimensionValues?.[0]?.value || 'Unknown',
              url: row.dimensionValues?.[1]?.value || '/',
              pageViews: parseInt(row.metricValues?.[0]?.value || '0'),
              users: parseInt(row.metricValues?.[1]?.value || '0'),
            })) || []

            const trafficSources = sourcesResponse.rows?.map(row => ({
              source: row.dimensionValues?.[0]?.value || 'Unknown',
              sessions: parseInt(row.metricValues?.[0]?.value || '0'),
              users: parseInt(row.metricValues?.[1]?.value || '0'),
              engagementRate: parseFloat(row.metricValues?.[2]?.value || '0'),
              avgSessionDuration: parseFloat(row.metricValues?.[3]?.value || '0'),
            })) || []

            const devices = devicesResponse.rows?.map(row => ({
              device: row.dimensionValues?.[0]?.value || 'Unknown',
              sessions: parseInt(row.metricValues?.[0]?.value || '0'),
              users: parseInt(row.metricValues?.[1]?.value || '0'),
              engagementRate: parseFloat(row.metricValues?.[2]?.value || '0'),
            })) || []

            const topCountries = geoResponse.rows?.map(row => ({
              country: row.dimensionValues?.[0]?.value || 'Unknown',
              sessions: parseInt(row.metricValues?.[0]?.value || '0'),
              users: parseInt(row.metricValues?.[1]?.value || '0'),
            })) || []

            const landingPages = landingPagesResponse.rows?.map(row => ({
              page: row.dimensionValues?.[0]?.value || 'Unknown',
              sessions: parseInt(row.metricValues?.[0]?.value || '0'),
              bounceRate: parseFloat(row.metricValues?.[1]?.value || '0'),
              engagementRate: parseFloat(row.metricValues?.[2]?.value || '0'),
            })) || []

            const totalUsers = trafficTrend.reduce((sum, day) => sum + day.users, 0)
            const totalSessions = trafficTrend.reduce((sum, day) => sum + day.sessions, 0)
            const totalPageViews = trafficTrend.reduce((sum, day) => sum + day.pageViews, 0)

            gaData = {
              metrics: { totalUsers, totalSessions, totalPageViews },
              topPages,
              trafficSources,
              devices,
              topCountries,
              landingPages,
              trafficTrend,
            }
          } catch (gaError) {
            console.error('Error fetching real GA data for chat:', gaError)
          }
        }
      }
    } catch (error) {
      console.error('Error checking GA connection for chat:', error)
    }

    // Build context string
    let contextStr = `AI Search Metrics:
- Average Visibility Score: ${avgVisibility}/100 (based on ${latestRuns.length} recent runs)
- Total Brand Mentions: ${totalMentions} out of ${totalQueries} queries
- Mention Rate: ${totalQueries > 0 ? Math.round((totalMentions / totalQueries) * 100) : 0}%

Content Optimization:
- Pages Audited: ${audits.length}
- Average AEO Score: ${avgAEO}/100
- Average Technical SEO: ${avgTechnical}/100
- Average Content Quality: ${avgContent}/100`

    // Add REAL GA data if available
    if (gaConnected && gaData && gaData.metrics) {
      const dateRangeLabel = customDateRange
        ? `(${customDateRange.startDate} to ${customDateRange.endDate})`
        : '(Last 30 Days)'

      contextStr += `\n\nGoogle Analytics ${dateRangeLabel}:
- Total Users: ${gaData.metrics.totalUsers?.toLocaleString() || 0}
- Total Sessions: ${gaData.metrics.totalSessions?.toLocaleString() || 0}
- Total Page Views: ${gaData.metrics.totalPageViews?.toLocaleString() || 0}
- Pages per Session: ${gaData.metrics.totalSessions && gaData.metrics.totalPageViews ? (gaData.metrics.totalPageViews / gaData.metrics.totalSessions).toFixed(1) : 'N/A'}`

      // Add top pages if available
      if (gaData.topPages && gaData.topPages.length > 0) {
        contextStr += `\n\nTop 5 Pages by Traffic:`
        gaData.topPages.slice(0, 5).forEach((page: any, idx: number) => {
          contextStr += `\n${idx + 1}. ${page.page}: ${page.pageViews?.toLocaleString() || 0} views`
        })
      }

      // Add traffic sources
      if (gaData.trafficSources && gaData.trafficSources.length > 0) {
        contextStr += `\n\nTop Traffic Sources:`
        gaData.trafficSources.forEach((source: any, idx: number) => {
          contextStr += `\n${idx + 1}. ${source.source}: ${source.sessions?.toLocaleString() || 0} sessions (${(source.engagementRate * 100).toFixed(1)}% engagement)`
        })
      }

      // Add device breakdown
      if (gaData.devices && gaData.devices.length > 0) {
        contextStr += `\n\nDevice Breakdown:`
        gaData.devices.forEach((device: any) => {
          const percentage = gaData.metrics.totalSessions > 0
            ? ((device.sessions / gaData.metrics.totalSessions) * 100).toFixed(1)
            : '0'
          contextStr += `\n- ${device.device}: ${device.sessions?.toLocaleString() || 0} sessions (${percentage}%)`
        })
      }

      // Add top countries
      if (gaData.topCountries && gaData.topCountries.length > 0) {
        contextStr += `\n\nTop Countries:`
        gaData.topCountries.slice(0, 5).forEach((country: any, idx: number) => {
          contextStr += `\n${idx + 1}. ${country.country}: ${country.sessions?.toLocaleString() || 0} sessions`
        })
      }

      // Add landing pages
      if (gaData.landingPages && gaData.landingPages.length > 0) {
        contextStr += `\n\nTop Landing Pages:`
        gaData.landingPages.slice(0, 5).forEach((page: any, idx: number) => {
          contextStr += `\n${idx + 1}. ${page.page}: ${page.sessions?.toLocaleString() || 0} sessions (${(page.engagementRate * 100).toFixed(1)}% engagement)`
        })
      }
    } else {
      contextStr += `\n\nGoogle Analytics: Not connected. User needs to connect GA in Settings to see traffic data.`
    }

    // Add recent monitoring results with AI platform responses
    if (latestRuns.length > 0) {
      const latest = latestRuns[0]
      contextStr += `\n\nMost Recent Monitoring Run:
- Brand: ${latest.brand_name}
- Visibility: ${latest.visibility_score}/100
- Mentions: ${latest.total_mentions}/${latest.queries_tested}
- Date: ${new Date(latest.timestamp).toLocaleDateString()}`

      // Add detailed platform responses if available
      if (latest.platform_results && Array.isArray(latest.platform_results)) {
        contextStr += `\n\nAI Platform Responses:`
        latest.platform_results.forEach((result: any) => {
          contextStr += `\n\n${result.platform.toUpperCase()}:`
          contextStr += `\n- Query: "${result.query}"`
          contextStr += `\n- Mentioned: ${result.yourBrand?.mentioned ? 'Yes' : 'No'}`
          if (result.yourBrand?.mentioned) {
            contextStr += `\n- Position: ${result.yourBrand.position || 'Not ranked'}`
            contextStr += `\n- Prominence: ${result.yourBrand.prominence || 0}%`
            if (result.yourBrand.context) {
              contextStr += `\n- Context: "${result.yourBrand.context.substring(0, 200)}..."`
            }
          }
          if (result.competitor?.mentioned) {
            contextStr += `\n- Competitor also mentioned: Yes (position ${result.competitor.position || 'unknown'})`
          }
          // Include a snippet of the actual response
          if (result.response) {
            contextStr += `\n- Full Response: "${result.response.substring(0, 500)}..."`
          }
        })
      }
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
