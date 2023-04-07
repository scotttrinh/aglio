import e, { $infer } from "@/dbschema/edgeql-js";

export const sequenceQuery = e.params({ userId: e.uuid }, ({ userId }) =>
  e.select(e.Sequence, (sequence) => ({
    id: true,
    name: true,
    steps: {
      id: true,
      audio: { url: true },
      video: { url: true },
      duration: true,
    },

    filter: e.op(sequence.owner.id, "=", userId),
  }))
);

export type Sequence = $infer<typeof sequenceQuery>[number];
