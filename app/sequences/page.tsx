import { sequenceQuery } from "./query";

import { getServerSessionUser } from "@/getServerSessionUser";
import { client } from "@/edgedb"

import { SequenceList } from "./SequenceList";
import { AddSequence } from "./AddSequence";

export default async function Sequences() {
  const user = await getServerSessionUser()
  const sequences = await sequenceQuery.run(client, { userId: user!.id });

  return (
    <>
      <h1>Sequences</h1>
      <AddSequence />
      <SequenceList sequences={sequences} />
    </>
  );
}
