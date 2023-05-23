import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

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

  if (session.state === "LOGGED_OUT")
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { client } = session;

  const json = await request.json();
  const bodyResult = PostBody.safeParse(json);

  if (!bodyResult.success) {
    return NextResponse.json(bodyResult.error, { status: 400 });
  }

  const { data: body } = bodyResult;

  if (body.provider !== "youtube" || body.mediaType !== "playlist") {
    return NextResponse.json({ message: "Not implemented" }, { status: 400 });
  }

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
