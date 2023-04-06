"use client";
import { useState } from "react";
import { VideoPlayer } from "./VideoPlayer";

export function Player({ video, audio }: { video: string; audio: string }) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setIsPlaying(!isPlaying)}>
        {isPlaying ? "Pause" : "Play"}
      </button>

      <VideoPlayer src={video} isPlaying={isPlaying} isMuted />
      <VideoPlayer src={audio} isPlaying={isPlaying} />
    </>
  );
}
