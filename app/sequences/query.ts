import e, { $infer } from "@/dbschema/edgeql-js";

export const sequenceQuery = e.select(e.Sequence, () => ({
  id: true,
  name: true,
  steps: {
    id: true,
    audio: { url: true },
    video: { url: true },
    duration: true,
  },
}));

export type Sequence = $infer<typeof sequenceQuery>[number];