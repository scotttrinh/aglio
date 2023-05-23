import { redirect } from "next/navigation";

import { getSession } from "@/getSession";

import { sequenceQuery } from "./query";
import { SequenceList } from "./SequenceList";

export default async function Sequences() {
  const session = await getSession();

  if (session.state === "LOGGED_OUT") return redirect("/login");

  const { client } = session;

  const sequences = await sequenceQuery.run(client);

  return (
    <>
      <div className="overflow-y-auto flex-1">
        <SequenceList sequences={sequences} />
      </div>
    </>
  );
}
