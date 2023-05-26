"use server";

import { z } from "zod";
import { match, P } from "ts-pattern";

import e from "@/dbschema/edgeql-js";
import { getSession } from "@/getSession";

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
        owner: e.select(e.User, () => ({
          filter_single: { id: user.id },
        })),
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
