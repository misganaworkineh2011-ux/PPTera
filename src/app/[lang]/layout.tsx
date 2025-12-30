import { generateLanguageParams } from "~/lib/i18n";

export async function generateStaticParams() {
  return generateLanguageParams();
}

export default function LangLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
