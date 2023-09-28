import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { client } from "@/client";
import { getServerConfig } from "@/config";

const TOKEN_EXCHANGE_URL = new URL(
  "token",
  getServerConfig().EDGEDB_AUTH_BASE_URL
);

const TokenExchangeBody = z
  .object({
    auth_token: z.string().min(1),
    identity_id: z.string().min(1),
  })
  .transform(({ auth_token: authToken, identity_id: identityId }) => ({
    authToken,
    identityId,
  }));

export async function GET(request: NextRequest): Promise<NextResponse> {
  const searchParams = new URL(request.url).searchParams;
  const code = searchParams.get("code");
  if (!code) {
    console.error(`Missing search param: "code" Params: ${searchParams}`);
    redirect("/auth/signin");
  }
  const verifier = cookies().get("edgedb_pkce_verifier");

  if (!verifier) {
    console.error("Could not find 'edgedb_pkce_verifier' cookie");
    redirect("/auth/signin");
  }

  cookies().delete("edgedb_pkce_verifier");

  const url = new URL(TOKEN_EXCHANGE_URL);
  url.searchParams.set("verifier", verifier.value);
  url.searchParams.set("code", code);

  const response = await fetch(url.href);
  if (!response.ok) {
    console.error(
      `Got a non-success response from token exchange:\n${JSON.stringify({
        status: response.status,
        body: await response.text(),
      })}`
    );
    redirect("/auth/signin");
  }
  const data = await response.json();
  const parsed = TokenExchangeBody.safeParse(data);
  if (!parsed.success) {
    redirect("/auth/signin");
  }

  const { authToken, identityId } = parsed.data;

  await client.query(
    `
with identity := assert_exists(
  (select ext::auth::Identity filter .id = <uuid>$identity_id)
),
select (
  insert User {
    name := "",
    identities := identity,
  }
  unless conflict on .identities
  else (select User)
) { ** };
`,
    { identity_id: identityId }
  );

  cookies().set({
    name: "edgedb-session",
    value: authToken,
    httpOnly: true,
    sameSite: "strict",
  });

  redirect("/");
}
