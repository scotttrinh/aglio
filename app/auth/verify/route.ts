import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getServerConfig } from "@/config";
import { CodeResponse, TokenResponse, makeTokenUrl } from "@/app/authService";
import { client as anonymousClient } from "@/client";

type WithVerifier = {
  verifier: string;
};

const RequestSearchParams = z.object({
  verificationToken: z.string(),
  provider: z.string(),
  email: z.string(),
});

export async function GET(request: NextRequest): Promise<NextResponse> {
  const searchParams = new URL(request.url).searchParams;

  const result = RequestSearchParams.safeParse({
    verificationToken: searchParams.get("verification_token"),
    provider: searchParams.get("provider"),
    email: searchParams.get("email"),
  });
  if (!result.success) {
    console.log({
      verificationToken: searchParams.get("verification_token"),
      provider: searchParams.get("provider"),
      email: searchParams.get("email"),
    });
    console.error(result.error);
    redirect("/auth/signin");
  }

  const { verificationToken, provider, email } = result.data;

  const verifyUrl = new URL("verify", getServerConfig().EDGEDB_AUTH_BASE_URL);

  const verifyResponse = await fetch(verifyUrl.href, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ verification_token: verificationToken, provider }),
  });
  if (!verifyResponse.ok) {
    console.log({
      status: verifyResponse.status,
      body: await verifyResponse.text(),
    });
    redirect("/auth/signin");
  }

  const { code } = CodeResponse.parse(await verifyResponse.json());
  const flow = await anonymousClient.querySingle<WithVerifier | null>(
    `select PKCEFlow { verifier } filter .email = <str>$email;`,
    { email }
  );
  let verifier: string | null = null;
  if (flow) {
    verifier = flow.verifier;
  } else {
    verifier = cookies().get("edgedb_pkce_verifier")?.value ?? null;
  }

  if (!verifier) {
    throw new Error(`Could not find verifier`);
  }

  const tokenUrl = makeTokenUrl(code, verifier);
  const tokenResponse = await fetch(tokenUrl.href, {
    method: "GET",
  });
  if (!tokenResponse.ok) {
    console.log({
      tokenUrl,
      status: tokenResponse.status,
      body: await tokenResponse.text(),
    });
    redirect("/auth/signin");
  }
  const { auth_token: authToken, identity_id: identityId } =
    TokenResponse.parse(await tokenResponse.json());

  const client = anonymousClient.withGlobals({
    "ext::auth::client_token": authToken,
  });
  await client.query(
    `
with identity := assert_exists(global ext::auth::ClientTokenIdentity),
insert User {
  name := "",
  identities := identity,
};`
  );
  await anonymousClient.query(`delete PKCEFlow filter .email = <str>$email;`, {
    email,
  });

  cookies().set({
    name: "edgedb-session",
    value: authToken,
    httpOnly: true,
  });
  redirect("/");
}
