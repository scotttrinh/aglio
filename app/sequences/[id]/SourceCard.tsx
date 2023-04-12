import * as Select from "@/components/Select";
import { Button } from "@/components/Button";
import { Slider } from "@/components/Slider";

import { Source } from "./query";
import {
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
  IconPlayerSkipBackFilled,
  IconPlayerSkipForwardFilled,
} from "@tabler/icons-react";
import { secondsToPaddedHMS } from "@/utils";

export function SourceCard({
  source,
  sources,
  onSourceChange,
  sourceState,
  progress,
  duration,
  onToggleState,
  onNext,
  onPrevious,
}: {
  source: Source | null;
  sources: Source[];
  onSourceChange: (source: Source) => void;
  sourceState: "playing" | "paused";
  progress: number;
  duration: number;
  onToggleState: () => void;
  onNext: () => void;
  onPrevious: () => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        <div className="flex gap-1">
          {source?.thumbnail && (
            <img src={source.thumbnail} className="w-8 h-8 rounded-sm" />
          )}
          <SourceSelection
            source={source}
            sources={sources}
            onSelect={(sourceId) => {
              const source = sources.find((source) => source.id === sourceId);
              if (source) {
                onSourceChange(source);
              }
            }}
          />
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex flex-row gap-1 items-center">
            <Button onClick={onPrevious} aria-label="Previous">
              <IconPlayerSkipBackFilled size={12} />
            </Button>
            <Button onClick={onToggleState} disabled={!source}>
              {sourceState === "playing" ? (
                <IconPlayerPauseFilled size={12} />
              ) : (
                <IconPlayerPlayFilled size={12} />
              )}
            </Button>
            <span className="text-xs text-gray-200">
              {secondsToPaddedHMS(progress)}
            </span>
            <div className="flex-1">
              <Slider
                value={[progress]}
                onValueChange={() => {}}
                max={duration}
              />
            </div>
            <span className="text-xs text-gray-200">
              {secondsToPaddedHMS(duration)}
            </span>
            <Button onClick={onNext} aria-label="Next">
              <IconPlayerSkipForwardFilled size={12} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SourceSelection({
  source,
  sources,
  onSelect,
}: {
  source: Source | null;
  sources: Source[];
  onSelect: (playlistId: string | null) => void;
}) {
  return (
    <div className="flex flex-col gap-1 flex-1 overflow-hidden">
      <Select.Root value={source?.id} onValueChange={onSelect}>
        <Select.Trigger>
          <Select.Value asChild>
            <span className="overflow-hidden overflow-ellipsis whitespace-nowrap">
              {source?.title ?? source?.url ?? "Select a source"}
            </span>
          </Select.Value>
        </Select.Trigger>
        <Select.Content>
          {sources.map((source) => (
            <Select.Item key={source.id} value={source.id}>
              {source.title ?? source.url}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>
    </div>
  );
}
