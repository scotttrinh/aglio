import { client } from "@/client";
import { getServerConfig } from "@/config";

import { SignInWithPassword } from "./password";

function buildOAuthAuthorizeHref(providerId: string): string {
  const redirectTo = new URL("auth/callback", getServerConfig().APP_BASE_URL);
  const url = new URL("authorize", getServerConfig().EDGEDB_AUTH_BASE_URL);
  url.searchParams.set("provider", providerId);
  url.searchParams.set("redirect_to", redirectTo.href);

  return url.href;
}

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

  const maybePasswordProvider = providers.find(
    (p) => p.provider_name === "password"
  );
  const otherProviders = providers.filter(
    (p) => p.provider_name !== "password"
  );

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold">
            Sign in to your account
          </h2>
        </div>
        <div className="mt-8 space-y-6">
          {maybePasswordProvider && (
            <SignInWithPassword
              provider={maybePasswordProvider.provider_id}
              key={maybePasswordProvider.provider_id}
            />
          )}
          {otherProviders.map(({ provider_id, provider_name }) => (
            <div key={provider_id}>
              <a
                href={buildOAuthAuthorizeHref(provider_id)}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Sign in with {provider_name}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
