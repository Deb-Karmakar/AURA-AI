import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SettingsContent from "./SettingsContent";

export default async function SettingsPage() {
  const session = await auth();
  
  if (!session) {
    redirect("/auth/signin");
  }

  return <SettingsContent />;
}
