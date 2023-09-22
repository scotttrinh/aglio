import Link from "next/link";

import { client } from "@/client";
import { SignInWithPassword } from "./password";

export default async function SignIn() {
  const providers = await client.query<{
    provider_id: string;
    provider_name: string;
  }>(`
    select cfg::Config.extensions[is ext::auth::AuthConfig].providers {
      provider_id,
      provider_name,
    };
  `);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold">
            Sign in to your account
          </h2>
        </div>
        <div className="mt-8 space-y-6">
          {providers.map(({ provider_id, provider_name }) =>
            provider_name === "password" ? (
              <SignInWithPassword provider={provider_id} key={provider_id} />
            ) : (
              <div key={provider_id}>
                <Link
                  href={`/auth/signin/${provider_id}`}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Sign in with {provider_name}
                </Link>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
