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

  return (
    <Player steps={sequence.steps} />
  );
}
