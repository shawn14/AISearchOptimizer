import { DashboardNav } from "@/components/dashboard/nav"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 border-r bg-card min-h-screen p-4">
          <DashboardNav />
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="container mx-auto p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
