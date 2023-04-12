"use client";

import { useCallback, useState, FormEvent } from "react";
import { match } from "ts-pattern";
import { useRouter } from "next/navigation";

import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import * as Select from "@/components/Select";

import { Timer, TimerState } from "./Timer";
import { VideoPlayer } from "./VideoPlayer";
import { SourceCard } from "./SourceCard";
import { Source, Step } from "./query";

function AddSource({ onCreate }: { onCreate: (url: string) => void }) {
  const [inputElem, setInputElem] = useState<HTMLInputElement | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const handleSourceCreate = (event: FormEvent) => {
    event.preventDefault();

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
      setSourceUrl("");
      onCreate(url.toString());
    } catch (error) {
      inputElem?.setCustomValidity("Value is not a valid URL");
    }
  };

  return (
    <form className="flex-1 flex gap-1" onSubmit={handleSourceCreate}>
      <label className="flex flex-1 gap-1 items-center">
        <div className="shrink-0">Add source</div>
        <Input
          className="flex-1"
          ref={setInputElem}
          type="text"
          placeholder="YouTube Playlist URL"
          value={sourceUrl}
          onChange={(event) => setSourceUrl(event.target.value)}
        />
      </label>
      <Button type="submit">Add</Button>
    </form>
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
    <div className="overflow-y-auto flex-1 pt-8">
      <div className="flex gap-4 w-full px-2">
        <div className="flex gap-1 flex-1">
          <AddSource onCreate={handleSourceCreate} />
        </div>
        {createSourceError && (
          <div className="bg-red-500 text-white p-2">{createSourceError}</div>
        )}
      </div>
      <div className="relative h-full">
        {videoPlaylistId && (
          <VideoPlayer src={videoPlaylistId} isPlaying={isPlaying} isMuted />
        )}
        <div className="absolute top-0 left-0 w-full p-2 bg-black/25 flex">
          <Timer
            key={`${videoPlaylistId}:${audioPlaylistId}`}
            duration={duration}
            onTimerStateChange={handleTimerStateChange}
          />
        </div>
        <div className="absolute bottom-0 left-0 w-full p-2 bg-black/75 flex">
          <div className="w-1/4">
            <div className="text-sm font-semibold text-gray-400">Video</div>
            <SourceCard
              source={video}
              onSourceChange={setVideo}
              sources={sources}
              sourceState="playing"
              progress={10}
              duration={100}
              onToggleState={() => {}}
              onNext={() => {}}
              onPrevious={() => {}}
            />
          </div>
          <div className="w-1/4 ml-auto">
            <div className="text-sm font-semibold text-gray-400">Audio</div>
            <SourceCard
              source={audio}
              onSourceChange={setAudio}
              sources={sources}
              sourceState="playing"
              progress={10}
              duration={100}
              onToggleState={() => {}}
              onNext={() => {}}
              onPrevious={() => {}}
            />
          </div>
        </div>
      </div>
      <div className="h-full" />
    </div>
  );
}
