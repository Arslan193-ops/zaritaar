import Header from "@/components/storefront/Header"
import Footer from "@/components/storefront/Footer"
import { getStoreSettings } from "@/lib/settings"

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getStoreSettings()

  return (
    <>
      <Header settings={settings} />
      {children}
      <Footer storeName={settings?.storeName} />
    </>
  )
}
