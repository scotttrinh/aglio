import { client } from "@/edgedb";
import { redirect } from "next/navigation";

import { sourceQuery, sequenceQuery } from "./query";

import { Player } from "./Player";
import { getServerSessionUser } from "@/getServerSessionUser";

interface Context {
  params: { id: string };
}

export default async function SequenceDetailPage(context: Context) {
  const user = await getServerSessionUser();
  if (!user) return redirect("/login");

  const { id } = context.params;
  const [sequence, sources] = await Promise.all([
    sequenceQuery.run(client, { id }),
    sourceQuery.run(client, { userId: user.id }),
  ]);

  if (sequence === null) {
    return redirect("/sequences");
  }

  return <Player steps={sequence.steps} sources={sources} />;
}
