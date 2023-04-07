"use client";

import { useCallback, useState } from "react";

import { Timer, TimerState } from "./Timer";
import { VideoPlayer } from "./VideoPlayer";

export function Player({
  video,
  audio,
  duration,
}: {
  video: string;
  audio: string;
  duration: number;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const handleTimerStateChange = useCallback((timerState: TimerState) => {
    if (timerState === "running") {
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
    }
  }, []);

  return (
    <div className="overflow-y-auto flex-1">
      <div className="relative h-full">
        <VideoPlayer src={video} isPlaying={isPlaying} isMuted />
        <div className="absolute bottom-0 left-0 p-8 bg-black/25 text-2xl">
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
