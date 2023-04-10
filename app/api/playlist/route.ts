import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

import e from "@/dbschema/edgeql-js";
import { client } from "@/edgedb";
import { getServerSessionUser } from "@/getServerSessionUser";

export const PostBody = z.object({
  url: z.string().url(),
});
export type PostBody = z.infer<typeof PostBody>;

export async function POST(request: NextRequest): Promise<NextResponse> {
  const user = await getServerSessionUser();

  if (!user)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const json = await request.json();
  const bodyResult = PostBody.safeParse(json);

  if (!bodyResult.success) {
    return NextResponse.json(bodyResult.error, { status: 400 });
  }

  const playlist = bodyResult.data;
  const result = await e
    .params({ url: e.str, userId: e.uuid }, ({ url, userId }) =>
      e.update(e.User, () => ({
        set: {
          playlists: {
            "+=": e.insert(e.Playlist, { url }).unlessConflict((playlist) => ({
              on: playlist.url,
              else: playlist,
            })),
          },
        },
      }))
    )
    .run(client, { url: playlist.url, userId: user.id });

  return NextResponse.json(result, { status: 201 });
}
