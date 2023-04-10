"use client";

import { useCallback, useState } from "react";
import { match } from "ts-pattern";

import { Timer, TimerState } from "./Timer";
import { VideoPlayer } from "./VideoPlayer";
import { Step } from "./query";

export function Player({ steps }: { steps: Step[] }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const handleTimerStateChange = useCallback((timerState: TimerState) => {
    match(timerState)
      .with("running", () => {
        setIsPlaying(true);
      })
      .with("paused", () => {
        setIsPlaying(false);
      })
      .with("ended", () => {
        setStepIndex((stepIndex) =>
          stepIndex === steps.length - 1 ? 0 : stepIndex + 1
        );
      })
      .exhaustive();
  }, []);

  const step = steps[stepIndex];
  const video = new URL(step.video.url).searchParams.get("list") as string;
  const audio = new URL(step.audio.url).searchParams.get("list") as string;
  const duration = step.duration;

  return (
    <div className="overflow-y-auto flex-1">
      <div className="relative h-full">
        <VideoPlayer src={video} isPlaying={isPlaying} isMuted />
        <div className="absolute bottom-0 left-0 w-full p-8 bg-black/25 text-2xl">
          <Timer
            duration={duration}
            onTimerStateChange={handleTimerStateChange}
          />
        </div>
      </div>
      <div className="h-full">
        <VideoPlayer src={audio} isPlaying={isPlaying} />
      </div>
    </div>
  );
}
