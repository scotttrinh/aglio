import { Fragment } from "react";
import Link from "next/link";

import { Sequence } from "./query";

import { AddSequence } from "./AddSequence";
import { Actions } from "./Actions";

export function SequenceList({ sequences }: { sequences: Sequence[] }) {
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

function SequenceRow({ sequence }: { sequence: Sequence }) {
  return (
    <>
      <div className="col-start-1 col-span-3">
        <Link className="underline" href={`/sequences/${sequence.id}`}>{sequence.name}</Link>
      </div>
      <Steps steps={sequence.steps} />
      <div className="col-start-11 col-end-13">
        <Actions id={sequence.id} />
      </div>
    </>
  );
}

function Steps({ steps }: { steps: Sequence["steps"] }) {
  return (
    <>
      {steps.map((step, index) => (
        <Fragment key={index}>
          <div className="col-start-4 col-span-3 whitespace-nowrap overflow-x-auto">
            {step.audio.url}
          </div>
          <div className="col-start-7 col-span-3 whitespace-nowrap overflow-x-auto">
            {step.video.url}
          </div>
          <div className="col-start-10 col-span-1">{step.duration}</div>
        </Fragment>
      ))}
    </>
  );
}
