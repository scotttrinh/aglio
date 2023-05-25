import { z } from "zod";
import { Client } from "edgedb";
import { getServerSession } from "next-auth/next";
import { headers, cookies } from "next/headers";

import { authOptions } from "@/authOptions";
import { client } from "@/client";
import e, { type $infer } from "@/dbschema/edgeql-js";

const ServerSession = z
  .object({
    user: z.object({
      email: z.string(),
    }),
  })
  .nullable();

export const userByEmailQuery = e.params({ email: e.str }, ({ email }) =>
  e.select(e.User, (user) => ({
    id: true,
    email: true,
    name: true,

    filter_single: e.op(user.email, "=", email),
  }))
);

interface LoggedInSession {
  state: "LOGGED_IN";
  user: NonNullable<$infer<typeof userByEmailQuery>>;
  client: Client;
}

interface LoggedOutSession {
  state: "LOGGED_OUT";
}

type Session = LoggedInSession | LoggedOutSession;

const LOGGED_OUT_SESSION: LoggedOutSession = { state: "LOGGED_OUT" };

export async function getSession(): Promise<Session> {
  // HACK: See issue here: https://github.com/nextauthjs/next-auth/issues/7486#issuecomment-1543747325
  const req = {
    headers: Object.fromEntries(headers()),
    cookies: Object.fromEntries(
      cookies()
        .getAll()
        .map((c) => [c.name, c.value])
    ),
  };
  const res = { getHeader() {}, setCookie() {}, setHeader() {} };
  const session = await getServerSession(
    req as any,
    res as any,
    authOptions
  ).then(ServerSession.parse);
  // HACK: end

  if (!session) return LOGGED_OUT_SESSION;

  const user = await userByEmailQuery.run(client, {
    email: session.user.email,
  });
  if (!user) return LOGGED_OUT_SESSION;

  const clientWithUserGlobal = client.withGlobals({ current_user: user.id });

  return {
    state: "LOGGED_IN",
    user,
    client: clientWithUserGlobal,
  };
}
