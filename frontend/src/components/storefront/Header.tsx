import { getStoreSettings } from "@/lib/settings";
import { getStoreCategories } from "@/lib/storefront-actions";
import HeaderClient from "./HeaderClient";

interface HeaderProps {
  settings?: any;
}

export default async function Header({ settings }: HeaderProps = {}) {
  const [categories, currentSettings] = await Promise.all([
    getStoreCategories(),
    settings ? Promise.resolve(settings) : getStoreSettings()
  ]);
  
  return <HeaderClient settings={currentSettings} categories={categories} />;
}
