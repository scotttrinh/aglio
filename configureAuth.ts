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
    [is ext::auth::OAuthClientConfig].*,
  },
} limit 1
  `);
  const maybeExistingPasswordProvider = existingConfig.providers.find(
    (p) => p.provider_name === "password"
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
      choices: ["github", "google", "azure", "apple"],
      default:
        existingConfig.providers.map((provider) => provider.provider_name) ??
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
        name: "url",
        message: `Enter the ${provider} URL:`,
        default: existingProvider?.url,
      },
      {
        type: "input",
        name: "providerId",
        message: `Enter the ${provider} provider ID:`,
        default: existingProvider?.provider_id ?? crypto.randomUUID(),
      },
      {
        type: "input",
        name: "secret",
        message: `Enter the ${provider} secret:`,
        default: existingProvider?.secret,
      },
      {
        type: "input",
        name: "clientId",
        message: `Enter the ${provider} client ID:`,
        default: existingProvider?.client_id,
      },
    ]);
    providersDetails.push([provider, providerDetails]);
  }

  if (answers.enablePasswordAuth) {
    const providerIdDefault =
      maybeExistingPasswordProvider?.provider_id ?? crypto.randomUUID();
    const { passwordId } = await inquirer.prompt({
      type: "input",
      name: "passwordId",
      message: "Enter the password provider ID:",
      default: providerIdDefault,
    });
    answers.passwordId = passwordId;
  }

  let query = `
    CONFIGURE CURRENT DATABASE SET
    ext::auth::AuthConfig::auth_signing_key := '${answers.authSigningKey}';
  `;

  if (answers.tokenTTL) {
    query += `
      CONFIGURE CURRENT DATABASE SET
      ext::auth::AuthConfig::token_time_to_live := <duration>'${answers.tokenTTL}';
    `;
  }

  for (const [provider, providerDetails] of providersDetails) {
    query += `
      CONFIGURE CURRENT DATABASE
      INSERT ext::auth::OAuthClientConfig {
        provider_name := '${provider}',
        url := '${providerDetails.url}',
        provider_id := '${providerDetails.providerId}',
        secret := '${providerDetails.secret}',
        client_id := '${providerDetails.clientId}'
      };
    `;
  }

  if (answers.enablePasswordAuth && answers.passwordId) {
    query += `
      CONFIGURE CURRENT DATABASE
      INSERT ext::auth::PasswordClientConfig {
        provider_name := 'password',
        provider_id := '${answers.passwordId}',
      };
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
