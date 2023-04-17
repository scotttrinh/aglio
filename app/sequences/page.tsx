import { sequenceQuery } from "./query";

import { getServerSessionUser } from "@/getServerSessionUser";
import { client } from "@/edgedb";

import { SequenceList } from "./SequenceList";

export default async function Sequences() {
  const user = await getServerSessionUser();
  const sequences = await sequenceQuery.run(client.withGlobals({ current_user: user!.id }));

  return (
    <>
      <div className="overflow-y-auto flex-1">
        <SequenceList sequences={sequences} />
      </div>
    </>
  );
}
