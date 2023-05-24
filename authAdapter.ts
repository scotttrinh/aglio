import { Adapter } from "next-auth/adapters";
import { type Client } from "edgedb";

import e from "./dbschema/edgeql-js";

const userShape = e.shape(e.User, () => ({
  id: true,
  email: true,
  email_verified: true,
}));

const sessionShape = e.shape(e.Session, () => ({
  token: true,
  expires: true,
}));

export default function EdgeDBAdapter(client: Client): Adapter {
  return {
    async createUser(user) {
      const result = await e
        .select(
          e.insert(e.User, {
            name: user.email,
            email: user.email,
            email_verified: user.emailVerified,
          }),
          userShape
        )
        .run(client);

      return {
        id: result.id,
        email: result.email,
        emailVerified: result.email_verified,
      };
    },

    async getUser(id) {
      const result = await e
        .select(e.User, (u) => ({
          ...userShape(u),
          filter_single: { id },
        }))
        .run(client);

      return (
        result && {
          id: result.id,
          email: result.email,
          emailVerified: result.email_verified,
        }
      );
    },

    async getUserByEmail(email) {
      const result = await e
        .select(e.User, (u) => ({
          ...userShape(u),
          filter_single: { email },
        }))
        .run(client);

      return (
        result && {
          id: result.id,
          email: result.email,
          emailVerified: result.email_verified,
        }
      );
    },

    async getUserByAccount({ provider, providerAccountId }) {
      const result = await e
        .select(e.User, (u) => ({
          ...userShape(u),

          accounts: (account) => ({
            filter_single: e.op(
              e.op(account.provider, "=", provider),
              "or",
              e.op(account.provider_account_id, "=", providerAccountId)
            ),
          }),
        }))
        .run(client);

      return result.length > 0
        ? {
            id: result[0].id,
            email: result[0].email,
            emailVerified: null,
          }
        : null;
    },

    async updateUser(user) {
      const result = await e
        .select(
          e.update(e.User, () => ({
            filter_single: { id: user.id },
            set: {
              ...(user.email && { email: user.email }),
            },
          })),
          userShape
        )
        .run(client);

      if (!result) {
        throw new Error("Could not find user after updating");
      }

      return {
        id: result.id,
        email: result.email,
        emailVerified: result.email_verified,
      };
    },

    async linkAccount({ userId, provider, providerAccountId }) {
      const result = await e
        .update(e.User, () => ({
          filter_single: { id: userId },
          set: {
            accounts: {
              "+=": e.insert(e.Account, {
                provider,
                provider_account_id: providerAccountId,
              }),
            },
          },
        }))
        .run(client);
      if (!result) {
        throw new Error("Could not find user after linking account");
      }
    },

    async createSession(session) {
      const result = await e
        .select(
          e.insert(e.Session, {
            token: session.sessionToken,
            expires: session.expires,
            user: e.select(e.User, () => ({
              filter_single: { id: session.userId },
            })),
          }),
          (s) => ({
            ...sessionShape(s),
            user: { id: true },
          })
        )
        .run(client);

      return {
        sessionToken: result.token,
        expires: result.expires,
        userId: result.user.id,
      };
    },

    async getSessionAndUser(sessionToken) {
      const result = await e
        .select(e.Session, (s) => ({
          ...sessionShape(s),
          user: userShape,
          filter_single: e.op(s.token, "=", sessionToken),
        }))
        .run(client);

      if (!result) {
        return null;
      }

      return {
        session: {
          sessionToken: result.token,
          expires: result.expires,
          userId: result.user.id,
        },
        user: {
          id: result.user.id,
          email: result.user.email,
          emailVerified: result.user.email_verified,
        },
      };
    },

    async updateSession(session) {
      const result = await e
        .select(
          e.update(e.Session, (s) => ({
            filter_single: e.op(s.token, "=", session.sessionToken),
            set: {
              expires: session.expires,
            },
          })),
          (s) => ({
            ...sessionShape(s),
            user: { id: true },
          })
        )
        .run(client);

      if (!result) {
        throw new Error("Could not find session after updating");
      }

      return {
        sessionToken: result.token,
        expires: result.expires,
        userId: result.user.id,
      };
    },

    async deleteSession(sessionToken) {
      await e
        .delete(e.Session, (s) => ({
          filter_single: e.op(s.token, "=", sessionToken),
        }))
        .run(client);
    },
  };
}
