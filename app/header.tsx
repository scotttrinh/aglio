import Link from "next/link";
import { getServerSession } from "next-auth/next";
import clsx from "clsx";

import { Logo } from "@/components/logo";
import { authOptions } from "@/authOptions";

export const Header = async () => {
  const session = await getServerSession(authOptions);

  return (
    <header className={clsx("text-slate-50 grid gap-2 grid-cols-header")}>
      <Logo alt="Aglio" />
      <nav>Nav</nav>
      {!session && (
        <Link href="/api/auth/signin" className={clsx("underline")}>
          Sign in
        </Link>
      )}
      {session && (
        <Link href="/api/auth/signout" className={clsx("underline")}>
          Sign out
        </Link>
      )}
    </header>
  );
};
