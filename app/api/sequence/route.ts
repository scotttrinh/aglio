import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

import e from "@/dbschema/edgeql-js";
import { client } from "@/edgedb";

export const PostBody = z.object({
  name: z.string(),
  steps: z.array(
    z.object({
      video: z.string().url(),
      audio: z.string().url(),
      duration: z.number().int().positive(),
    })
  ),
});
export type PostBody = z.infer<typeof PostBody>;

export async function POST(request: NextRequest): Promise<NextResponse> {
  const json = await request.json();
  const bodyResult = PostBody.safeParse(json);

  if (!bodyResult.success) {
    return NextResponse.json(bodyResult.error, { status: 400 });
  }

  const { name, steps } = bodyResult.data;
  const insertPlaylists = e.params({ playlists: e.array(e.str) }, (params) =>
    e.for(e.op("distinct", e.array_unpack(params.playlists)), (playlistUrl) =>
      e
        .insert(e.Playlist, {
          url: playlistUrl,
        })
        .unlessConflict((playlist) => ({
          on: playlist.url,
          else: playlist,
        }))
    )
  );
  await insertPlaylists.run(client, {
    playlists: steps.flatMap((step) => [step.video, step.audio]),
  });

  const insert = e.params(
    {
      sequence: e.tuple({
        name: e.str,
        steps: e.array(
          e.tuple({ audio: e.str, video: e.str, duration: e.int64 })
        ),
      }),
    },
    (params) => {
      return e.insert(e.Sequence, {
        name: params.sequence.name,
        steps: e.for(e.array_unpack(params.sequence.steps), (step) => {
          return e.insert(e.Step, {
            video: e.select(e.Playlist, (playlist) => ({
              filter_single: e.op(playlist.url, "=", step.video),
            })),
            audio: e.select(e.Playlist, (playlist) => ({
              filter_single: e.op(playlist.url, "=", step.audio),
            })),
            duration: step.duration,
          });
        }),
      });
    }
  );

  const result = await insert.run(client, {
    sequence: { name, steps },
  });

  return NextResponse.json(result, { status: 201 });
}