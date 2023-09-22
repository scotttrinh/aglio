import { Client } from "edgedb";

export type ProviderClientConfig = {
  providerId: string;
  providerName: string;
}

export type AuthConfig = {
  authSigningKey: string;
  providers: ProviderClientConfig[];
}

export async function getAuthConfig(client: Client): Promise<AuthConfig> {
  return await client.queryRequiredSingle<AuthConfig>(`
    select cfg::Config.extensions[is ext::auth::AuthConfig] {
      authSigningKey := .auth_signing_key,
      providers: {
        providerId := provider_id,
        providerName := provider_name,
      },
    };
  `);
}