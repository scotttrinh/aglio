"use client";

import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/Button";

export type TimerState = "running" | "paused" | "ended";

function secondsToPaddedMinutesAndSeconds(seconds: number) {
  return `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
}

function useTimer({
  offset = 0,
  onTick,
  onEnd,
  initialTimerState = "paused",
}: {
  offset?: number;
  onTick?: (time: number) => void;
  onEnd?: () => void;
  initialTimerState?: TimerState;
}) {
  const [time, setTime] = useState(offset);
  const [timerState, setTimerState] = useState<TimerState>(initialTimerState);
  const [intervalId, setIntervalId] = useState<NodeJS.Timer | null>(null);

  useEffect(() => {
    if (time === 0) {
      setTimerState("ended");
      if (onEnd) {
        onEnd();
      }
    }
  }, [time]);

  const start = useCallback(() => {
    if (["running", "ended"].includes(timerState)) {
      return;
    }
    setTimerState("running");
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
    setTimerState("paused");
    if (intervalId) clearInterval(intervalId);
  }, [timerState, intervalId]);

  const reset = useCallback(() => {
    setTimerState(initialTimerState);
    setTime(offset);
    if (intervalId) clearInterval(intervalId);
  }, [initialTimerState, offset, intervalId]);

  return {
    time,
    timerState,
    start,
    pause,
    reset,
  };
}

export function Timer({
  duration,
  onTimerStateChange,
}: {
  duration: number;
  onTimerStateChange?: (timerState: TimerState) => void;
}) {
  const { time, timerState, start, pause, reset } = useTimer({
    offset: duration * 60,
    initialTimerState: "paused",
  });

  useEffect(() => {
    if (onTimerStateChange) {
      onTimerStateChange(timerState);
    }
  }, [timerState, onTimerStateChange]);

  const elapsedSeconds = duration * 60 - time;
  const elapsedTimeMinutesAndSeconds =
    secondsToPaddedMinutesAndSeconds(elapsedSeconds);
  const timeLeftMinutesAndSeconds = secondsToPaddedMinutesAndSeconds(time);
  const totalTimeMinutesAndSeconds = secondsToPaddedMinutesAndSeconds(
    duration * 60
  );

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
      <Button onClick={reset}>Reset</Button>
    </>
  );
}
