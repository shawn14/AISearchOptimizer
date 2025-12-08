"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Upload, Loader2, AlertCircle, ExternalLink, ArrowRight, ArrowLeft } from "lucide-react"

interface GAConnection {
  connected: boolean
  propertyId?: string
  lastSynced?: string
}

type SetupStep = 'welcome' | 'property-id' | 'service-account' | 'granting-access' | 'connecting' | 'done'

export default function SettingsPage() {
  const [gaConnection, setGaConnection] = useState<GAConnection>({ connected: false })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [currentStep, setCurrentStep] = useState<SetupStep>('welcome')
  const [propertyId, setPropertyId] = useState("")
  const [credentialsJson, setCredentialsJson] = useState("")
  const [serviceAccountEmail, setServiceAccountEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    checkGAConnection()
  }, [])

  async function checkGAConnection() {
    try {
      const response = await fetch('/api/analytics/connection')
      if (response.ok) {
        const data = await response.json()
        setGaConnection(data)
        if (data.connected) {
          setCurrentStep('done')
        }
        if (data.propertyId) {
          setPropertyId(data.propertyId)
        }
      }
    } catch (error) {
      console.error('Failed to check GA connection:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveGA() {
    setError(null)
    setSuccess(null)
    setSaving(true)

    try {
      // Validate inputs
      if (!propertyId || !credentialsJson) {
        setError("Please provide both Property ID and Service Account credentials")
        setSaving(false)
        return
      }

      // Validate JSON
      let credentials
      try {
        credentials = JSON.parse(credentialsJson)
      } catch (e) {
        setError("Invalid JSON format. Please paste valid JSON from your service account key file.")
        setSaving(false)
        return
      }

      // Save to Firebase
      const response = await fetch('/api/analytics/connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          credentials
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save GA connection')
      }

      setSuccess("Google Analytics connected successfully!")
      setGaConnection({ connected: true, propertyId, lastSynced: new Date().toISOString() })
      setCredentialsJson("") // Clear sensitive data from UI
      setCurrentStep('done')
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to save GA connection")
    } finally {
      setSaving(false)
    }
  }

  async function handleTestConnection() {
    setError(null)
    setSuccess(null)
    setTesting(true)

    try {
      const response = await fetch('/api/analytics/test-connection')

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || data.details || 'Connection test failed')
      }

      const data = await response.json()
      setSuccess(`Connection successful! Found ${data.metrics?.totalUsers || 0} users in the last 7 days.`)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Connection test failed")
    } finally {
      setTesting(false)
    }
  }

  async function handleDisconnect() {
    if (!confirm('Are you sure you want to disconnect Google Analytics?')) {
      return
    }

    try {
      const response = await fetch('/api/analytics/connection', {
        method: 'DELETE'
      })

      if (response.ok) {
        setGaConnection({ connected: false })
        setPropertyId("")
        setCredentialsJson("")
        setServiceAccountEmail("")
        setCurrentStep('welcome')
        setSuccess("Google Analytics disconnected")
      }
    } catch (error) {
      setError("Failed to disconnect Google Analytics")
    }
  }

  function handlePropertyIdSubmit() {
    if (!propertyId || !/^\d+$/.test(propertyId)) {
      setError("Please enter a valid numeric Property ID")
      return
    }
    setError(null)
    setCurrentStep('service-account')
  }

  function handleCredentialsSubmit() {
    try {
      const credentials = JSON.parse(credentialsJson)
      if (!credentials.type || !credentials.client_email) {
        setError("Invalid service account JSON. Make sure you copied the entire file.")
        return
      }
      setServiceAccountEmail(credentials.client_email)
      setError(null)
      setCurrentStep('granting-access')
    } catch (e) {
      setError("Invalid JSON. Please paste the entire contents of your downloaded JSON key file.")
    }
  }

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (!file) return

    // Check if it's a JSON file
    if (!file.name.endsWith('.json')) {
      setError("Please upload a JSON file")
      return
    }

    // Read the file
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setCredentialsJson(content)
      setError(null)
    }
    reader.onerror = () => {
      setError("Failed to read file")
    }
    reader.readAsText(file)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
  }

  function handleGrantAccessDone() {
    setCurrentStep('connecting')
    handleSaveGA()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and integrations
        </p>
      </div>

      {/* Google Analytics Setup Wizard */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Google Analytics</CardTitle>
              <CardDescription>
                Connect your Google Analytics to track website traffic
              </CardDescription>
            </div>
            {gaConnection.connected && (
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100">
                <CheckCircle className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">Error</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-emerald-900">Success</p>
                <p className="text-sm text-emerald-700 mt-1">{success}</p>
              </div>
            </div>
          )}

          {/* Welcome Step */}
          {currentStep === 'welcome' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  👋 Let's connect your Google Analytics
                </h3>
                <p className="text-sm text-gray-700 mb-4">
                  I'll guide you through this step-by-step. It only takes about 3 minutes, and you'll need access to:
                </p>
                <ul className="text-sm text-gray-700 space-y-2 mb-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Your Google Analytics account</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Google Cloud Console (I'll give you the link)</span>
                  </li>
                </ul>
                <Button
                  onClick={() => setCurrentStep('property-id')}
                  className="bg-gray-900 hover:bg-gray-800 gap-2"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 1: Property ID */}
          {currentStep === 'property-id' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">
                  Step 1: Get your Google Analytics Property ID
                </h3>
                <p className="text-sm text-blue-800 mb-3">
                  First, I need your GA4 Property ID. Here's how to find it:
                </p>
                <ol className="text-sm text-blue-800 space-y-2 mb-4 list-decimal list-inside">
                  <li>Open Google Analytics in a new tab</li>
                  <li>Click on "Admin" (gear icon in the bottom left)</li>
                  <li>Click "Property Settings"</li>
                  <li>Copy the "Property ID" number (it's just numbers, like 123456789)</li>
                </ol>
                <a
                  href="https://analytics.google.com/analytics/web/#/a/admin/streams"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-900 underline mb-4"
                >
                  Open Google Analytics Admin
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div className="space-y-2">
                <Label htmlFor="propertyId">Paste your Property ID here:</Label>
                <Input
                  id="propertyId"
                  placeholder="e.g., 123456789"
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                  className="text-base"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setCurrentStep('welcome')}
                  variant="outline"
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={handlePropertyIdSubmit}
                  disabled={!propertyId}
                  className="bg-gray-900 hover:bg-gray-800 gap-2"
                >
                  Next: Service Account
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Service Account */}
          {currentStep === 'service-account' && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-green-900 mb-2">
                  ✓ Property ID saved: {propertyId}
                </h3>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">
                  Step 2: Download a JSON Key File
                </h3>

                <ol className="text-sm text-blue-800 space-y-3 mb-4 list-decimal list-inside">
                  <li>
                    <span className="font-medium">Click the link below</span>
                  </li>
                  <li>
                    <span className="font-medium">Click on ANY service account in the list</span>
                    <p className="text-xs ml-5 mt-1 text-blue-700">(Or create a new one if you want)</p>
                  </li>
                  <li>
                    <span className="font-medium">Click the "Keys" tab</span>
                  </li>
                  <li>
                    <span className="font-medium">Click "Add Key" → "Create new key" → "JSON" → "Create"</span>
                    <p className="text-xs ml-5 mt-1 text-blue-700">A file will download</p>
                  </li>
                  <li>
                    <span className="font-medium">Open that file and copy everything inside it</span>
                  </li>
                </ol>
                <a
                  href="https://console.cloud.google.com/iam-admin/serviceaccounts"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-900 underline"
                >
                  Open Google Cloud Console
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div className="space-y-2">
                <Label htmlFor="credentials">Drag & drop your JSON file here, or paste the contents:</Label>
                <div
                  onDrop={handleFileDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`relative ${isDragging ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                >
                  <Textarea
                    id="credentials"
                    placeholder='Drag your .json file here, or paste the contents...'
                    value={credentialsJson}
                    onChange={(e) => setCredentialsJson(e.target.value)}
                    className="font-mono text-xs min-h-[200px]"
                  />
                  {isDragging && (
                    <div className="absolute inset-0 bg-blue-50 bg-opacity-90 border-2 border-dashed border-blue-400 rounded flex items-center justify-center pointer-events-none">
                      <div className="text-center">
                        <Upload className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm font-medium text-blue-900">Drop JSON file here</p>
                      </div>
                    </div>
                  )}
                </div>
                {credentialsJson && (
                  <p className="text-xs text-green-600">✓ JSON file loaded ({credentialsJson.length} characters)</p>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setCurrentStep('property-id')}
                  variant="outline"
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={handleCredentialsSubmit}
                  disabled={!credentialsJson}
                  className="bg-gray-900 hover:bg-gray-800 gap-2"
                >
                  Next: Grant Access
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Granting Access */}
          {currentStep === 'granting-access' && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-green-900 mb-1">
                  ✓ Service account created!
                </h3>
                <p className="text-xs text-green-800 font-mono mt-2">
                  {serviceAccountEmail}
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-amber-900 mb-2">
                  Step 3: Grant the service account access to your Analytics
                </h3>
                <p className="text-sm text-amber-800 mb-3">
                  Last step! You need to give this service account permission to read your analytics:
                </p>
                <ol className="text-sm text-amber-800 space-y-2 mb-4 list-decimal list-inside">
                  <li>Click the link below to open Google Analytics Admin</li>
                  <li>Click "Property Access Management"</li>
                  <li>Click the "+" button in the top right</li>
                  <li>Click "Add users"</li>
                  <li>
                    Paste this email address:
                    <div className="bg-white border border-amber-300 rounded px-2 py-1 mt-1 font-mono text-xs break-all">
                      {serviceAccountEmail}
                    </div>
                  </li>
                  <li>Make sure "Viewer" role is selected</li>
                  <li>Click "Add"</li>
                </ol>
                <a
                  href="https://analytics.google.com/analytics/web/#/a/admin/propertyAccess"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-amber-700 hover:text-amber-900 underline mb-4"
                >
                  Open Property Access Management
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-900 font-medium mb-1">
                  Done granting access?
                </p>
                <p className="text-xs text-blue-700">
                  Once you've added the service account as a Viewer in Google Analytics, click "Connect" below.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setCurrentStep('service-account')}
                  variant="outline"
                  className="gap-2"
                  disabled={saving}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
                <Button
                  onClick={handleGrantAccessDone}
                  disabled={saving}
                  className="bg-emerald-600 hover:bg-emerald-700 gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Connect Google Analytics
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Done Step */}
          {currentStep === 'done' && gaConnection.connected && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-lg p-6 text-center">
                <CheckCircle className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  🎉 Google Analytics Connected!
                </h3>
                <p className="text-sm text-gray-700 mb-4">
                  Your analytics data will now appear on the dashboard. It may take a few moments to load.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Property ID:</span>
                  <span className="font-medium">{gaConnection.propertyId}</span>
                </div>
                {gaConnection.lastSynced && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last Synced:</span>
                    <span className="font-medium">
                      {new Date(gaConnection.lastSynced).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleTestConnection}
                  disabled={testing}
                  variant="outline"
                  className="flex-1"
                >
                  {testing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    "Test Connection"
                  )}
                </Button>
                <Button
                  onClick={handleDisconnect}
                  variant="outline"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Disconnect
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Settings Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>
            Additional settings coming soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
            <li>Profile management</li>
            <li>API key configuration</li>
            <li>Notification preferences</li>
            <li>Webhook integrations</li>
            <li>Subscription management</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
