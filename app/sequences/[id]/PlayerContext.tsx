import {
  useEffect,
  useState,
  useCallback,
  useContext,
  createContext,
  useRef,
} from "react";
import makeYouTubePlayer from "youtube-player";
import { YouTubePlayer } from "react-youtube";

import { Source } from "./query";

type PlayerState = "playing" | "paused";

interface ContextValue {
  state: PlayerState;
  progress: number;
  duration: number;
  mute: () => void;
  unmute: () => void;
  setVolume: (volume: number) => void;
  play: () => void;
  pause: () => void;
  seek: (progress: number) => void;
  next: () => void;
  previous: () => void;
}

const PlayerContext = createContext<ContextValue | null>(null);

export function PlayerProvider({
  children,
  state,
  isMuted = false,
  isShuffled = false,
  onStateChange,
  source,
  targetElem,
}: {
  children: React.ReactNode;
  state: PlayerState;
  isMuted?: boolean;
  isShuffled?: boolean;
  onStateChange: (state: PlayerState) => void;
  source: Source | null;
  targetElem: HTMLElement | null;
}) {
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);

  const play = useCallback(() => {
    onStateChange("playing");
  }, [onStateChange]);

  const pause = useCallback(() => {
    onStateChange("paused");
  }, [onStateChange]);

  const seek = useCallback(
    (progress: number) => {
      player?.seekTo(progress, true);
    },
    [player]
  );

  const next = useCallback(() => {
    player?.nextVideo();
  }, [player]);

  const previous = useCallback(() => {
    player?.previousVideo();
  }, [player]);

  const setVolume = useCallback(
    (volume: number) => {
      player?.setVolume(volume);
    },
    [player]
  );

  const mute = useCallback(() => {
    player?.mute();
  }, [player]);

  const unmute = useCallback(() => {
    player?.unMute();
  }, [player]);

  useEffect(
    function initializePlayer() {
      if (targetElem === null || source === null) {
        return;
      }

      const list = new URL(source.url).searchParams.get("list");
      if (!list) {
        return;
      }

      const newPlayer = makeYouTubePlayer(targetElem, {
        playerVars: {
          list,
          listType: "playlist",
          modestbranding: 1,
        },
      });
      newPlayer.setShuffle(isShuffled);
      setPlayer(newPlayer);

      return () => {
        newPlayer.destroy();
      };
    },
    [source, targetElem, isShuffled]
  );

  useEffect(
    function syncShuffle() {
      player?.setShuffle(isShuffled);
    },
    [player, isShuffled]
  );

  useEffect(
    function syncPlayerState() {
      player?.getPlayerState().then((playerState) => {
        if (state === "playing" && playerState !== 1) {
          player?.playVideo();
        } else if (state === "paused" && playerState !== 2) {
          player?.pauseVideo();
        }
      });
    },
    [player, state]
  );

  useEffect(
    function syncMutedState() {
      player?.isMuted().then((mutedState) => {
        if (mutedState !== isMuted) {
          if (isMuted) {
            player?.mute();
          } else {
            player?.unMute();
          }
        }
      });
    },
    [player, isMuted]
  );

  useEffect(
    function syncProgress() {
      if (!player) return;
      if (state !== "playing") return;

      const timer = setInterval(() => {
        player?.getCurrentTime().then((currentTime) => {
          setProgress(Math.round(currentTime));
        });
      }, 1000);
      return () => {
        clearInterval(timer);
      };
    },
    [player, state]
  );

  useEffect(
    function syncDurationAndProgress() {
      function sync() {
        player?.getDuration().then((duration) =>
          player?.getCurrentTime().then((currentTime) => {
            setDuration(Math.round(duration));
            setProgress(Math.round(currentTime));
          })
        );
      }

      player?.addEventListener("onStateChange", sync);
      return () => {
        player?.removeEventListener("onStateChange", sync);
      };
    },
    [player]
  );

  return (
    <PlayerContext.Provider
      value={{
        state,
        progress,
        duration,
        play,
        pause,
        seek,
        next,
        previous,
        setVolume,
        mute,
        unmute,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === null) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return context;
}
