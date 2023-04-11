"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

import { Logo } from "@/components/logo";

export function Breadcrumbs() {
  const pathname = usePathname();

  if (pathname === null) return null;

  const paths = pathname.split("/").filter((p) => p);

  const breadcrumbs = paths.map((path, index) => {
    const href = `/${paths.slice(0, index + 1).join("/")}`;
    const name = path
      .split("-")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");
    return { name, href };
  });

  return (
    <div className="flex gap-2">
      <Link href="/">
        <Logo alt="Aglio" />
      </Link>
      <span>/</span>
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={breadcrumb.href} className="flex gap-2">
          {index > 0 && <span>/</span>}
          <Link href={breadcrumb.href} className="underline">{breadcrumb.name}</Link>
        </div>
      ))}
    </div>
  );
}
