import { Fragment } from "react";
import Link from "next/link";
import clsx from "clsx";

import { Sequence, helper } from "@/dbschema/interfaces";
import { isBreak, secondsToPaddedHMS } from "@/utils";
import { Row, Cell, HeaderCell } from "@/components/GridTable";

import { AddSequence } from "./AddSequence";
import { Actions } from "./Actions";

type SimpleSequence = helper.Props<Sequence> &
  Pick<helper.Links<Sequence>, "steps">;

const rowClass = clsx(
  "border-gray-300 dark:border-gray-700",
  "bg-white dark:bg-gray-800",
  "text-gray-700 dark:text-gray-200"
);

const headerCellClass = clsx("text-gray-500 dark:text-gray-400");

export function SequenceList({ sequences }: { sequences: SimpleSequence[] }) {
  return (
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
      {sequences.map((sequence) => (
        <SequenceRow key={sequence.id} sequence={sequence} />
      ))}
      <Row className={clsx(rowClass, "dark:bg-gray-900")}>
        <AddSequence />
      </Row>
    </>
  );
}

function SequenceRow({ sequence }: { sequence: SimpleSequence }) {
  const totals = sequence.steps.reduce(
    (acc, step) => {
      const seconds = step.duration * 60;
      if (isBreak(step)) {
        acc.break += seconds;
      } else {
        acc.work += seconds;
      }
      acc.total += seconds;
      return acc;
    },
    { total: 0, work: 0, break: 0 }
  );

  return (
    <Row className={rowClass}>
      <Cell className="col-span-1" />
      <Cell className="col-span-3">
        <Link className="underline" href={`/sequences/${sequence.id}`}>
          {sequence.name}
        </Link>
      </Cell>
      <Cell className="col-span-2">
        {secondsToPaddedHMS(totals.total)}
      </Cell>
      <Cell className="col-span-2">
        {secondsToPaddedHMS(totals.work)}
      </Cell>
      <Cell className="col-span-2">
        {secondsToPaddedHMS(totals.break)}
      </Cell>
      <Cell className="col-span-2">
        <Actions id={sequence.id} />
      </Cell>
    </Row>
  );
}
