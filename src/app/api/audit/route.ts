import { NextRequest, NextResponse } from 'next/server'
import { savePageAudit } from '@/lib/firebase/storage'
import { auditPage } from '@/lib/auditing/page-audit'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, brandId } = body

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    console.log(`Starting audit for: ${url}`)

    // Run the audit
    const auditResult = await auditPage(url)

    console.log('Audit completed:', {
      technical: auditResult.technical.score,
      content: auditResult.content.score,
      aeo: auditResult.aeo.score,
    })

    // Save to Firebase
    const savedAudit = await savePageAudit({
      page_url: url,
      page_title: auditResult.title,
      technical_score: auditResult.technical.score,
      content_score: auditResult.content.score,
      aeo_score: auditResult.aeo.score,
      issues: [
        ...auditResult.technical.issues,
        ...auditResult.content.issues,
        ...auditResult.aeo.issues,
      ],
      last_audited_at: new Date(),
    })

    return NextResponse.json({ success: true, audit: auditResult, saved: savedAudit })

  } catch (error) {
    console.error('Audit error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Audit failed',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
