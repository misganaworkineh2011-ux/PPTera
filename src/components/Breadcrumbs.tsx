"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { usePathname } from "next/navigation";

interface BreadcrumbItem {
  label: string;
  href: string;
}

export function Breadcrumbs() {
  const pathname = usePathname();
  
  // Don't show breadcrumbs on homepage or dashboard
  if (pathname === "/" || pathname.startsWith("/dashboard")) {
    return null;
  }

  const pathSegments = pathname.split("/").filter(Boolean);
  
  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
  ];

  let currentPath = "";
  pathSegments.forEach((segment) => {
    currentPath += `/${segment}`;
    const label = segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    breadcrumbs.push({ label, href: currentPath });
  });

  // Generate JSON-LD structured data for breadcrumbs
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": `${process.env.NEXT_PUBLIC_APP_URL || "https://www.pptmaster.app"}${item.href}`
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <nav aria-label="Breadcrumb" className="py-3 px-6 bg-slate-50/50 border-b border-slate-100">
        <ol className="flex items-center gap-2 text-sm max-w-7xl mx-auto">
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            const isFirst = index === 0;
            
            return (
              <li key={item.href} className="flex items-center gap-2">
                {!isFirst && (
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                )}
                {isLast ? (
                  <span className="text-slate-900 font-medium" aria-current="page">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1.5"
                    aria-label={isFirst ? "Go to homepage" : `Go to ${item.label}`}
                  >
                    {isFirst ? (
                      <Home className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      item.label
                    )}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
