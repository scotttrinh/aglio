"use client";
import { startTransition } from "react";
import { redirect } from "next/navigation";
import { signOut } from "@/app/actions";

export default function SignoutPage() {
  startTransition(() => {
    signOut();
  });
  redirect("/");
}
