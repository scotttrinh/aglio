import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";
import { match, P } from "ts-pattern";

import e from "@/dbschema/edgeql-js";
import { getSession } from "@/getSession";

import { getYouTubePlaylist } from "./youtube";

const YouTubeBody = z.object({
  provider: z.literal("youtube"),
  mediaType: z.enum(["playlist", "video"]),
  url: z.string().url(),
});

const SpotifyBody = z.object({
  provider: z.literal("spotify"),
  mediaType: z.enum(["playlist", "album", "track"]),
  url: z.string().url(),
});

const PostBody = z.union([YouTubeBody, SpotifyBody]);

type PostBody = z.infer<typeof PostBody>;

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getSession();

  return match(session)
    .with({ state: "LOGGED_OUT" }, () =>
      NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    )
    .with({ state: "LOGGED_IN", client: P.select() }, async (client) => {
      const json = await request.json();
      const bodyResult = PostBody.safeParse(json);

      return match(bodyResult)
        .with({ success: false, error: P.select() }, (error) =>
          NextResponse.json(error, { status: 400 })
        )
        .with(
          {
            success: true,
            data: P.select({ provider: "youtube", mediaType: "playlist" }),
          },
          async (body) => {
            const {
              title,
              thumbnail,
              providerMeta: provider_meta,
            } = await getYouTubePlaylist(body.url);

            const result = await e
              .update(e.User, () => ({
                set: {
                  sources: {
                    "+=": e
                      .insert(e.Source, {
                        url: body.url,
                        media_type: body.mediaType,
                        provider: body.provider,

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

            return NextResponse.json(result, { status: 201 });
          }
        )
        .with({ success: true }, async (body) => {
          return NextResponse.json(
            { message: "Not implemented" },
            { status: 400 }
          );
        })
        .exhaustive();
    })
    .exhaustive();
}
