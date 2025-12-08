"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Upload, Loader2, AlertCircle } from "lucide-react"

interface GAConnection {
  connected: boolean
  propertyId?: string
  lastSynced?: string
}

export default function SettingsPage() {
  const [gaConnection, setGaConnection] = useState<GAConnection>({ connected: false })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [propertyId, setPropertyId] = useState("")
  const [credentialsJson, setCredentialsJson] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    checkGAConnection()
  }, [])

  async function checkGAConnection() {
    try {
      const response = await fetch('/api/analytics/connection')
      if (response.ok) {
        const data = await response.json()
        setGaConnection(data)
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
        setError("Invalid JSON format in credentials. Please paste valid JSON from your service account key file.")
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

      const data = await response.json()
      setSuccess("Google Analytics connected successfully!")
      setGaConnection({ connected: true, propertyId, lastSynced: new Date().toISOString() })
      setCredentialsJson("") // Clear sensitive data from UI
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
        setSuccess("Google Analytics disconnected")
      }
    } catch (error) {
      setError("Failed to disconnect Google Analytics")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and integrations
        </p>
      </div>

      {/* Google Analytics Connection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Google Analytics</CardTitle>
              <CardDescription>
                Connect your Google Analytics property to track website traffic
              </CardDescription>
            </div>
            {gaConnection.connected ? (
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100">
                <CheckCircle className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                <XCircle className="h-3 w-3 mr-1" />
                Not Connected
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

          {gaConnection.connected && (
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
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="propertyId">GA4 Property ID</Label>
              <Input
                id="propertyId"
                placeholder="e.g., 123456789"
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                disabled={gaConnection.connected}
              />
              <p className="text-xs text-muted-foreground">
                Find this in Google Analytics → Admin → Property Settings
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="credentials">Service Account JSON</Label>
              <Textarea
                id="credentials"
                placeholder='Paste your service account JSON here...'
                value={credentialsJson}
                onChange={(e) => setCredentialsJson(e.target.value)}
                className="font-mono text-xs min-h-[200px]"
                disabled={gaConnection.connected}
              />
              <p className="text-xs text-muted-foreground">
                Create a service account in Google Cloud Console → IAM & Admin → Service Accounts.
                Add the service account email as a Viewer in your GA property.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            {!gaConnection.connected ? (
              <>
                <Button
                  onClick={handleSaveGA}
                  disabled={saving || !propertyId || !credentialsJson}
                  className="bg-gray-900 hover:bg-gray-800"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Connect Google Analytics
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleTestConnection}
                  disabled={testing}
                  variant="outline"
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
              </>
            )}
          </div>

          {!gaConnection.connected && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm font-medium text-amber-900 mb-2">Setup Instructions:</p>
              <ol className="text-sm text-amber-800 space-y-1 list-decimal list-inside">
                <li>Go to Google Cloud Console and create a new service account</li>
                <li>Download the JSON key file for the service account</li>
                <li>In Google Analytics, add the service account email as a Viewer</li>
                <li>Copy your GA4 Property ID from Analytics → Admin → Property Settings</li>
                <li>Paste the Property ID and JSON key contents above</li>
              </ol>
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
