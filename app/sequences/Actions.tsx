"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";

export function Actions({ id }: { id: string }) {
  const [isFetching, setIsFetching] = useState(false);

  const [isPending, startTransition] = useTransition();

  const router = useRouter();

  const handleDelete = async () => {
    try {
      await fetch(`/api/sequence/${id}`, {
        method: "DELETE",
      });
    } catch (error) {
      alert(error);
    } finally {
      setIsFetching(false);
    }

    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div>
      <button type="button" onClick={handleDelete}>
        Delete
      </button>
      <button type="button">Play</button>
    </div>
  );
}
