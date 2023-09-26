"use server";

import { z } from "zod";
import { match } from "ts-pattern";
import { cookies } from "next/headers";

import e from "@/dbschema/edgeql-js";
import { getSession } from "@/getSession";
import { getServerConfig } from "@/config";
import { client as anonymousClient } from "@/client";

import { getYouTubePlaylist } from "./youtube";

function parseInput<Schema extends z.ZodTypeAny>(
  schema: Schema,
  data: unknown
): z.infer<Schema> {
  const parsed = schema.safeParse(data);
  return match(parsed)
    .with({ success: false }, ({ error }) => {
      throw new Error(`Invalid data: ${error.message}`);
    })
    .with({ success: true }, ({ data }) => data)
    .exhaustive();
}

async function requireAuth() {
  const session = await getSession();

  return match(session)
    .with({ state: "LOGGED_OUT" }, () => {
      throw new Error("Unauthorized");
    })
    .with({ state: "LOGGED_IN" }, (a) => a)
    .exhaustive();
}

const CreateSequence = z.object({
  name: z.string(),
  steps: z.array(
    z.object({
      duration: z.number().int().positive(),
      behaviors: z.array(z.enum(["PAUSES_VIDEO", "PAUSES_AUDIO"])),
    })
  ),
});

export async function createSequence(data: z.infer<typeof CreateSequence>) {
  const { name, steps } = parseInput(CreateSequence, data);
  const { client, user } = await requireAuth();

  const insert = e.params(
    {
      sequence: e.tuple({
        name: e.str,
        steps: e.array(
          e.tuple({ duration: e.int64, behaviors: e.array(e.str) })
        ),
      }),
    },
    (params) => {
      return e.insert(e.Sequence, {
        name: params.sequence.name,
        owner: e.assert_exists(
          e.select(e.User, () => ({
            filter_single: { id: user.id },
          }))
        ),
        steps: e.for(e.array_unpack(params.sequence.steps), (step) => {
          return e.insert(e.Step, {
            duration: step.duration,
            behaviors: e.cast(e.array(e.Behavior), step.behaviors),
          });
        }),
      });
    }
  );

  return await insert.run(client, {
    sequence: { name, steps },
  });
}

const Credentials = z.object({
  provider: z.string(),
  email: z.string(),
  handle: z.string(),
  password: z.string(),
});

const AUTHENTICATE_URL = new URL(
  "authenticate",
  getServerConfig().EDGEDB_AUTH_BASE_URL
);

export async function signInWithPassword(data: z.infer<typeof Credentials>) {
  const credentials = parseInput(Credentials, data);
  const response = await fetch(AUTHENTICATE_URL.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });
  const setCookies = response.headers.getSetCookie();
  for (const setCookie of setCookies) {
    const [key, val] = setCookie.split("=");
    if (!key || !val) continue;
    const v = val.split(";");
    cookies().set(key, v[0]);
  }

  if (!response.ok) {
    console.log({ status: response.status, body: await response.text() });
    throw new Error("Could not authenticate with the provided credentials");
  }

  return response.json();
}

const REGISTER_URL = new URL(
  "register",
  getServerConfig().EDGEDB_AUTH_BASE_URL
);

export async function signUpWithPassword(data: z.infer<typeof Credentials>) {
  const credentials = parseInput(Credentials, data);
  const response = await fetch(REGISTER_URL.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    console.log({ status: response.status, body: await response.text() });
    if (response.status === 409) {
      return await signInWithPassword(data);
    }

    throw new Error("Could not sign up with the provided credentials");
  }

  const body = await response.json();
  const parsed = z
    .object({
      identity_id: z.string(),
    })
    .parse(body);

  await anonymousClient.query(
    `
with identity := assert_exists(
  (select ext::auth::LocalIdentity { email } filter .id = <uuid>$identity_id)
),
insert User {
  name := "",
  email := identity.email,
  identities := identity,
};
`,
    { identity_id: parsed.identity_id }
  );
}

export async function deleteSequence(id: string) {
  const { client } = await requireAuth();

  const result = await e
    .delete(e.Sequence, (sequence) => ({
      filter_single: e.op(sequence.id, "=", e.uuid(id)),
    }))
    .run(client);

  if (result === null) {
    throw new Error(`Could not delete Sequence ${id}`);
  }
}

const CreateSource = z.object({
  provider: z.literal("youtube"),
  mediaType: z.literal("playlist"),
  url: z.string().url(),
});

export async function createSource(data: z.infer<typeof CreateSource>) {
  const source = parseInput(CreateSource, data);
  const { client } = await requireAuth();

  const {
    title,
    thumbnail,
    providerMeta: provider_meta,
  } = await getYouTubePlaylist(source.url);

  return await e
    .update(e.User, () => ({
      set: {
        sources: {
          "+=": e
            .insert(e.Source, {
              url: source.url,
              media_type: source.mediaType,
              provider: source.provider,

              title,
              thumbnail,
              provider_meta,
            })
            .unlessConflict((source) => ({
              on: source.url,
              else: source,
            })),
        },
      },
    }))
    .run(client);
}

export async function signOut() {
  cookies().delete("edgedb-session");
}
