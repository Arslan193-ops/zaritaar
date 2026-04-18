import { getStoreSettings } from "@/lib/settings";
import HeaderClient from "./HeaderClient";

interface HeaderProps {
  settings?: any;
}

export default function Header({ settings }: HeaderProps = {}) {
  const currentSettings = settings;
  return <HeaderClient settings={currentSettings} />;
}
