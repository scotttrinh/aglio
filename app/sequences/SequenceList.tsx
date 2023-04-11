import { Fragment } from "react";
import Link from "next/link";

import { Sequence, helper } from "@/dbschema/interfaces";
import { isBreak } from "@/utils";

import { AddSequence } from "./AddSequence";
import { Actions } from "./Actions";
import { Button } from "@/components/Button";

type SimpleSequence = helper.Props<Sequence> &
  Pick<helper.Links<Sequence>, "steps">;

export function SequenceList({ sequences }: { sequences: SimpleSequence[] }) {
  return (
    <div className="grid grid-cols-12 gap-2">
      <div className="col-start-1 col-end-4">Sequence</div>
      <div className="col-start-4 col-end-10">Steps</div>
      <div className="col-start-10 col-end-13" />
      <AddSequence />
      {sequences.map((sequence) => (
        <SequenceRow key={sequence.id} sequence={sequence} />
      ))}
    </div>
  );
}

function SequenceRow({ sequence }: { sequence: SimpleSequence }) {
  console.log(JSON.stringify({ sequence }, null, 2));
  return (
    <>
      <div className="col-start-1 col-span-3">
        <Link className="underline" href={`/sequences/${sequence.id}`}>
          {sequence.name}
        </Link>
      </div>
      {sequence.steps.map((step, index) => (
        <Fragment key={index}>
          <div className="col-start-4 col-span-5">
            {isBreak(step) ? "Break" : "Work"}
          </div>
          <div className="col-start-9 col-span-2">{step.duration}</div>
        </Fragment>
      ))}
      <div className="col-start-11 col-end-13">
        <Actions id={sequence.id} />
      </div>
    </>
  );
}
