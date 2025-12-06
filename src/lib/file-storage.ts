import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const BRANDS_FILE = path.join(DATA_DIR, 'brands.json')
const AUDITS_FILE = path.join(DATA_DIR, 'audits.json')
const MONITORING_FILE = path.join(DATA_DIR, 'monitoring.json')

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

interface Brand {
  id: string
  name: string
  website_url: string
  industry: string | null
  description: string | null
  created_at: string
  updated_at: string
}

interface PageAudit {
  id: string
  brand_id: string
  page_url: string
  page_title: string | null
  is_homepage: boolean
  technical_score: number | null
  content_score: number | null
  aeo_score: number | null
  last_audited_at: string | null
  created_at: string
  updated_at: string
}

interface MonitoringRun {
  id: string
  brand_id: string
  brand_name: string
  visibility_score: number
  total_mentions: number
  queries_tested: number
  platform_results: any[]
  individual_results: any[]
  total_cost: number
  timestamp: string
}

// File operations
function readBrandsFromFile(): Brand[] {
  try {
    if (fs.existsSync(BRANDS_FILE)) {
      const data = fs.readFileSync(BRANDS_FILE, 'utf-8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading brands file:', error)
  }
  return []
}

function writeBrandsToFile(brands: Brand[]) {
  try {
    fs.writeFileSync(BRANDS_FILE, JSON.stringify(brands, null, 2), 'utf-8')
  } catch (error) {
    console.error('Error writing brands file:', error)
  }
}

function readAuditsFromFile(): PageAudit[] {
  try {
    if (fs.existsSync(AUDITS_FILE)) {
      const data = fs.readFileSync(AUDITS_FILE, 'utf-8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading audits file:', error)
  }
  return []
}

function writeAuditsToFile(audits: PageAudit[]) {
  try {
    fs.writeFileSync(AUDITS_FILE, JSON.stringify(audits, null, 2), 'utf-8')
  } catch (error) {
    console.error('Error writing audits file:', error)
  }
}

// Audit functions
export async function getAudits(brandId?: string): Promise<PageAudit[]> {
  const audits = readAuditsFromFile()
  if (brandId) {
    return audits.filter(a => a.brand_id === brandId)
  }
  return audits
}

export async function upsertAudit(audit: Omit<PageAudit, 'id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<PageAudit> {
  const audits = readAuditsFromFile()
  const now = new Date().toISOString()

  // Find existing audit by brand_id and page_url
  const existingIndex = audits.findIndex(
    a => a.brand_id === audit.brand_id && a.page_url === audit.page_url
  )

  if (existingIndex >= 0) {
    // Update existing
    audits[existingIndex] = {
      ...audits[existingIndex],
      ...audit,
      updated_at: now,
    }
    writeAuditsToFile(audits)
    return audits[existingIndex]
  } else {
    // Create new
    const newAudit: PageAudit = {
      id: audit.id || `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...audit,
      created_at: now,
      updated_at: now,
    }
    audits.push(newAudit)
    writeAuditsToFile(audits)
    return newAudit
  }
}

export async function deleteAudit(id: string): Promise<boolean> {
  const audits = readAuditsFromFile()
  const index = audits.findIndex(a => a.id === id)
  if (index >= 0) {
    audits.splice(index, 1)
    writeAuditsToFile(audits)
    return true
  }
  return false
}

// Brand functions
export async function getBrands(): Promise<Brand[]> {
  return readBrandsFromFile()
}

export async function getBrand(id: string): Promise<Brand | null> {
  const brands = readBrandsFromFile()
  return brands.find(b => b.id === id) || null
}

export async function createBrand(brand: Omit<Brand, 'id' | 'created_at' | 'updated_at'>): Promise<Brand> {
  const brands = readBrandsFromFile()
  const now = new Date().toISOString()
  const newBrand: Brand = {
    id: `brand_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...brand,
    created_at: now,
    updated_at: now,
  }
  brands.push(newBrand)
  writeBrandsToFile(brands)
  return newBrand
}

export async function updateBrand(id: string, updates: Partial<Omit<Brand, 'id' | 'created_at' | 'updated_at'>>): Promise<Brand | null> {
  const brands = readBrandsFromFile()
  const index = brands.findIndex(b => b.id === id)
  if (index >= 0) {
    brands[index] = {
      ...brands[index],
      ...updates,
      updated_at: new Date().toISOString(),
    }
    writeBrandsToFile(brands)
    return brands[index]
  }
  return null
}

export async function deleteBrand(id: string): Promise<boolean> {
  const brands = readBrandsFromFile()
  const audits = readAuditsFromFile()

  const brandIndex = brands.findIndex(b => b.id === id)
  if (brandIndex >= 0) {
    brands.splice(brandIndex, 1)
    writeBrandsToFile(brands)

    // Also delete associated audits
    const filteredAudits = audits.filter(a => a.brand_id !== id)
    writeAuditsToFile(filteredAudits)

    return true
  }
  return false
}

// Monitoring functions
function readMonitoringFromFile(): MonitoringRun[] {
  try {
    if (fs.existsSync(MONITORING_FILE)) {
      const data = fs.readFileSync(MONITORING_FILE, 'utf-8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading monitoring file:', error)
  }
  return []
}

function writeMonitoringToFile(runs: MonitoringRun[]) {
  try {
    fs.writeFileSync(MONITORING_FILE, JSON.stringify(runs, null, 2), 'utf-8')
  } catch (error) {
    console.error('Error writing monitoring file:', error)
  }
}

export async function saveMonitoringRun(run: Omit<MonitoringRun, 'id'>): Promise<MonitoringRun> {
  const runs = readMonitoringFromFile()
  const newRun: MonitoringRun = {
    id: `mon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...run,
  }
  runs.push(newRun)
  writeMonitoringToFile(runs)
  return newRun
}

export async function getMonitoringRuns(brandId?: string, limit: number = 50): Promise<MonitoringRun[]> {
  const runs = readMonitoringFromFile()
  let filtered = brandId ? runs.filter(r => r.brand_id === brandId) : runs
  // Sort by timestamp, most recent first
  filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  return filtered.slice(0, limit)
}

export async function getLatestMonitoringRun(brandId: string): Promise<MonitoringRun | null> {
  const runs = await getMonitoringRuns(brandId, 1)
  return runs[0] || null
}
