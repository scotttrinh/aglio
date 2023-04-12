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
        duration: true,
        behaviors: true,
      },

      filter_single: e.op(sequence.id, "=", params.id),
    }))
);

export type Sequence = $infer<typeof sequenceQuery>;
export type Step = Exclude<Sequence, null>["steps"][number];

export const sourceQuery = e.params(
  {
    userId: e.uuid,
  },
  (params) =>
    e.select(e.Source, (source) => ({
      id: true,
      url: true,
      provider: true,
      media_type: true,
      title: true,
      thumbnail: true,

      filter: e.op(params.userId, "in", source["<sources[is User]"].id),
    }))
);

export type Source = $infer<typeof sourceQuery>[number];
