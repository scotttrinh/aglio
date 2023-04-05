import e from "@/dbschema/edgeql-js";
import { client } from "@/edgedb";

import { AddSequence } from "./AddSequence";

export default async function Sequences() {
  const sequences = await e
    .select(e.Sequence, () => ({
      id: true,
      name: true,
      steps: {
        id: true,
        audio: { url: true },
        video: { url: true },
        duration: true,
      },
    }))
    .run(client);

  return (
    <>
      <h1>Sequences</h1>
      <AddSequence />
      {sequences.map((sequence) => {
        return (
          <div key={sequence.id}>
            <h2>{sequence.name}</h2>
            {sequence.steps.map((step) => {
              return (
                <div key={step.id}>
                  <h3>{step.id}</h3>
                  <p>{step.audio.url}</p>
                  <p>{step.video.url}</p>
                  <p>{step.duration}</p>
                </div>
              );
            })}
          </div>
        );
      })}
    </>
  );
}
