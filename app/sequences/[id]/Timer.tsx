import { useCallback, useEffect, useRef, useState } from "react";
import {
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
} from "@tabler/icons-react";

import { secondsToPaddedHMS } from "@/utils";
import { Button } from "@/components/Button";

export type TimerState = "running" | "paused" | "ended";

function useTimer({
  offset = 0,
  timerState,
  onTimerStateChange,
}: {
  offset?: number;
  timerState: TimerState;
  onTimerStateChange: (state: TimerState) => void;
}) {
  const [time, setTime] = useState(offset);
  const intervalId = useRef<NodeJS.Timeout | null>(null);

  useEffect(
    function handleEnd() {
      if (time === 0) {
        onTimerStateChange("ended");
        setTime(offset);
      }
    },
    [time, onTimerStateChange]
  );

  useEffect(
    function syncPlayerState() {
      if (timerState === "running") {
        if (intervalId.current) clearInterval(intervalId.current);

        intervalId.current = setInterval(() => {
          setTime((time) => {
            return time - 1;
          });
        }, 1000);
      } else if (timerState === "paused") {
        if (intervalId.current) clearInterval(intervalId.current);
      }
    },
    [timerState, onTimerStateChange]
  );

  return { time };
}

export function Timer({
  duration,
  timerState,
  onTimerStateChange,
}: {
  duration: number;
  timerState: TimerState;
  onTimerStateChange: (timerState: TimerState) => void;
}) {
  const { time } = useTimer({
    offset: duration * 60,
    timerState,
    onTimerStateChange,
  });
  console.log({ time, duration, timerState });

  const elapsedSeconds = duration * 60 - time;
  const elapsedTimeMinutesAndSeconds = secondsToPaddedHMS(elapsedSeconds);
  const timeLeftMinutesAndSeconds = secondsToPaddedHMS(time);
  const totalTimeMinutesAndSeconds = secondsToPaddedHMS(duration * 60);

  return (
    <div className="flex flex-col">
      <div className="flex">
        <div>
          {elapsedTimeMinutesAndSeconds} / {totalTimeMinutesAndSeconds}
        </div>
        <div className="ml-auto">-{timeLeftMinutesAndSeconds}</div>
      </div>
      {timerState === "paused" && (
        <Button onClick={() => onTimerStateChange("running")}>
          <IconPlayerPlayFilled size={56} />
        </Button>
      )}
      {timerState === "running" && (
        <Button onClick={() => onTimerStateChange("paused")}>
          <IconPlayerPauseFilled size={56} />
        </Button>
      )}
    </div>
  );
}
