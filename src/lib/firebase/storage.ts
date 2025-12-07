import { db, COLLECTIONS } from './config'
import { Timestamp, FieldValue } from 'firebase-admin/firestore'
import bcrypt from 'bcryptjs'

/**
 * User Management
 */

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  password_hash: string
  created_at: Date
  updated_at: Date
}

export async function createUser(userData: {
  email: string
  firstName: string
  lastName: string
  password: string
}): Promise<User> {
  // Check if user already exists
  const existingUser = await db.collection(COLLECTIONS.USERS)
    .where('email', '==', userData.email.toLowerCase())
    .limit(1)
    .get()

  if (!existingUser.empty) {
    throw new Error('User with this email already exists')
  }

  // Hash password
  const password_hash = await bcrypt.hash(userData.password, 10)

  const ref = db.collection(COLLECTIONS.USERS).doc()
  const now = Timestamp.now()

  const newUser = {
    email: userData.email.toLowerCase(),
    first_name: userData.firstName,
    last_name: userData.lastName,
    password_hash,
    created_at: now,
    updated_at: now,
  }

  await ref.set(newUser)

  return {
    id: ref.id,
    email: newUser.email,
    first_name: newUser.first_name,
    last_name: newUser.last_name,
    password_hash: newUser.password_hash,
    created_at: now.toDate(),
    updated_at: now.toDate(),
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const snapshot = await db.collection(COLLECTIONS.USERS)
    .where('email', '==', email.toLowerCase())
    .limit(1)
    .get()

  if (snapshot.empty) {
    return null
  }

  const doc = snapshot.docs[0]
  const data = doc.data()

  return {
    id: doc.id,
    email: data.email,
    first_name: data.first_name,
    last_name: data.last_name,
    password_hash: data.password_hash,
    created_at: data.created_at.toDate(),
    updated_at: data.updated_at.toDate(),
  }
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Brand Management
 */

export interface Brand {
  id: string
  name: string
  website_url: string
  industry: string | null
  description: string | null
  is_primary?: boolean
  created_at: Date
  updated_at: Date
}

export async function createBrand(brand: Omit<Brand, 'id' | 'created_at' | 'updated_at'>): Promise<Brand> {
  const ref = db.collection(COLLECTIONS.BRANDS).doc()
  const now = Timestamp.now()

  const newBrand = {
    ...brand,
    created_at: now,
    updated_at: now,
  }

  await ref.set(newBrand)

  return {
    id: ref.id,
    ...brand,
    created_at: now.toDate(),
    updated_at: now.toDate(),
  }
}

export async function getBrand(id: string): Promise<Brand | null> {
  const doc = await db.collection(COLLECTIONS.BRANDS).doc(id).get()

  if (!doc.exists) {
    return null
  }

  const data = doc.data()!
  return {
    id: doc.id,
    name: data.name,
    website_url: data.website_url,
    industry: data.industry || null,
    description: data.description || null,
    is_primary: data.is_primary || false,
    created_at: data.created_at.toDate(),
    updated_at: data.updated_at.toDate(),
  }
}

export async function getAllBrands(): Promise<Brand[]> {
  const snapshot = await db.collection(COLLECTIONS.BRANDS)
    .orderBy('created_at', 'desc')
    .get()

  return snapshot.docs.map(doc => {
    const data = doc.data()
    return {
      id: doc.id,
      name: data.name,
      website_url: data.website_url,
      industry: data.industry || null,
      description: data.description || null,
      is_primary: data.is_primary || false,
      created_at: data.created_at.toDate(),
      updated_at: data.updated_at.toDate(),
    }
  })
}

export async function updateBrand(id: string, updates: Partial<Omit<Brand, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
  await db.collection(COLLECTIONS.BRANDS).doc(id).update({
    ...updates,
    updated_at: Timestamp.now(),
  })
}

export async function deleteBrand(id: string): Promise<void> {
  await db.collection(COLLECTIONS.BRANDS).doc(id).delete()
}

/**
 * Custom Prompts Management
 */

export interface CustomPrompt {
  id: string
  brand_id?: string | null
  name: string
  prompt_text: string
  variables: Record<string, string>
  category?: string
  is_active: boolean
  performance_score?: number
  created_at: Date
  updated_at: Date
}

export async function createPrompt(prompt: Omit<CustomPrompt, 'id' | 'created_at' | 'updated_at'>): Promise<CustomPrompt> {
  const ref = db.collection(COLLECTIONS.PROMPTS).doc()
  const now = Timestamp.now()

  const newPrompt = {
    ...prompt,
    created_at: now,
    updated_at: now,
  }

  await ref.set(newPrompt)

  return {
    id: ref.id,
    ...prompt,
    created_at: now.toDate(),
    updated_at: now.toDate(),
  }
}

export async function getPrompt(id: string): Promise<CustomPrompt | null> {
  const doc = await db.collection(COLLECTIONS.PROMPTS).doc(id).get()

  if (!doc.exists) {
    return null
  }

  const data = doc.data()!
  return {
    id: doc.id,
    brand_id: data.brand_id || null,
    name: data.name,
    prompt_text: data.prompt_text,
    variables: data.variables || {},
    category: data.category,
    is_active: data.is_active,
    performance_score: data.performance_score,
    created_at: data.created_at.toDate(),
    updated_at: data.updated_at.toDate(),
  }
}

export async function getPromptsByBrand(brandId: string): Promise<CustomPrompt[]> {
  const snapshot = await db.collection(COLLECTIONS.PROMPTS)
    .where('brand_id', '==', brandId)
    .where('is_active', '==', true)
    .orderBy('created_at', 'desc')
    .get()

  return snapshot.docs.map(doc => {
    const data = doc.data()
    return {
      id: doc.id,
      brand_id: data.brand_id || null,
      name: data.name,
      prompt_text: data.prompt_text,
      variables: data.variables || {},
      category: data.category,
      is_active: data.is_active,
      performance_score: data.performance_score,
      created_at: data.created_at.toDate(),
      updated_at: data.updated_at.toDate(),
    }
  })
}

export async function getAllPrompts(): Promise<CustomPrompt[]> {
  const snapshot = await db.collection(COLLECTIONS.PROMPTS)
    .orderBy('created_at', 'desc')
    .get()

  return snapshot.docs
    .map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        brand_id: data.brand_id || null,
        name: data.name,
        prompt_text: data.prompt_text,
        variables: data.variables || {},
        category: data.category,
        is_active: data.is_active,
        performance_score: data.performance_score,
        created_at: data.created_at.toDate(),
        updated_at: data.updated_at.toDate(),
      }
    })
    .filter(prompt => prompt.is_active)
}

export async function updatePrompt(id: string, updates: Partial<Omit<CustomPrompt, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
  await db.collection(COLLECTIONS.PROMPTS).doc(id).update({
    ...updates,
    updated_at: Timestamp.now(),
  })
}

export async function deletePrompt(id: string): Promise<void> {
  await db.collection(COLLECTIONS.PROMPTS).doc(id).update({
    is_active: false,
    updated_at: Timestamp.now(),
  })
}

/**
 * Monitoring Runs
 */

export interface MonitoringRun {
  id: string
  brand_id: string
  brand_name: string
  visibility_score: number
  total_mentions: number
  queries_tested: number
  platform_results: any[]
  individual_results: any[]
  total_cost: number
  timestamp: Date
  prompt_ids?: string[] // Track which prompts were used
  used_custom_prompts?: boolean // Whether custom prompts were used
}

export async function saveMonitoringRun(run: Omit<MonitoringRun, 'id'>): Promise<MonitoringRun> {
  const ref = db.collection(COLLECTIONS.MONITORING_RUNS).doc()

  // Remove undefined values to avoid Firestore errors
  const cleanedRun = Object.fromEntries(
    Object.entries(run).filter(([_, value]) => value !== undefined)
  )

  const data = {
    ...cleanedRun,
    timestamp: run.timestamp ? Timestamp.fromDate(new Date(run.timestamp)) : Timestamp.now(),
  }

  await ref.set(data)

  return {
    id: ref.id,
    ...run,
    timestamp: data.timestamp.toDate(),
  }
}

export async function getMonitoringRuns(brandId?: string, limit?: number): Promise<MonitoringRun[]> {
  let query = db.collection(COLLECTIONS.MONITORING_RUNS).orderBy('timestamp', 'desc')

  if (brandId) {
    query = query.where('brand_id', '==', brandId) as any
  }

  if (limit) {
    query = query.limit(limit) as any
  }

  const snapshot = await query.get()

  return snapshot.docs.map(doc => {
    const data = doc.data()
    return {
      id: doc.id,
      brand_id: data.brand_id,
      brand_name: data.brand_name,
      visibility_score: data.visibility_score,
      total_mentions: data.total_mentions,
      queries_tested: data.queries_tested,
      platform_results: data.platform_results || [],
      individual_results: data.individual_results || [],
      total_cost: data.total_cost,
      timestamp: data.timestamp.toDate(),
      prompt_ids: data.prompt_ids || undefined,
      used_custom_prompts: data.used_custom_prompts || false,
    }
  })
}

export async function getLatestMonitoringRun(brandId: string): Promise<MonitoringRun | null> {
  const snapshot = await db.collection(COLLECTIONS.MONITORING_RUNS)
    .where('brand_id', '==', brandId)
    .orderBy('timestamp', 'desc')
    .limit(1)
    .get()

  if (snapshot.empty) {
    return null
  }

  const doc = snapshot.docs[0]
  const data = doc.data()

  return {
    id: doc.id,
    brand_id: data.brand_id,
    brand_name: data.brand_name,
    visibility_score: data.visibility_score,
    total_mentions: data.total_mentions,
    queries_tested: data.queries_tested,
    platform_results: data.platform_results || [],
    individual_results: data.individual_results || [],
    total_cost: data.total_cost,
    timestamp: data.timestamp.toDate(),
    prompt_ids: data.prompt_ids || undefined,
    used_custom_prompts: data.used_custom_prompts || false,
  }
}

/**
 * Page Audits
 */

export interface PageAudit {
  id: string
  page_url: string
  page_title: string | null
  technical_score: number | null
  content_score: number | null
  aeo_score: number | null
  issues: any[]
  last_audited_at: Date | null
}

export async function savePageAudit(audit: Omit<PageAudit, 'id'>): Promise<PageAudit> {
  // Check if audit already exists for this URL
  const existingSnapshot = await db.collection(COLLECTIONS.AUDITS)
    .where('page_url', '==', audit.page_url)
    .limit(1)
    .get()

  let ref
  if (!existingSnapshot.empty) {
    // Update existing audit
    ref = existingSnapshot.docs[0].ref
    await ref.update({
      ...audit,
      last_audited_at: audit.last_audited_at ? Timestamp.fromDate(new Date(audit.last_audited_at)) : Timestamp.now(),
    })
  } else {
    // Create new audit
    ref = db.collection(COLLECTIONS.AUDITS).doc()
    await ref.set({
      ...audit,
      last_audited_at: audit.last_audited_at ? Timestamp.fromDate(new Date(audit.last_audited_at)) : Timestamp.now(),
    })
  }

  return {
    id: ref.id,
    ...audit,
  }
}

export async function getAllAudits(): Promise<PageAudit[]> {
  const snapshot = await db.collection(COLLECTIONS.AUDITS)
    .orderBy('last_audited_at', 'desc')
    .get()

  return snapshot.docs.map(doc => {
    const data = doc.data()
    return {
      id: doc.id,
      page_url: data.page_url,
      page_title: data.page_title || null,
      technical_score: data.technical_score || null,
      content_score: data.content_score || null,
      aeo_score: data.aeo_score || null,
      issues: data.issues || [],
      last_audited_at: data.last_audited_at ? data.last_audited_at.toDate() : null,
    }
  })
}

/**
 * Prompt Performance Tracking
 */

export async function updatePromptPerformance(promptId: string): Promise<void> {
  // Get all monitoring runs that used this prompt
  const runsSnapshot = await db.collection(COLLECTIONS.MONITORING_RUNS)
    .where('prompt_ids', 'array-contains', promptId)
    .get()

  if (runsSnapshot.empty) {
    return
  }

  // Calculate performance metrics
  let totalMentions = 0
  let totalQueries = 0
  let totalVisibility = 0

  runsSnapshot.docs.forEach(doc => {
    const data = doc.data()
    totalMentions += data.total_mentions || 0
    totalQueries += data.queries_tested || 0
    totalVisibility += data.visibility_score || 0
  })

  const runCount = runsSnapshot.size

  // Calculate performance score (0-100)
  // Based on: mention rate (50%), average visibility (50%)
  const mentionRate = totalQueries > 0 ? (totalMentions / totalQueries) * 100 : 0
  const avgVisibility = runCount > 0 ? totalVisibility / runCount : 0
  const performanceScore = Math.round((mentionRate * 0.5) + (avgVisibility * 0.5))

  // Update prompt with performance score
  await updatePrompt(promptId, {
    performance_score: performanceScore,
  })
}

export async function updateAllPromptPerformances(): Promise<void> {
  // Get all prompts
  const promptsSnapshot = await db.collection(COLLECTIONS.PROMPTS)
    .where('is_active', '==', true)
    .get()

  // Update each prompt's performance
  const updates = promptsSnapshot.docs.map(doc =>
    updatePromptPerformance(doc.id)
  )

  await Promise.all(updates)
}

/**
 * Knowledge Articles Management
 */

export interface KnowledgeArticle {
  id: string
  brand_id?: string | null
  title: string
  type: string // About, Product, Pricing, Case Study, Blog, etc.
  content: string
  url: string
  category: string
  citation_count?: number
  last_cited_at?: Date | null
  created_at: Date
  updated_at: Date
}

export async function createKnowledgeArticle(article: Omit<KnowledgeArticle, 'id' | 'created_at' | 'updated_at'>): Promise<KnowledgeArticle> {
  const ref = db.collection(COLLECTIONS.KNOWLEDGE_ARTICLES).doc()
  const now = Timestamp.now()

  const newArticle = {
    ...article,
    citation_count: 0,
    created_at: now,
    updated_at: now,
  }

  await ref.set(newArticle)

  return {
    id: ref.id,
    ...article,
    citation_count: 0,
    created_at: now.toDate(),
    updated_at: now.toDate(),
  }
}

export async function getKnowledgeArticle(id: string): Promise<KnowledgeArticle | null> {
  const doc = await db.collection(COLLECTIONS.KNOWLEDGE_ARTICLES).doc(id).get()

  if (!doc.exists) {
    return null
  }

  const data = doc.data()!
  return {
    id: doc.id,
    brand_id: data.brand_id || null,
    title: data.title,
    type: data.type,
    content: data.content,
    url: data.url,
    category: data.category,
    citation_count: data.citation_count || 0,
    last_cited_at: data.last_cited_at ? data.last_cited_at.toDate() : null,
    created_at: data.created_at.toDate(),
    updated_at: data.updated_at.toDate(),
  }
}

export async function getAllKnowledgeArticles(brandId?: string): Promise<KnowledgeArticle[]> {
  let query = db.collection(COLLECTIONS.KNOWLEDGE_ARTICLES).orderBy('created_at', 'desc')

  if (brandId) {
    query = query.where('brand_id', '==', brandId) as any
  }

  const snapshot = await query.get()

  return snapshot.docs.map(doc => {
    const data = doc.data()
    return {
      id: doc.id,
      brand_id: data.brand_id || null,
      title: data.title,
      type: data.type,
      content: data.content,
      url: data.url,
      category: data.category,
      citation_count: data.citation_count || 0,
      last_cited_at: data.last_cited_at ? data.last_cited_at.toDate() : null,
      created_at: data.created_at.toDate(),
      updated_at: data.updated_at.toDate(),
    }
  })
}

export async function updateKnowledgeArticle(id: string, updates: Partial<Omit<KnowledgeArticle, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
  await db.collection(COLLECTIONS.KNOWLEDGE_ARTICLES).doc(id).update({
    ...updates,
    updated_at: Timestamp.now(),
  })
}

export async function deleteKnowledgeArticle(id: string): Promise<void> {
  await db.collection(COLLECTIONS.KNOWLEDGE_ARTICLES).doc(id).delete()
}
