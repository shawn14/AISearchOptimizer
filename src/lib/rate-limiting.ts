/**
 * Rate Limiting and Usage Control
 * Prevents abuse and controls API costs
 */

interface RateLimitConfig {
  maxRequestsPerHour: number
  maxRequestsPerDay: number
  maxCostPerDay: number // in dollars
  maxConcurrentRequests: number
}

interface UsageRecord {
  timestamp: number
  cost: number
  endpoint: string
}

// Tier-based rate limits
const RATE_LIMITS: Record<string, RateLimitConfig> = {
  free: {
    maxRequestsPerHour: 10,
    maxRequestsPerDay: 50,
    maxCostPerDay: 0.10, // $0.10/day
    maxConcurrentRequests: 1,
  },
  starter: {
    maxRequestsPerHour: 50,
    maxRequestsPerDay: 500,
    maxCostPerDay: 1.00, // $1/day
    maxConcurrentRequests: 2,
  },
  professional: {
    maxRequestsPerHour: 200,
    maxRequestsPerDay: 2000,
    maxCostPerDay: 10.00, // $10/day
    maxConcurrentRequests: 5,
  },
  enterprise: {
    maxRequestsPerHour: 1000,
    maxRequestsPerDay: 10000,
    maxCostPerDay: 100.00, // $100/day
    maxConcurrentRequests: 10,
  },
}

// In-memory store (replace with Redis in production)
const usageStore = new Map<string, UsageRecord[]>()
const activeRequests = new Map<string, number>()

/**
 * Get user's tier (placeholder - replace with real auth)
 */
function getUserTier(userId?: string): string {
  // TODO: Replace with actual user tier from database

  // Development mode: unlimited for testing
  if (process.env.NODE_ENV === 'development') {
    return 'enterprise' // Use enterprise limits in development (effectively unlimited)
  }

  // Production: default to 'free' (add auth to determine actual tier)
  return 'free'
}

/**
 * Get user's usage records for time window
 */
function getUsageRecords(userId: string, windowMs: number): UsageRecord[] {
  const records = usageStore.get(userId) || []
  const cutoff = Date.now() - windowMs

  // Clean up old records
  const recentRecords = records.filter(r => r.timestamp > cutoff)
  usageStore.set(userId, recentRecords)

  return recentRecords
}

/**
 * Check if user is within rate limits
 */
export function checkRateLimit(userId: string, endpoint: string): {
  allowed: boolean
  reason?: string
  retryAfter?: number
} {
  const tier = getUserTier(userId)
  const limits = RATE_LIMITS[tier]

  // Check concurrent requests
  const concurrent = activeRequests.get(userId) || 0
  if (concurrent >= limits.maxConcurrentRequests) {
    return {
      allowed: false,
      reason: `Maximum concurrent requests (${limits.maxConcurrentRequests}) reached. Please wait for current requests to complete.`,
      retryAfter: 60, // seconds
    }
  }

  // Check hourly limit
  const hourlyRecords = getUsageRecords(userId, 60 * 60 * 1000)
  if (hourlyRecords.length >= limits.maxRequestsPerHour) {
    const oldestRecord = hourlyRecords[0]
    const retryAfter = Math.ceil((oldestRecord.timestamp + 60 * 60 * 1000 - Date.now()) / 1000)
    return {
      allowed: false,
      reason: `Hourly limit of ${limits.maxRequestsPerHour} requests exceeded. Upgrade to increase limits.`,
      retryAfter,
    }
  }

  // Check daily limit
  const dailyRecords = getUsageRecords(userId, 24 * 60 * 60 * 1000)
  if (dailyRecords.length >= limits.maxRequestsPerDay) {
    const oldestRecord = dailyRecords[0]
    const retryAfter = Math.ceil((oldestRecord.timestamp + 24 * 60 * 60 * 1000 - Date.now()) / 1000)
    return {
      allowed: false,
      reason: `Daily limit of ${limits.maxRequestsPerDay} requests exceeded. Upgrade to increase limits.`,
      retryAfter,
    }
  }

  // Check daily cost limit
  const dailyCost = dailyRecords.reduce((sum, r) => sum + r.cost, 0)
  if (dailyCost >= limits.maxCostPerDay) {
    return {
      allowed: false,
      reason: `Daily cost limit of $${limits.maxCostPerDay.toFixed(2)} exceeded. Upgrade to increase limits.`,
      retryAfter: 86400, // 24 hours
    }
  }

  return { allowed: true }
}

/**
 * Record a request
 */
export function recordRequest(userId: string, endpoint: string, cost: number = 0) {
  const records = usageStore.get(userId) || []
  records.push({
    timestamp: Date.now(),
    cost,
    endpoint,
  })
  usageStore.set(userId, records)

  // Increment concurrent requests counter
  activeRequests.set(userId, (activeRequests.get(userId) || 0) + 1)
}

/**
 * Mark request as complete
 */
export function completeRequest(userId: string) {
  const current = activeRequests.get(userId) || 0
  activeRequests.set(userId, Math.max(0, current - 1))
}

/**
 * Get usage statistics
 */
export function getUsageStats(userId: string) {
  const tier = getUserTier(userId)
  const limits = RATE_LIMITS[tier]

  const hourlyRecords = getUsageRecords(userId, 60 * 60 * 1000)
  const dailyRecords = getUsageRecords(userId, 24 * 60 * 60 * 1000)
  const dailyCost = dailyRecords.reduce((sum, r) => sum + r.cost, 0)

  return {
    tier,
    limits,
    usage: {
      hourly: {
        count: hourlyRecords.length,
        limit: limits.maxRequestsPerHour,
        percentage: (hourlyRecords.length / limits.maxRequestsPerHour) * 100,
      },
      daily: {
        count: dailyRecords.length,
        limit: limits.maxRequestsPerDay,
        percentage: (dailyRecords.length / limits.maxRequestsPerDay) * 100,
      },
      cost: {
        total: dailyCost,
        limit: limits.maxCostPerDay,
        percentage: (dailyCost / limits.maxCostPerDay) * 100,
      },
      concurrent: {
        active: activeRequests.get(userId) || 0,
        limit: limits.maxConcurrentRequests,
      },
    },
  }
}

/**
 * Middleware wrapper for API routes
 */
export function withRateLimit(
  handler: (req: any, res: any) => Promise<any>,
  endpoint: string
) {
  return async (req: any, res: any) => {
    // Get user ID (placeholder - replace with real auth)
    const userId = req.headers['x-user-id'] || 'anonymous'

    // Check rate limit
    const check = checkRateLimit(userId, endpoint)

    if (!check.allowed) {
      if (check.retryAfter) {
        res.setHeader('Retry-After', check.retryAfter.toString())
      }
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: check.reason,
        retryAfter: check.retryAfter,
      })
    }

    try {
      // Record request start
      recordRequest(userId, endpoint)

      // Execute handler
      const result = await handler(req, res)

      return result
    } finally {
      // Mark request as complete
      completeRequest(userId)
    }
  }
}

/**
 * Get remaining quota
 */
export function getRemainingQuota(userId: string) {
  const tier = getUserTier(userId)
  const limits = RATE_LIMITS[tier]

  const hourlyRecords = getUsageRecords(userId, 60 * 60 * 1000)
  const dailyRecords = getUsageRecords(userId, 24 * 60 * 60 * 1000)
  const dailyCost = dailyRecords.reduce((sum, r) => sum + r.cost, 0)

  return {
    requests: {
      hourly: Math.max(0, limits.maxRequestsPerHour - hourlyRecords.length),
      daily: Math.max(0, limits.maxRequestsPerDay - dailyRecords.length),
    },
    cost: {
      daily: Math.max(0, limits.maxCostPerDay - dailyCost),
    },
  }
}
