import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'RevIntel - AI Search Intelligence Platform'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #ffffff 0%, #f3f4f6 100%)',
          padding: '80px',
        }}
      >
        {/* Logo and Brand */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
          <div
            style={{
              width: '120px',
              height: '120px',
              backgroundColor: '#111827',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '24px',
            }}
          >
            <span style={{ fontSize: '72px', fontWeight: 'bold', color: '#ffffff' }}>R</span>
          </div>
          <span style={{ fontSize: '64px', fontWeight: 'bold', color: '#111827' }}>RevIntel</span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: '42px',
            fontWeight: '600',
            color: '#111827',
            marginBottom: '32px',
          }}
        >
          AI Search Intelligence Platform
        </div>

        {/* Description */}
        <div style={{ fontSize: '28px', color: '#6b7280', marginBottom: '48px', display: 'flex', flexDirection: 'column' }}>
          <div>Monitor your brand visibility across ChatGPT,</div>
          <div>Claude, Perplexity, and Gemini</div>
        </div>

        {/* Feature Pills */}
        <div style={{ display: 'flex', gap: '20px' }}>
          <div
            style={{
              backgroundColor: '#111827',
              color: '#ffffff',
              padding: '16px 32px',
              borderRadius: '25px',
              fontSize: '20px',
              fontWeight: '600',
            }}
          >
            Brand Tracking
          </div>
          <div
            style={{
              backgroundColor: '#111827',
              color: '#ffffff',
              padding: '16px 32px',
              borderRadius: '25px',
              fontSize: '20px',
              fontWeight: '600',
            }}
          >
            AI Analytics
          </div>
          <div
            style={{
              backgroundColor: '#111827',
              color: '#ffffff',
              padding: '16px 32px',
              borderRadius: '25px',
              fontSize: '20px',
              fontWeight: '600',
            }}
          >
            Competitor Insights
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
