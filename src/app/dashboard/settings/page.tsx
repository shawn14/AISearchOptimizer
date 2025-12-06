import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>
            Settings page coming soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This page will include:
          </p>
          <ul className="list-disc list-inside space-y-2 mt-4 text-sm text-muted-foreground">
            <li>Profile management</li>
            <li>API key configuration</li>
            <li>Notification preferences</li>
            <li>Webhook integrations</li>
            <li>Subscription management</li>
            <li>Billing information</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
