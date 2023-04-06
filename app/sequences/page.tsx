import { client } from "@/edgedb";

import { sequenceQuery } from "./query";

import { SequenceList } from "./SequenceList";
import { AddSequence } from "./AddSequence";

export default async function Sequences() {
  const sequences = await sequenceQuery.run(client);

  return (
    <>
      <h1>Sequences</h1>
      <AddSequence />
      <SequenceList sequences={sequences} />
    </>
  );
}
