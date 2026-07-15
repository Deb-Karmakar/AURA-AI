import { auth } from "@/auth";
import { notFound } from "next/navigation";
import SettingsContent from "./SettingsContent";

export default async function SettingsPage() {
  const session = await auth();
  
  if (!session) {
    notFound();
  }

  return <SettingsContent />;
}
