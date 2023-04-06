import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

import e from "@/dbschema/edgeql-js";
import { client } from "@/edgedb";

export const Body = z.object({
  name: z.string(),
  steps: z.array(
    z.object({
      video: z.string().url(),
      audio: z.string().url(),
      duration: z.number().int().positive(),
    })
  ),
});
export type Body = z.infer<typeof Body>;

export async function POST(request: NextRequest): Promise<NextResponse> {
  const json = await request.json();
  const bodyResult = Body.safeParse(json);

  if (!bodyResult.success) {
    return NextResponse.json(bodyResult.error, { status: 400 });
  }

  const { name, steps } = bodyResult.data;
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
      const playlists = e.for(
        e.for(e.array_unpack(params.sequence.steps), (step) =>
          e.set(step.video, step.audio)
        ),
        (playlistUrl) => {
          return e
            .insert(e.Playlist, {
              url: playlistUrl,
            })
            .unlessConflict((playlist) => ({
              on: playlist.url,
              else: playlist,
            }));
        }
      );

      return e.with<any>([playlists], e.insert(e.Sequence, {
        name: params.sequence.name,
        steps: e.for(e.array_unpack(params.sequence.steps), (step) => {
          return e.insert(e.Step, {
            video: e.select(playlists, (playlist) => ({
              filter_single: e.op(playlist.url, "=", step.video),
            })),
            audio: e.select(playlists, (playlist) => ({
              filter_single: e.op(playlist.url, "=", step.audio),
            })),
            duration: step.duration,
          });
        }),
      }));
    }
  );

  console.log(insert.toEdgeQL());

  const result = await insert.run(client, {
    sequence: { name, steps },
  });

  return NextResponse.json(result, { status: 201 });
}
