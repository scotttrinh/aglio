import { Behavior } from "@/dbschema/interfaces";

export function secondsToPaddedHMS(seconds: number) {
  return `${Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0")}:${Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
}

export const stepTypeToBehaviors: Record<"work" | "break", Behavior[]> = {
  work: [],
  break: ["PAUSES_VIDEO", "PAUSES_AUDIO"],
};

export type StepType = keyof typeof stepTypeToBehaviors;

export function isBreak(step: { behaviors: Behavior[] }) {
  return step.behaviors.includes("PAUSES_VIDEO");
}
