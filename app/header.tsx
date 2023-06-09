import Link from "next/link";

import { getSession } from "@/getSession";

import { Breadcrumbs } from "./Breadcrumbs";

export const Header = (async function Header() {
  const session = await getSession();

  return (
    <header className="px-2 py-4 flex bg-gray-700 border-b border-gray-600">
      <Breadcrumbs />
      <div className="ml-auto">
        {session.state === "LOGGED_OUT" && (
          <Link href="/api/auth/signin" className="underline">
            Sign in
          </Link>
        )}
        {session.state === "LOGGED_IN" && (
          <Link href="/api/auth/signout" className="underline">
            Sign out
          </Link>
        )}
      </div>
    </header>
  );
} as unknown as () => JSX.Element);
