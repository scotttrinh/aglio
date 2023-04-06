import { Fragment } from "react";

import { Sequence } from "./query";
import { Actions } from "./Actions";

export function SequenceList({ sequences }: { sequences: Sequence[] }) {
  return (
    <div className="grid grid-cols-12">
      {sequences.map((sequence) => (
        <SequenceRow key={sequence.id} sequence={sequence} />
      ))}
    </div>
  );
}

function SequenceRow({ sequence }: { sequence: Sequence }) {
  // Make a nested grid with sequence name, steps, and actions
  return (
    <>
      <div className="col-start-1 col-end-3">{sequence.name}</div>
      <div className="col-start-3 col-end-9">
        <Steps steps={sequence.steps} />
      </div>
      <div className="col-start-9 col-end-12">
        <Actions id={sequence.id} />
      </div>
    </>
  );
}

function Steps({ steps }: { steps: Sequence["steps"] }) {
  return (
    <div className="grid grid-cols-3 gap-1">
      <div>Audio</div>
      <div>Video</div>
      <div>Duration (minutes)</div>
      {steps.map((step, index) => (
        <Fragment key={index}>
          <div className="whitespace-nowrap overflow-x-auto">
            {step.audio.url}
          </div>
          <div className="whitespace-nowrap overflow-x-auto">
            {step.video.url}
          </div>
          <div>{step.duration}</div>
        </Fragment>
      ))}
    </div>
  );
}
