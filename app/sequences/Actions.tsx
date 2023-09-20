"use client";

import { Button } from "@/components/Button";
import { deleteSequence } from "@/app/actions";
import { useSactRefresh } from "@/app/useSact";

export function Actions({ id }: { id: string | null }) {
  const { act: handleDelete, isBusy } = useSactRefresh(deleteSequence);

  return (
    <div>
      <Button
        disabled={!id || isBusy}
        type="button"
        onClick={() => id && handleDelete(id)}
      >
        Delete
      </Button>
    </div>
  );
}
