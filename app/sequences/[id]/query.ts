import e, { $infer } from "@/dbschema/edgeql-js";

export const sequenceQuery = e.params(
  {
    id: e.uuid,
  },
  (params) =>
    e.select(e.Sequence, (sequence) => ({
      id: true,
      name: true,
      steps: {
        id: true,
        audio: { url: true },
        video: { url: true },
        duration: true,
      },

      filter_single: e.op(sequence.id, "=", params.id),
    }))
);

export type Sequence = $infer<typeof sequenceQuery>;
export type Step = Exclude<Sequence, null>["steps"][number]; 