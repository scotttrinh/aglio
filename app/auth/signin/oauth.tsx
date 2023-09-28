"use client";

import { startTransition } from "react";
import { useRouter } from "next/navigation";

import { initiatePKCE } from "@/app/actions";

export function SignInWithOAuth({
  providerHref,
  providerName,
}: {
  providerHref: string;
  providerName: string;
}) {
  const router = useRouter();
  const handleClick = () => {
    startTransition(() => {
      initiatePKCE().then((challenge) => {
        const url = new URL(providerHref);
        url.searchParams.set("challenge", challenge);
        router.replace(url.href);
      });
    });
  };

  return (
    <div
      onClick={handleClick}
      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
    >
      Sign in with {providerName}
    </div>
  );
}
