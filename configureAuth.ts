import process from "node:process";
import crypto from "node:crypto";
import { createClient } from "edgedb";
import inquirer from "inquirer";

const client = createClient();

type AuthConfig = {
  token_time_to_live: string;
  providers: {
    provider_id: string;
    provider_name: string;
    url: string | null;
    secret: string | null;
    client_id: string | null;
  }[];
};

async function main() {
  const existingConfig = await client.queryRequiredSingle<AuthConfig>(`
SELECT cfg::Config.extensions[is ext::auth::AuthConfig] {
  *,
  providers: {
    *,
    [is ext::auth::OAuthProviderConfig].*,
  },
} limit 1
  `);
  const maybeExistingPasswordProvider = existingConfig.providers.find(
    (p) => p.provider_name === "builtin::password"
  );

  if (existingConfig.providers.length > 0) {
    console.warn(
      `Auth is already configured with the following values:
${JSON.stringify(existingConfig, null, 2)}

`
    );
  }

  const questions = [
    {
      type: "input",
      name: "authSigningKey",
      message: "Enter the signing key:",
      default: crypto.randomBytes(32).toString("hex"),
      validate: (val: string) =>
        val.length >= 32 || "The key must be at least 32 bytes long",
    },
    {
      type: "input",
      name: "tokenTTL",
      message: "Enter the token time to live:",
      default: existingConfig.token_time_to_live.toString() ?? "336 hours",
    },
    {
      type: "checkbox",
      name: "providers",
      message: "Would you like to enable any of the following OAuth providers?",
      choices: ["github", "google", "azure", "apple", "discord"],
      default:
        existingConfig.providers.map((provider) => provider.provider_name.split("::")[1] ?? null) ??
        [],
    },
    {
      type: "confirm",
      name: "enablePasswordAuth",
      message: "Would you like to enable local password authentication?",
    },
  ];

  const answers = await inquirer.prompt(questions);

  const providersDetails: [string, any][] = [];
  for (const provider of answers.providers) {
    const existingProvider = existingConfig.providers.find(
      (p) => p.provider_name === provider
    );
    const providerDetails = await inquirer.prompt([
      {
        type: "input",
        name: "clientId",
        message: `Enter the ${provider} client ID:`,
        default: existingProvider?.client_id,
      },
      {
        type: "input",
        name: "secret",
        message: `Enter the ${provider} secret:`,
        default: existingProvider?.secret,
      },
    ]);
    providersDetails.push([provider, providerDetails]);
  }

  let query = `
    CONFIGURE CURRENT DATABASE
    RESET ext::auth::ProviderConfig;

    CONFIGURE CURRENT DATABASE SET
    ext::auth::AuthConfig::auth_signing_key := '${answers.authSigningKey}';
  `;

  if (answers.tokenTTL) {
    query += `
      CONFIGURE CURRENT DATABASE SET
      ext::auth::AuthConfig::token_time_to_live := <duration>'${answers.tokenTTL}';
    `;
  }

  const PROVIDER_MAP: Record<string, string> = {
    "github": "GithubOAuthProvider",
    "google": "GoogleOAuthProvider",
    "apple": "AppleOAuthProvider",
    "azure": "AzureOAuthProvider",
    "discord": "DiscordOAuthProvider",
  };

  for (const [provider, providerDetails] of providersDetails) {
    const providerType = PROVIDER_MAP[provider];
    query += `
      CONFIGURE CURRENT DATABASE
      INSERT ext::auth::${providerType} {
        secret := '${providerDetails.secret}',
        client_id := '${providerDetails.clientId}'
      };
    `;
  }

  if (answers.enablePasswordAuth) {
    query += `
      CONFIGURE CURRENT DATABASE
      INSERT ext::auth::EmailPasswordProviderConfig {};
    `;
  }

  console.log("The following query will be executed:\n", query);
  const confirm = await inquirer.prompt({
    type: "confirm",
    name: "execute",
    message: "Do you want to execute this query?",
  });

  if (confirm.execute) {
    await client.execute(query);
  } else {
    return;
  }
}

main()
  .then(() => process.exit(0))
  .catch((err: Error) => {
    console.error(err);
    process.exit(1);
  });
