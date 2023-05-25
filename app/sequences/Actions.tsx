"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/Button";
import { deleteSequence } from "@/app/actions";
import { useSact } from "@/app/useSact";

export function Actions({ id }: { id: string }) {
  const router = useRouter();

  const { act: handleDelete, data } = useSact(deleteSequence, () => {
    router.refresh();
  });

  return (
    <div>
      <Button
        disabled={!data.isSuccess()}
        type="button"
        onClick={() => handleDelete(id)}
      >
        Delete
      </Button>
    </div>
  );
}
