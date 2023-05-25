"use client";

import { Button } from "@/components/Button";
import { deleteSequence } from "@/app/actions";
import { useSactRefresh } from "@/app/useSact";

export function Actions({ id }: { id: string }) {
  const { act: handleDelete, isBusy } = useSactRefresh(deleteSequence);

  return (
    <div>
      <Button disabled={isBusy} type="button" onClick={() => handleDelete(id)}>
        Delete
      </Button>
    </div>
  );
}
