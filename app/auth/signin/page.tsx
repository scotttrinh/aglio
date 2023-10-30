import { client } from "@/client";
import { getServerConfig } from "@/config";

import { SignInWithPassword } from "./password";
import { SignInWithOAuth } from "./oauth";
import HostedAuthPage from "./hostedAuthPage";

function buildOAuthAuthorizeHref(providerId: string): string {
  const redirectTo = new URL("auth/callback", getServerConfig().APP_BASE_URL);
  const url = new URL("authorize", getServerConfig().EDGEDB_AUTH_BASE_URL);
  url.searchParams.set("provider", providerId);
  url.searchParams.set("redirect_to", redirectTo.href);

  return url.href;
}

type PasswordProvider = {
  name: "builtin::local_emailpassword"
};

type OAuthProvider = {
  name: string;
  displayName: string;
}

type Provider = PasswordProvider | OAuthProvider;

export default HostedAuthPage;

export async function SignIn() {
  const providers = await client.query<Provider>(`
    select cfg::Config.extensions[is ext::auth::AuthConfig].providers {
      name,
      displayName := [is ext::auth::OAuthProviderConfig].display_name,
    };
  `);

  const maybePasswordProvider = providers.find(
    (p): p is PasswordProvider => p.name === "builtin::local_emailpassword"
  );
  const otherProviders: OAuthProvider[] = providers.filter(
    (p): p is OAuthProvider => p.name !== "builtin::local_emailpassword"
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
              provider={maybePasswordProvider.name}
              key={maybePasswordProvider.name}
            />
          )}
          {otherProviders.map(({ name, displayName }) => (
            <SignInWithOAuth
              providerHref={buildOAuthAuthorizeHref(name)}
              providerName={displayName}
              key={name}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

