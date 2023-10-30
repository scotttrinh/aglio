"use client";
import { useState, useTransition, useRef } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import {
  initiatePKCE,
  signInWithPassword,
  signUpWithPassword,
} from "@/app/actions";
import { useSactRefresh } from "@/app/useSact";

const Credentials = z.object({
  challenge: z.string(),
  provider: z.string(),
  email: z.string(),
  password: z.string(),
});

export function SignInWithPassword({ provider }: { provider: string }) {
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const [isCreatingAccount, startTransition] = useTransition();
  const router = useRouter();
  const { act: handleSubmit, isBusy } = useSactRefresh(
    async (formData: FormData) => {
      setFormErrors([]);
      try {
        const email = formData.get("email");
        const challenge = await initiatePKCE(email?.toString());
        await signInWithPassword(
          Credentials.parse({
            challenge,
            email,
            provider: formData.get("provider"),
            password: formData.get("password"),
          })
        );
      } catch (e) {
        setFormErrors((existing) => [...existing, (e as Error).message]);
      }
      router.replace("/");
    }
  );

  const { act: handleCreateAccount, isBusy: isBusyCreatingAccount } =
    useSactRefresh(async () => {
      setFormErrors(["Creating..."]);
      if (formRef.current === null) {
        setFormErrors(["Form ref was not set"]);
        return;
      }

      const formData = new FormData(formRef.current);
      try {
        const email = formData.get("email");
        const challenge = await initiatePKCE(email?.toString());
        await signUpWithPassword(
          Credentials.parse({
            challenge,
            email,
            provider: formData.get("provider"),
            password: formData.get("password"),
          })
        );
        setFormErrors(["Successfully created account"]);
        router.replace("/");
      } catch (e) {
        setFormErrors((existing) => [...existing, (e as Error).message]);
      }
    });

  return (
    <form action={handleSubmit} ref={formRef} className="space-y-6">
      {formErrors.length > 0 && (
        <div className="mt-2 text-sm text-red-600">
          {formErrors.map((error, index) => (
            <div key={index}>{error}</div>
          ))}
        </div>
      )}

      <input type="hidden" name="provider" value={provider} />
      <div>
        <label htmlFor="email" className="sr-only">
          Email
        </label>
        <Input
          type="email"
          id="email"
          name="email"
          required
          placeholder="Email address"
        />
      </div>
      <div>
        <label htmlFor="password" className="sr-only">
          Password
        </label>
        <Input
          type="password"
          id="password"
          name="password"
          required
          placeholder="Password"
        />
      </div>
      <Button type="submit" disabled={isBusy}>
        Sign In
      </Button>
      <Button
        type="button"
        disabled={isBusy}
        onClick={() => startTransition(() => handleCreateAccount(undefined))}
      >
        Create Account
      </Button>
    </form>
  );
}
