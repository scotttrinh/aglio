"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

import { initiatePKCE } from "@/app/actions";

export function SignIn({ authHref }: { authHref: string }) {
  const router = useRouter();
  const [urlHref, setUrlHref] = useState<string | null>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!hasRun.current) {
      console.log("useEffect: initiatePKCE");
      hasRun.current = true;
      initiatePKCE().then((challenge) => {
        const url = new URL(authHref);
        url.searchParams.set("challenge", challenge);
        console.log({ url: url.href });
        setUrlHref(url.href);
      });
    }
  }, [authHref]);

  useEffect(() => {
    if (urlHref) {
      router.replace(urlHref);
    }
  }, [urlHref, router]);

  return null;
}
