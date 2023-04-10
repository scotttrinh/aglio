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
      },

      filter_single: e.op(sequence.id, "=", params.id),
    }))
);

export type Sequence = $infer<typeof sequenceQuery>;
export type Step = Exclude<Sequence, null>["steps"][number];

export const playlistQuery = e.params(
  {
    userId: e.uuid,
  },
  (params) =>
    e.select(e.Playlist, (playlist) => ({
      id: true,
      url: true,

      filter: e.op(params.userId, "in", playlist["<playlists[is User]"].id),
    }))
);

export type Playlist = $infer<typeof playlistQuery>[number];
