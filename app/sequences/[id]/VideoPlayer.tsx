"use client";

import { YouTubePlaylist } from "@/components/YouTubePlaylist";

export function VideoPlayer({
  src,
  isPlaying = true,
  isMuted = false,
}: {
  src: string;
  isPlaying?: boolean;
  isMuted?: boolean;
}) {
  return <YouTubePlaylist src={src} isPlaying={isPlaying} isMuted={isMuted} />;
}
