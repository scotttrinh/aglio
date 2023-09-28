import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { client } from "@/client";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const requestUrl = new URL(request.url);
  const authToken = requestUrl.searchParams.get("auth_token");
  const identityId = requestUrl.searchParams.get("identity_id");

  if (!authToken || !identityId) {
    redirect("/auth/signin");
  }

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
