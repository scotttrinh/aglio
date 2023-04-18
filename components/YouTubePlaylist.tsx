import clsx from "clsx";
import { useRef, useState, useEffect } from "react";
import makeYouTubePlayer from "youtube-player";
import { YouTubePlayer } from "youtube-player/dist/types";

export function YouTubePlaylist({
  src,
  isPlaying,
  isMuted,
}: {
  src: string;
  isPlaying: boolean;
  isMuted: boolean;
}) {
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [divElem, setDivElem] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (divElem === null) {
      return;
    }

    const newPlayer = makeYouTubePlayer(divElem, {
      playerVars: {
        list: src,
        listType: "playlist",
        modestbranding: 1,
      },
    });

    setPlayer(newPlayer);

    return () => {
      newPlayer.destroy();
      setDivElem(null);
    };
  }, [src, divElem]);

  useEffect(() => {
    if (!player) return;

    player.getPlayerState().then((playerState) => {
      const isCurrentlyPlaying = playerState === 1;
      if (isCurrentlyPlaying && !isPlaying) {
        player?.pauseVideo();
      } else if (!isCurrentlyPlaying && isPlaying) {
        player?.playVideo();
      }
    });
  }, [isPlaying, player]);

  useEffect(() => {
    if (!player) return;

    player.isMuted().then((isCurrentlyMuted) => {
      if (isCurrentlyMuted && !isMuted) {
        player?.unMute();
      } else if (!isCurrentlyMuted && isMuted) {
        player?.mute();
      }
    });
  }, [isMuted, player]);

  return (
    <div
      className={clsx("w-full h-full min-h-[200px] min-w-[200px]")}
      ref={setDivElem}
    />
  );
}
