import { useRef, useState, useTransition } from "react";
import * as RD from "@cala/remote-data";

interface UseSactReturn<InputValue, T> {
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

  const act = useRef(async (input: InputType) => {
    setRemote(maybeRefreshRemote(remote));

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
  });

  return {
    act: act.current,
    data: isTransitioning ? maybeRefreshRemote(remote) : remote,
  };
}
