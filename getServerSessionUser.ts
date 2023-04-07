import { z } from "zod";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/authOptions";
import { client } from "@/edgedb";
import e from "@/dbschema/edgeql-js";

const ServerSession = z.object({
    user: z.object({
      email: z.string(),
    }),
});

export const userByEmailQuery = e.params({ email: e.str }, ({ email }) =>
  e.select(e.User, (user) => ({
    id: true,
    email: true,
    name: true,

    filter_single: e.op(user.email, "=", email),
  }))
);

export async function getServerSessionUser() {
  const session = await getServerSession(authOptions).then(ServerSession.parse);

  return await userByEmailQuery.run(client, {
    email: session.user.email,
  });
}

export async function maybeGetServerSessionUser() {
  try {
    return await getServerSessionUser();
  } catch (_) {
    return null;
  }
}