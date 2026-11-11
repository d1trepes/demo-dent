import type { Metadata } from "next";
import { LoginView } from "@/components/kabinet/LoginView";
import { getKabinetContent } from "@/lib/api";

export async function generateMetadata(): Promise<Metadata> {
  const { login } = await getKabinetContent();
  return { title: login.metaTitle };
}

export default async function KabinetVhodPage() {
  const { login } = await getKabinetContent();
  return <LoginView texts={login} />;
}
