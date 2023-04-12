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
import { usePlayer } from "./PlayerContext";

export function SourceCard({
  source,
  sources,
  onSourceChange,
}: {
  source: Source | null;
  sources: Source[];
  onSourceChange: (source: Source) => void;
}) {
    const player = usePlayer();
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
          <div className="flex flex-row gap-1 items-center tabular-nums">
            <Button onClick={player.previous} aria-label="Previous">
              <IconPlayerSkipBackFilled size={12} />
            </Button>
            <Button onClick={player.state === "playing" ? player.pause : player.play} disabled={!source}>
              {player.state === "playing" ? (
                <IconPlayerPauseFilled size={12} />
              ) : (
                <IconPlayerPlayFilled size={12} />
              )}
            </Button>
            <span className="text-xs text-gray-200">
              {secondsToPaddedHMS(player.progress)}
            </span>
            <div className="flex-1">
              <Slider
                value={[player.progress]}
                onValueChange={([position]) => player.seek(position)}
                max={player.duration}
              />
            </div>
            <span className="text-xs text-gray-200">
              {secondsToPaddedHMS(player.duration)}
            </span>
            <Button onClick={player.next} aria-label="Next">
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
    const sourceTitle = source?.title ?? source?.url ?? "Select a source";
  return (
    <div className="flex flex-col gap-1 flex-1 overflow-hidden">
      <Select.Root value={source?.id} onValueChange={onSelect}>
        <Select.Trigger>
          <Select.Value asChild>
            <span className="overflow-hidden overflow-ellipsis whitespace-nowrap" title={sourceTitle}>
              {sourceTitle}
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
