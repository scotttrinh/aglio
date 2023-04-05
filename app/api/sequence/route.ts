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
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { name, steps } = bodyResult.data;
  const insert = e.params(
    {
      sequences: e.array(
        e.tuple({
          name: e.str,
          steps: e.array(
            e.tuple({ audio: e.str, video: e.str, duration: e.int64 })
          ),
        })
      ),
    },
    (params) => {
      const playlists = e.for(
        e.for(e.array_unpack(e.array_unpack(params.sequences).steps), (step) =>
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

      return e.with(
        [playlists],
        e.for(e.array_unpack(params.sequences), (sequence) => {
          return e.insert(e.Sequence, {
            name: sequence.name,
            steps: e.for(e.array_unpack(sequence.steps), (step) => {
              return e.insert(e.Step, {
                video: e.assert_single(
                  e.select(playlists, (playlist) => ({
                    filter_single: { url: step.video },
                  }))
                ),
                audio: e.assert_single(
                  e.select(playlists, (playlist) => ({
                    filter_single: { url: step.audio },
                  }))
                ),
                duration: step.duration,
              });
            }),
          });
        })
      );
    }
  );

  const result = await insert.run(client, {
    sequences: [{ name, steps }],
  });

  if (result.length !== 1) {
    return NextResponse.json(
      { error: "Failed to insert sequence" },
      {
        status: 500,
      }
    );
  }

  return NextResponse.json(result[0], { status: 201 });
}
