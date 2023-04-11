import Link from "next/link";

import { getServerSessionUser } from "@/getServerSessionUser";

import { Breadcrumbs } from "./Breadcrumbs";

export async function Header() {
  const user = await getServerSessionUser();

  return (
    <header className="px-2 py-4 flex">
      <Breadcrumbs />
      <div className="ml-auto">
        {!user && (
          <Link href="/api/auth/signin" className="underline">
            Sign in
          </Link>
        )}
        {user && (
          <Link href="/api/auth/signout" className="underline">
            Sign out
          </Link>
        )}
      </div>
    </header>
  );
}
