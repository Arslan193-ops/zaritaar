import { getStoreSettings } from "@/lib/settings"
import AdsSettingsForm from "../AdsSettingsForm"

export const dynamic = "force-dynamic"

export default async function AdsSettingsPage() {
  const settings = await getStoreSettings()

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Ads Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Configure advertising pixel tracking and analytics.</p>
      </div>

      <AdsSettingsForm settings={settings} />
    </div>
  )
}
