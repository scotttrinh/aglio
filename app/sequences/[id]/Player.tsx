"use client";

import { useCallback, useState, ChangeEvent } from "react";
import { match } from "ts-pattern";

import { Input } from "@/components/Input";
import { Button } from "@/components/Button";

import { Timer, TimerState } from "./Timer";
import { VideoPlayer } from "./VideoPlayer";
import { Playlist, Step } from "./query";
import { useRouter } from "next/navigation";

function PlaylistSelection({
  playlists,
  onPlaylistSelect,
  onPlaylistCreate,
}: {
  playlists: Playlist[];
  onPlaylistSelect: (playlistId: string | null) => void;
  onPlaylistCreate: (playlistId: string) => void;
}) {
  const [inputElem, setInputElem] = useState<HTMLInputElement | null>(null);
  const [playlistUrl, setPlaylistUrl] = useState("");
  const handlePlaylistUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    try {
      new URL(event.target.value);
      inputElem?.setCustomValidity("");
      setPlaylistUrl(event.target.value);
    } catch (error) {
      inputElem?.setCustomValidity("Value is not a valid URL");
    }
  };

  return (
    <div className="flex flex-col gap-1 flex-1">
      <select
        className="w-full"
        onChange={(event) => onPlaylistSelect(event.target.value || null)}
      >
        <option value="">Select a playlist</option>
        {playlists.map((playlist) => (
          <option key={playlist.id} value={playlist.id}>
            {playlist.url}
          </option>
        ))}
      </select>
      <div className="flex gap-1">
        <Input
          ref={setInputElem}
          type="text"
          placeholder="Playlist URL"
          value={playlistUrl}
          onChange={handlePlaylistUrlChange}
        />
        <Button onClick={() => onPlaylistCreate(playlistUrl)}>Create</Button>
      </div>
    </div>
  );
}

export function Player({
  steps,
  playlists,
}: {
  steps: Step[];
  playlists: Playlist[];
}) {
  const [createPlaylistError, setCreatePlaylistError] = useState<string | null>(
    null
  );

  const [video, setVideo] = useState<Playlist | null>(null);

  const [audio, setAudio] = useState<Playlist | null>(null);

  const [stepIndex, setStepIndex] = useState(0);

  const [isPlaying, setIsPlaying] = useState(false);

  const router = useRouter();

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

  const handlePlaylistCreate =
    (playlistRole: "audio" | "video") => async (url: string) => {
      // Use fetch to call API with the new playlist URL and check for any HTTP errors
      // If there are no errors, use the router to refresh the page

      try {
        const result = await fetch("/api/playlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url }),
        }).then((resp) => {
          if (!resp.ok) {
            throw new Error(resp.statusText);
          }
          return resp.json() as Promise<{ id: string }>;
        });

        router.refresh();
      } catch (error) {
        if (error instanceof Error) {
          setCreatePlaylistError(error.message);
        }
      }
    };

  const step = steps[stepIndex];
  const duration = step.duration;

  const audioPlaylistId = audio
    ? new URL(audio.url).searchParams.get("list")
    : null;
  const videoPlaylistId = video
    ? new URL(video.url).searchParams.get("list")
    : null;

  return (
    <div className="overflow-y-auto flex-1">
      <div className="flex gap-1 w-full">
        <div className="flex gap-1 flex-1">
          <div>Video</div>
          <PlaylistSelection
            playlists={playlists}
            onPlaylistSelect={(maybePlaylistId) => {
              if (!maybePlaylistId) {
                setVideo(null);
                return;
              }

              const found =
                playlists.find((playlist) => playlist.id === maybePlaylistId) ??
                null;
              if (found) {
                setVideo(found);
              }
            }}
            onPlaylistCreate={handlePlaylistCreate("video")}
          />
        </div>
        <div className="flex gap-1 flex-1">
          <div>Audio</div>
          <PlaylistSelection
            playlists={playlists}
            onPlaylistSelect={(maybePlaylistId) => {
              if (!maybePlaylistId) {
                setAudio(null);
                return;
              }

              const found =
                playlists.find((playlist) => playlist.id === maybePlaylistId) ??
                null;
              if (found) {
                setAudio(found);
              }
            }}
            onPlaylistCreate={handlePlaylistCreate("audio")}
          />
        </div>
      </div>
      {videoPlaylistId && audioPlaylistId && (
        <>
          <div className="relative h-full">
            <VideoPlayer
              key={videoPlaylistId}
              src={videoPlaylistId}
              isPlaying={isPlaying}
              isMuted
            />
            <div className="absolute bottom-0 left-0 w-full p-8 bg-black/25 text-2xl">
              <Timer
                key={`${videoPlaylistId}:${audioPlaylistId}`}
                duration={duration}
                onTimerStateChange={handleTimerStateChange}
              />
            </div>
          </div>
          <div className="h-full">
            <VideoPlayer
              key={audioPlaylistId}
              src={audioPlaylistId}
              isPlaying={isPlaying}
            />
          </div>
        </>
      )}
    </div>
  );
}
