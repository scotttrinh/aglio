import { useCallback, useEffect, useState } from "react";

import { secondsToPaddedHMS } from "@/utils";
import { Button } from "@/components/Button";

export type TimerState = "running" | "paused" | "ended";

function useTimer({
  offset = 0,
  onTick,
  onEnd,
  timerState,
  onTimerStateChange,
}: {
  offset?: number;
  onTick?: (time: number) => void;
  onEnd?: () => void;
  timerState: TimerState;
  onTimerStateChange: (state: TimerState) => void;
}) {
  const [time, setTime] = useState(offset);
  const [intervalId, setIntervalId] = useState<NodeJS.Timer | null>(null);

  useEffect(() => {
    if (time === 0) {
      onTimerStateChange("ended");
      if (onEnd) {
        onEnd();
      }
    }
  }, [time]);

  const start = useCallback(() => {
    if (["running", "ended"].includes(timerState)) {
      return;
    }
    onTimerStateChange("running");
    const intervalId = setInterval(() => {
      setTime((time) => {
        if (onTick) {
          onTick(time);
        }
        return time - 1;
      });
    }, 1000);
    setIntervalId(intervalId);
  }, [timerState, onTick, onEnd]);

  const pause = useCallback(() => {
    if (["paused", "ended"].includes(timerState)) {
      return;
    }
    onTimerStateChange("paused");
    if (intervalId) clearInterval(intervalId);
  }, [timerState, intervalId]);

  return {
    time,
    timerState,
    start,
    pause,
  };
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
  const { time, start, pause } = useTimer({
    offset: duration * 60,
    timerState,
    onTimerStateChange,
  });

  useEffect(() => {
    if (onTimerStateChange) {
      onTimerStateChange(timerState);
    }
  }, [timerState, onTimerStateChange]);

  const elapsedSeconds = duration * 60 - time;
  const elapsedTimeMinutesAndSeconds = secondsToPaddedHMS(elapsedSeconds);
  const timeLeftMinutesAndSeconds = secondsToPaddedHMS(time);
  const totalTimeMinutesAndSeconds = secondsToPaddedHMS(duration * 60);

  return (
    <>
      <div className="flex">
        <div>
          {elapsedTimeMinutesAndSeconds} / {totalTimeMinutesAndSeconds}
        </div>
        <div className="ml-auto">-{timeLeftMinutesAndSeconds}</div>
      </div>
      {timerState === "paused" && <Button onClick={start}>Start</Button>}
      {timerState === "running" && <Button onClick={pause}>Pause</Button>}
    </>
  );
}
