import { getStoreSettings } from "@/lib/settings";
import HeaderClient from "./HeaderClient";

interface HeaderProps {
  settings?: any;
}

export default async function Header({ settings: propSettings }: HeaderProps = {}) {
  // If settings are passed from a parent server component, use them to prevent double-fetching
  // Otherwise, fetch them independently here, allowing Header to be completely self-reliant globally!
  const settings = propSettings || await getStoreSettings();

  return <HeaderClient settings={settings} />;
}
