import { Client } from "edgedb";
import { cookies } from "next/headers";

import { client } from "@/client";

export type User = {
  id: string;
  name: string;
  email: string;
};

type LoggedInSession = {
  state: "LOGGED_IN";
  user: User;
  client: Client;
};

type LoggedOutSession = {
  state: "LOGGED_OUT";
};

export type Session = LoggedInSession | LoggedOutSession;

const LOGGED_OUT_SESSION: LoggedOutSession = { state: "LOGGED_OUT" };

export async function getSession(): Promise<Session> {
  const edgedbAuthSession = cookies().get("edgedb-session");

  if (!edgedbAuthSession) return LOGGED_OUT_SESSION;
  if (!edgedbAuthSession.value) return LOGGED_OUT_SESSION;

  const jwt = edgedbAuthSession.value.split(";")[0];
  const clientWithIdentityGlobal = client.withGlobals({
    "ext::auth::client_token": jwt,
  });

  try {
    const user = await clientWithIdentityGlobal.queryRequiredSingle<User>(
      "select global current_user;"
    );

    return {
      state: "LOGGED_IN",
      user,
      client: clientWithIdentityGlobal,
    };
  } catch (e) {
    console.error(e);
    return LOGGED_OUT_SESSION;
  }
}
