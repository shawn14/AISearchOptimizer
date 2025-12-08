"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, XCircle, Loader2, AlertCircle, ExternalLink } from "lucide-react"

interface GAConnection {
  connected: boolean
  propertyId?: string
  lastSynced?: string
  availableProperties?: Array<{ id: string; name: string }>
}

export default function SettingsPage() {
  const [gaConnection, setGaConnection] = useState<GAConnection>({ connected: false })
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [testing, setTesting] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    checkGAConnection()

    // Check for OAuth callback params
    const params = new URLSearchParams(window.location.search)
    const oauthStatus = params.get('oauth')
    const oauthError = params.get('error')
    const propertiesParam = params.get('properties')

    if (oauthStatus === 'success') {
      setSuccess("Connected to Google successfully! Please select your GA4 property below.")
      checkGAConnection()

      // Parse properties if available
      if (propertiesParam) {
        try {
          const properties = JSON.parse(decodeURIComponent(propertiesParam))
          setGaConnection(prev => ({ ...prev, availableProperties: properties }))
        } catch (e) {
          console.error('Failed to parse properties:', e)
        }
      }

      // Clean URL
      window.history.replaceState({}, '', '/dashboard/settings')
    }

    if (oauthError) {
      setError("Failed to connect to Google Analytics. Please try again.")
      // Clean URL
      window.history.replaceState({}, '', '/dashboard/settings')
    }
  }, [])

  async function checkGAConnection() {
    try {
      const response = await fetch('/api/analytics/connection')
      if (response.ok) {
        const data = await response.json()
        setGaConnection(data)
        if (data.propertyId) {
          setSelectedProperty(data.propertyId)
        }
      }
    } catch (error) {
      console.error('Failed to check GA connection:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleConnectGA() {
    setError(null)
    setSuccess(null)
    setConnecting(true)

    try {
      // Get OAuth URL from backend
      const response = await fetch('/api/auth/google')
      if (!response.ok) {
        throw new Error('Failed to initiate OAuth flow')
      }

      const { url } = await response.json()

      // Redirect to Google OAuth
      window.location.href = url
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to connect to Google")
      setConnecting(false)
    }
  }

  async function handleSelectProperty(propertyId: string) {
    setSelectedProperty(propertyId)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/analytics/select-property', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId })
      })

      if (!response.ok) {
        throw new Error('Failed to save selected property')
      }

      setSuccess("Property selected successfully!")
      setGaConnection(prev => ({ ...prev, propertyId, connected: true }))
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to select property")
    }
  }

  async function handleTestConnection() {
    setError(null)
    setSuccess(null)
    setTesting(true)

    try {
      const response = await fetch('/api/analytics/test-connection')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Connection test failed')
      }

      setSuccess(`Connection successful! Found ${data.metrics.totalUsers} users and ${data.metrics.totalSessions} sessions in the last 7 days.`)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Connection test failed")
    } finally {
      setTesting(false)
    }
  }

  async function handleDisconnect() {
    if (!confirm("Are you sure you want to disconnect Google Analytics?")) {
      return
    }

    try {
      const response = await fetch('/api/analytics/connection', {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to disconnect')
      }

      setGaConnection({ connected: false })
      setSelectedProperty("")
      setSuccess("Google Analytics disconnected successfully")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to disconnect")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account and integrations</p>
      </div>

      {/* Google Analytics Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Google Analytics</CardTitle>
              <CardDescription>
                Connect your Google Analytics to track website traffic
              </CardDescription>
            </div>
            {gaConnection.connected ? (
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                <CheckCircle className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="text-gray-600">
                <XCircle className="h-3 w-3 mr-1" />
                Not Connected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">{error}</div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-800">{success}</div>
            </div>
          )}

          {!gaConnection.connected ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-2">Quick & Easy Setup</h3>
                <p className="text-sm text-blue-800 mb-4">
                  Connect your Google Analytics in seconds with a simple sign-in flow. No technical setup required!
                </p>
                <ul className="text-sm text-blue-800 space-y-2 mb-4">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Sign in with your Google account
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Grant read-only access to your GA data
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Select your GA4 property - done!
                  </li>
                </ul>
                <Button
                  onClick={handleConnectGA}
                  disabled={connecting}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {connecting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Connect with Google
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Google Analytics Connected!
                </h3>
                <p className="text-sm text-green-800">
                  Your analytics data will now appear on the dashboard.
                </p>
              </div>

              {gaConnection.availableProperties && gaConnection.availableProperties.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select GA4 Property</label>
                  <Select value={selectedProperty} onValueChange={handleSelectProperty}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a property..." />
                    </SelectTrigger>
                    <SelectContent>
                      {gaConnection.availableProperties.map((prop) => (
                        <SelectItem key={prop.id} value={prop.id}>
                          {prop.name} ({prop.id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {gaConnection.propertyId && (
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Property ID:</span> {gaConnection.propertyId}
                  </div>
                  {gaConnection.lastSynced && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Last Synced:</span>{' '}
                      {new Date(gaConnection.lastSynced).toLocaleString()}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleTestConnection}
                  disabled={testing || !gaConnection.propertyId}
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
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
