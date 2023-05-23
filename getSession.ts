import { z } from "zod";
import { Client } from "edgedb";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/authOptions";
import { client } from "@/edgedb";
import e from "@/dbschema/edgeql-js";

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
  user: { email: string };
  client: Client;
}

interface LoggedOutSession {
  state: "LOGGED_OUT";
}

type Session = LoggedInSession | LoggedOutSession;

const LOGGED_OUT_SESSION: LoggedOutSession = { state: "LOGGED_OUT" };

export async function getSession(): Promise<Session> {
  const session = await getServerSession(authOptions).then(ServerSession.parse);

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
