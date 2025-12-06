// Simple in-memory storage for development (replace with Supabase in production)

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

// In-memory stores
let brands: Brand[] = []
let audits: PageAudit[] = []

export async function getAudits(brandId?: string): Promise<PageAudit[]> {
  if (brandId) {
    return audits.filter(a => a.brand_id === brandId)
  }
  return audits
}

export async function upsertAudit(audit: Omit<PageAudit, 'id' | 'created_at' | 'updated_at'> & { id?: string }): Promise<PageAudit> {
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
    return newAudit
  }
}

export async function deleteAudit(id: string): Promise<boolean> {
  const index = audits.findIndex(a => a.id === id)
  if (index >= 0) {
    audits.splice(index, 1)
    return true
  }
  return false
}

// Brand functions
export async function getBrands(): Promise<Brand[]> {
  return brands
}

export async function getBrand(id: string): Promise<Brand | null> {
  return brands.find(b => b.id === id) || null
}

export async function createBrand(brand: Omit<Brand, 'id' | 'created_at' | 'updated_at'>): Promise<Brand> {
  const now = new Date().toISOString()
  const newBrand: Brand = {
    id: `brand_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...brand,
    created_at: now,
    updated_at: now,
  }
  brands.push(newBrand)
  return newBrand
}

export async function updateBrand(id: string, updates: Partial<Omit<Brand, 'id' | 'created_at' | 'updated_at'>>): Promise<Brand | null> {
  const index = brands.findIndex(b => b.id === id)
  if (index >= 0) {
    brands[index] = {
      ...brands[index],
      ...updates,
      updated_at: new Date().toISOString(),
    }
    return brands[index]
  }
  return null
}

export async function deleteBrand(id: string): Promise<boolean> {
  const index = brands.findIndex(b => b.id === id)
  if (index >= 0) {
    brands.splice(index, 1)
    // Also delete associated audits
    audits = audits.filter(a => a.brand_id !== id)
    return true
  }
  return false
}
