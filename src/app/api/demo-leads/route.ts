import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const DATA_DIR = path.join(process.cwd(), "data")
const LEADS_FILE = path.join(DATA_DIR, "demo-leads.json")

interface DemoLead {
  id: string
  email: string
  brandName: string
  competitor: string
  industry: string
  result: any
  createdAt: string
}

export async function POST(request: NextRequest) {
  try {
    const { email, brandName, competitor, industry, result } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    // Ensure data directory exists
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true })
    }

    // Read existing leads
    let leads: DemoLead[] = []
    if (fs.existsSync(LEADS_FILE)) {
      const data = fs.readFileSync(LEADS_FILE, "utf-8")
      leads = JSON.parse(data)
    }

    // Create new lead
    const newLead: DemoLead = {
      id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      brandName,
      competitor,
      industry,
      result,
      createdAt: new Date().toISOString(),
    }

    // Add to leads
    leads.push(newLead)

    // Save to file
    fs.writeFileSync(LEADS_FILE, JSON.stringify(leads, null, 2), "utf-8")

    // TODO: Send to email marketing platform (Mailchimp, ConvertKit, etc.)
    // TODO: Send confirmation email to user

    return NextResponse.json({
      success: true,
      message: "Lead captured successfully",
    })
  } catch (error) {
    console.error("Demo lead error:", error)
    return NextResponse.json(
      { error: "Failed to save lead" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    if (!fs.existsSync(LEADS_FILE)) {
      return NextResponse.json({ leads: [] })
    }

    const data = fs.readFileSync(LEADS_FILE, "utf-8")
    const leads = JSON.parse(data)

    return NextResponse.json({ leads })
  } catch (error) {
    console.error("Error fetching leads:", error)
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    )
  }
}
