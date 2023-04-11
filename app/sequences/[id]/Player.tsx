"use client";

import { useCallback, useState, ChangeEvent } from "react";
import { match } from "ts-pattern";
import { useRouter } from "next/navigation";

import { Input } from "@/components/Input";
import { Button } from "@/components/Button";

import { Timer, TimerState } from "./Timer";
import { VideoPlayer } from "./VideoPlayer";
import { Source, Step } from "./query";

function AddSource({ onCreate }: { onCreate: (url: string) => void }) {
  const [inputElem, setInputElem] = useState<HTMLInputElement | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const handleSourceCreate = () => {
    try {
      const url = new URL(sourceUrl);

      const isYouTubeHostname = url.hostname === "youtube.com";
      const isYouTubePlaylist = url.searchParams.get("list") !== null;

      if (!isYouTubeHostname || !isYouTubePlaylist) {
        inputElem?.setCustomValidity(
          "Value is not a valid YouTube playlist URL"
        );
        return;
      }

      inputElem?.setCustomValidity("");
      onCreate(url.toString());
    } catch (error) {
      inputElem?.setCustomValidity("Value is not a valid URL");
    }
  };

  return (
    <div className="flex gap-1">
      <Input
        ref={setInputElem}
        type="text"
        placeholder="Playlist URL"
        value={sourceUrl}
        onChange={(event) => setSourceUrl(event.target.value)}
      />
      <Button onClick={handleSourceCreate}>Create</Button>
    </div>
  );
}

function SourceSelection({
  sources,
  onSelect,
}: {
  sources: Source[];
  onSelect: (playlistId: string | null) => void;
}) {
  return (
    <div className="flex flex-col gap-1 flex-1">
      <select
        className="w-full"
        onChange={(event) => onSelect(event.target.value || null)}
      >
        <option value="">Select a source</option>
        {sources.map((source) => (
          <option key={source.id} value={source.id}>
            {source.title ?? source.url}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Player({
  steps,
  sources,
}: {
  steps: Step[];
  sources: Source[];
}) {
  const [createSourceError, setCreateSourceError] = useState<string | null>(
    null
  );

  const [video, setVideo] = useState<Source | null>(null);

  const [audio, setAudio] = useState<Source | null>(null);

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

  const handleSourceCreate = async (url: string) => {
    // Use fetch to call API with the new playlist URL and check for any HTTP errors
    // If there are no errors, use the router to refresh the page

    try {
      const result = await fetch("/api/playlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          provider: "youtube",
          mediaType: "playlist",
        }),
      }).then((resp) => {
        if (!resp.ok) {
          throw new Error(resp.statusText);
        }
        return resp.json() as Promise<{ id: string }>;
      });

      router.refresh();
    } catch (error) {
      if (error instanceof Error) {
        setCreateSourceError(error.message);
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
          <AddSource onCreate={handleSourceCreate} />
        </div>
        {createSourceError && (
          <div className="bg-red-500 text-white p-2">{createSourceError}</div>
        )}
        <div className="flex gap-1 flex-1">
          <div>Video</div>
          <SourceSelection
            sources={sources}
            onSelect={(maybeSourceId) => {
              if (!maybeSourceId) {
                setVideo(null);
                return;
              }

              const found =
                sources.find((source) => source.id === maybeSourceId) ?? null;
              if (found) {
                setVideo(found);
              }
            }}
          />
        </div>
        <div className="flex gap-1 flex-1">
          <div>Audio</div>
          <SourceSelection
            sources={sources}
            onSelect={(maybeSourceId) => {
              if (!maybeSourceId) {
                setVideo(null);
                return;
              }

              const found =
                sources.find((source) => source.id === maybeSourceId) ?? null;
              if (found) {
                setAudio(found);
              }
            }}
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
