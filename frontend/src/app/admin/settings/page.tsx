import { getStoreSettings, getShippingMethods } from "@/lib/settings"
import { SettingsForm } from "./SettingsForm"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Site Settings - Store Admin",
}

export default async function SettingsPage() {
  // Pull existing settings from the performance cache
  const settings = await getStoreSettings()
  const shipping = await getShippingMethods()

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Site Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage global preferences and store configurations.</p>
      </div>

      <SettingsForm 
        initialSettings={settings}
        initialShipping={shipping}
      />
    </div>
  )
}
