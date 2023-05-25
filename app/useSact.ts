import { useMemo, useRef, useState, useTransition } from "react";
import * as RD from "@cala/remote-data";
import { useRouter } from "next/navigation";

interface UseSactReturn<InputValue, T> {
  isBusy: boolean;
  data: RD.RemoteData<Error, T>;
  act: (input: InputValue) => Promise<void>;
}

function maybeRefreshRemote<E, T>(
  remote: RD.RemoteData<E, T>
): RD.RemoteData<E, T> {
  return remote.wedgeCaseOf<RD.RemoteData<E, T>>({
    some: (a: T) => RD.refresh<E, T>(a),
    failure: () => RD.pending,
    none: RD.pending,
  });
}

export function useSact<InputType, T>(
  action: (input: InputType) => Promise<T>,
  transitionWith?: () => void
): UseSactReturn<InputType, T> {
  const [isTransitioning, startTransition] = useTransition();
  const actionRef = useRef(action);

  const [remote, setRemote] = useState<RD.RemoteData<Error, T>>(RD.initial);

  const act = useMemo(
    () => async (input: InputType) => {
      console.log("act", input);
      setRemote((existing) => maybeRefreshRemote(existing));

      try {
        const result = await actionRef.current(input);
        if (transitionWith) {
          setRemote(RD.success(result));
          startTransition(transitionWith);
        }
        setRemote(RD.success(result));
      } catch (err) {
        setRemote(RD.failure(err as Error));
      }
    },
    [transitionWith]
  );

  const data = isTransitioning ? maybeRefreshRemote(remote) : remote;

  return {
    act,
    data,
    isBusy: data.isPending() || data.isRefresh(),
  };
}

export function useSactRefresh<InputType, T>(
  action: (input: InputType) => Promise<T>
): UseSactReturn<InputType, T> {
  const router = useRouter();
  return useSact(action, () => {
    router.refresh();
  });
}
