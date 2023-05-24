import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

import e from "@/dbschema/edgeql-js";
import { getSession } from "@/getSession";

const PostBody = z.object({
  name: z.string(),
  steps: z.array(
    z.object({
      duration: z.number().int().positive(),
      behaviors: z.array(z.enum(["PAUSES_VIDEO", "PAUSES_AUDIO"])),
    })
  ),
});
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

  const { name, steps } = bodyResult.data;

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
          filter_single: { id: session.user.id },
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

  const result = await insert.run(client, {
    sequence: { name, steps },
  });

  return NextResponse.json(result, { status: 201 });
}
