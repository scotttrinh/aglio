import { redirect } from "next/navigation";
import clsx from "clsx";

import { getSession } from "@/getSession";
import { Row, HeaderCell } from "@/components/GridTable";

import { sequenceQuery } from "./query";
import { SequenceList } from "./SequenceList";

const rowClass = clsx(
  "border-gray-300 dark:border-gray-700",
  "bg-white dark:bg-gray-800",
  "text-gray-700 dark:text-gray-200"
);

const headerCellClass = clsx("text-gray-500 dark:text-gray-400");

export default async function Sequences() {
  const session = await getSession();

  if (session.state === "LOGGED_OUT") return redirect("/signin");

  const { client } = session;

  const sequences = await sequenceQuery.run(client);

  return (
    <>
      <div className="overflow-y-auto flex-1">
        <>
          <Row className={clsx(rowClass, "mt-8")}>
            <HeaderCell className={clsx(headerCellClass, "col-span-1")} />
            <HeaderCell className={clsx(headerCellClass, "col-span-3")}>
              Name
            </HeaderCell>
            <HeaderCell className={clsx(headerCellClass, "col-span-2")}>
              Total
            </HeaderCell>
            <HeaderCell className={clsx(headerCellClass, "col-span-2")}>
              Work
            </HeaderCell>
            <HeaderCell className={clsx(headerCellClass, "col-span-2")}>
              Break
            </HeaderCell>
            <HeaderCell className={clsx(headerCellClass, "col-span-2")} />
          </Row>

          <SequenceList sequences={sequences} />
        </>
      </div>
    </>
  );
}
