import { redirect } from "next/navigation";

import { sourceQuery, sequenceQuery } from "./query";
import { Player } from "./Player";

import { getSession } from "@/getSession";

interface Context {
  params: { id: string };
}

export default async function SequenceDetailPage(context: Context) {
  const session = await getSession();
  if (session.state === "LOGGED_OUT") return redirect("/login");
  const { client } = session;

  const { id } = context.params;
  const [sequence, sources] = await Promise.all([
    sequenceQuery.run(client, { id }),
    sourceQuery.run(client),
  ]);

  if (sequence === null) {
    return redirect("/sequences");
  }

  return <Player steps={sequence.steps} sources={sources} />;
}
