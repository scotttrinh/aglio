"use client";

import { useCallback, useState, FormEvent, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Input } from "@/components/Input";
import { Button } from "@/components/Button";

import { Timer, TimerState } from "./Timer";
import { SourceCard } from "./SourceCard";
import { Source, Step } from "./query";
import { createPortal } from "react-dom";
import { PlayerProvider } from "./PlayerContext";
import { createSource } from "@/app/actions";

function AddSource({
  onCreate,
  isDisabled,
}: {
  onCreate: (url: string) => void;
  isDisabled?: boolean;
}) {
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
      <Button disabled={isDisabled} type="submit">
        Add
      </Button>
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
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  const [audioElem, setAudioElem] = useState<HTMLDivElement | null>(null);

  const [videoElem, setVideoElem] = useState<HTMLDivElement | null>(null);

  const [audioPortalTargetElem, setAudioPortalTargetElem] =
    useState<HTMLDivElement | null>(null);

  const [createSourceError, setCreateSourceError] = useState<string | null>(
    null
  );

  const [video, setVideo] = useState<Source | null>(null);

  const [audio, setAudio] = useState<Source | null>(null);

  const [stepIndex, setStepIndex] = useState(0);

  const [timerState, setTimerState] = useState<TimerState>("paused");

  const router = useRouter();

  const handleTimerStateChange = useCallback(
    (timerState: TimerState) => {
      setTimerState(timerState);
      if (timerState === "ended") {
        setStepIndex((stepIndex) =>
          stepIndex === steps.length - 1 ? 0 : stepIndex + 1
        );
        setTimerState("running");
      }
    },
    [steps.length]
  );

  const handleSourceCreate = async (url: string) => {
    // Use fetch to call API with the new playlist URL and check for any HTTP errors
    // If there are no errors, use the router to refresh the page

    setIsFetching(true);
    try {
      await createSource({
        url,
        provider: "youtube",
        mediaType: "playlist",
      });

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      if (error instanceof Error) {
        setCreateSourceError(error.message);
      }
    } finally {
      setIsFetching(false);
    }
  };

  const step = steps[stepIndex];
  const duration = step.duration;

  return (
    <div className="overflow-y-auto flex-1 pt-8">
      <div className="flex gap-4 w-full px-2">
        <div className="flex gap-1 flex-1">
          <AddSource
            onCreate={handleSourceCreate}
            isDisabled={isFetching || isPending}
          />
        </div>
        {createSourceError && (
          <div className="bg-red-500 text-white p-2">{createSourceError}</div>
        )}
      </div>
      <div className="relative h-full">
        <div className="w-full h-full">
          <div ref={setVideoElem} className="w-full h-full" />
        </div>
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black/25 flex opacity-0 hover:opacity-100">
          <Timer
            key={step.id}
            timerState={timerState}
            duration={duration}
            onTimerStateChange={handleTimerStateChange}
          />
        </div>
        <div className="absolute bottom-0 left-0 w-full p-2 bg-black/75 flex">
          <div className="w-1/4">
            <div className="text-sm font-semibold text-gray-400">Video</div>
            <PlayerProvider
              isMuted
              state={
                timerState === "running" &&
                !step.behaviors.includes("PAUSES_VIDEO")
                  ? "playing"
                  : "paused"
              }
              onStateChange={() => {}}
              source={video}
              targetElem={videoElem}
            >
              <SourceCard
                source={video}
                onSourceChange={setVideo}
                sources={sources}
              />
            </PlayerProvider>
          </div>
          <div className="w-1/4 ml-auto">
            <div className="text-sm font-semibold text-gray-400">Audio</div>
            <PlayerProvider
              state={
                timerState === "running" &&
                !step.behaviors.includes("PAUSES_AUDIO")
                  ? "playing"
                  : "paused"
              }
              onStateChange={() => {}}
              isShuffled
              source={audio}
              targetElem={audioElem}
            >
              <SourceCard
                source={audio}
                onSourceChange={setAudio}
                sources={sources}
              />
              {audioPortalTargetElem &&
                createPortal(
                  <div className="w-full h-full">
                    <div ref={setAudioElem} className="w-full h-full" />
                  </div>,
                  audioPortalTargetElem
                )}
            </PlayerProvider>
          </div>
        </div>
      </div>
      <div ref={setAudioPortalTargetElem} className="h-full" />
    </div>
  );
}
