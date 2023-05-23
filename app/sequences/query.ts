import e, { $infer } from "@/dbschema/edgeql-js";

export const sequenceQuery = e.select(e.Sequence, (sequence) => ({
  id: true,
  name: true,
  steps: (s) => ({
    ...s["*"],
  }),
}));

export type Sequence = $infer<typeof sequenceQuery>[number];
