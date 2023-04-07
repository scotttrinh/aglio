"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/Button";

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
      <Button type="button" onClick={handleDelete}>
        Delete
      </Button>
    </div>
  );
}
