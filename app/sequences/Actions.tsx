"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/Button";
import { deleteSequence } from "../actions";

export function Actions({ id }: { id: string }) {
  const [isFetching, setIsFetching] = useState(false);

  const [isPending, startTransition] = useTransition();

  const router = useRouter();

  const handleDelete = async () => {
    setIsFetching(true);
    try {
      await deleteSequence(id);
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
      <Button
        disabled={isFetching || isPending}
        type="button"
        onClick={handleDelete}
      >
        Delete
      </Button>
    </div>
  );
}
