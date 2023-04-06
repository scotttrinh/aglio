import { client } from "@/edgedb";
import { redirect } from "next/navigation";

import { sequenceQuery } from "./query";

import { Player } from "./Player";

interface Context {
  params: { id: string };
}

export default async function SequenceDetailPage(context: Context) {
  const { id } = context.params;
  const sequence = await sequenceQuery.run(client, { id });

  if (sequence === null) {
    return redirect("/sequences");
  }

  const videoPlaylistId = new URL(sequence.steps[0].video.url).searchParams.get(
    "list"
  ) as string;
  const audioPlaylistId = new URL(sequence.steps[0].audio.url).searchParams.get(
    "list"
  ) as string;

  return (
    <>
      <h1>Sequence Detail</h1>
      <p>
        {sequence.name} ({sequence.id})
      </p>

<Player video={videoPlaylistId} audio={audioPlaylistId} />
    </>
  );
}
