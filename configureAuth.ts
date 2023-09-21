import process from "node:process";
import crypto from "node:crypto";
import { createClient } from "edgedb";
import inquirer from "inquirer";

const client = createClient();

async function main() {
  console.log("Checking for existing auth config");

  const signingKeyIsSet = await client.queryRequiredSingle(`
SELECT ext::auth::signing_key_exists();
  `);

  if (signingKeyIsSet) {
    console.log("Authentication signing key is set, skipping configuration");
    return;
  }

  const questions = [
    {
      type: "input",
      name: "authSigningKey",
      message: "Enter the signing key:",
      default: crypto.randomBytes(32).toString("hex"),
      validate: (val: string) => val.length >= 32 || "The key must be at least 32 bytes long",
    },
    {
      type: "input",
      name: "tokenTTL",
      message: "Enter the token time to live:",
      default: "336 hours",
    },
    {
      type: "checkbox",
      name: "providers",
      message: "Would you like to enable any of the following OAuth providers?",
      choices: ["github", "google", "azure", "apple"],
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
    const providerDetails = await inquirer.prompt([
      {
        type: "input",
        name: "url",
        message: `Enter the ${provider} URL:`,
      },
      {
        type: "input",
        name: "providerId",
        message: `Enter the ${provider} provider ID:`,
        default: crypto.randomUUID(),
      },
      {
        type: "input",
        name: "secret",
        message: `Enter the ${provider} secret:`,
      },
      {
        type: "input",
        name: "clientId",
        message: `Enter the ${provider} client ID:`,
      },
    ]);
    providersDetails.push([provider, providerDetails]);
  }

  if (answers.enablePasswordAuth) {
    const { passwordId } = await inquirer.prompt({
      type: "input",
      name: "passwordId",
      message: "Enter the password provider ID:",
      default: crypto.randomUUID(),
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
    console.log(`Setting up ${provider} OAuth provider`);

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
    console.log("Setting up password provider");
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
