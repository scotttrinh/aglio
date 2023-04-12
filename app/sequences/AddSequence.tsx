"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { IconPlus } from "@tabler/icons-react";

import {
  StepType,
  isBreak,
  secondsToPaddedHMS,
  stepTypeToBehaviors,
} from "@/utils";
import { Step, Behavior } from "@/dbschema/interfaces";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import * as Disclosure from "@/components/Disclosure";
import { Cell } from "@/components/GridTable";

type UnsavedStep = Omit<Step, "id">;

function EditStep({
  step,
  index,
  onChange,
  onRemove,
}: {
  step: UnsavedStep;
  index: number;
  onChange: (index: number, step: UnsavedStep) => void;
  onRemove: (index: number) => void;
}) {
  const handleDurationChange = (e: FormEvent<HTMLInputElement>) => {
    onChange(index, { ...step, duration: parseInt(e.currentTarget.value) });
  };

  const handleTypeChange = (e: FormEvent<HTMLSelectElement>) => {
    onChange(index, {
      ...step,
      behaviors: stepTypeToBehaviors[e.currentTarget.value as StepType],
    });
  };

  const stepType = isBreak(step) ? "break" : "work";

  return (
    <>
      <Cell className="col-span-4">
        <select className="w-full" value={stepType} onChange={handleTypeChange}>
          <option value="work">Work</option>
          <option value="break">Break</option>
        </select>
      </Cell>
      <Cell className="col-span-2">
        <Input
          aria-label="duration"
          type="number"
          min="1"
          step="1"
          value={step.duration}
          required
          onChange={handleDurationChange}
        />
      </Cell>
      <Cell className="col-span-2">
        <Button type="button" onClick={() => onRemove(index)}>
          Remove
        </Button>
      </Cell>
    </>
  );
}

export function AddSequence() {
  const [isShowingForm, setIsShowingForm] = useState(false);
  const [name, setName] = useState("");
  const [steps, setSteps] = useState<UnsavedStep[]>([
    { duration: 25, behaviors: [] },
  ]);
  const router = useRouter();
  const [isFetching, setIsFetching] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isBusy = isFetching || isPending;

  const handleAddStep = () => {
    setSteps((existingSteps) => {
      const lastStep = existingSteps[existingSteps.length - 1] ?? {
        duration: 5,
        behaviors: ["PAUSES_VIDEO", "PAUSES_AUDIO"],
      };
      const duration = isBreak(lastStep) ? 25 : 5;
      const behaviors: Behavior[] = isBreak(lastStep)
        ? []
        : ["PAUSES_VIDEO", "PAUSES_AUDIO"];
      return [...existingSteps, { duration, behaviors }];
    });
  };

  const handleRemoteStep = (index: number) => {
    setSteps((existingSteps) => {
      const newSteps = [...existingSteps];
      newSteps.splice(index, 1);
      return newSteps;
    });
  };

  const handleChangeStep = (index: number, step: any) => {
    setSteps((existingSteps) => {
      const newSteps = [...existingSteps];
      newSteps[index] = step;
      return newSteps;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setIsFetching(true);
    await fetch("/api/sequence/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        steps: steps.filter((step) => Boolean(step.duration)),
      }),
    });
    setIsFetching(false);
    startTransition(() => {
      router.refresh();
    });
  };

  const totalDuration = secondsToPaddedHMS(
    steps.reduce((total, step) => total + step.duration * 60, 0)
  );

  return (
    <Disclosure.Root
      asChild
      open={isShowingForm}
      onOpenChange={setIsShowingForm}
    >
      <>
        <Disclosure.Trigger asChild>
          <Cell className="col-span-1 flex justify-end py-1">
            <Button
              className="bg-transparent dark:bg-transparent border-transparent dark:border-transparent"
              aria-label="Add sequence"
            >
              <IconPlus size={16} />
            </Button>
          </Cell>
        </Disclosure.Trigger>
        <Cell className="col-start-11 col-span-2">
          <Button type="submit" disabled={isBusy}>
            Save
          </Button>
        </Cell>
        <Disclosure.Content asChild>
          <form
            className="grid grid-cols-12 col-span-full items-center"
            onSubmit={handleSubmit}
          >
            <Cell className="col-span-1" />
            <Cell className="col-span-3">Name</Cell>
            <Cell className="col-span-4">Step type</Cell>
            <Cell className="col-span-2">Duration ({totalDuration})</Cell>
            <Cell className="col-span-2" />
            <Cell className="col-span-1" />
            <Cell className="col-span-3">
              <Input
                aria-label="name"
                type="text"
                value={name}
                required
                onChange={(e) => setName(e.target.value)}
              />
            </Cell>
            {steps.map((step, index) => (
              <EditStep
                key={index}
                step={step}
                index={index}
                onChange={handleChangeStep}
                onRemove={handleRemoteStep}
              />
            ))}
            <Cell className="col-start-5 col-end-13">
              <Button type="button" onClick={handleAddStep}>
                Add Step
              </Button>
            </Cell>
          </form>
        </Disclosure.Content>
      </>
    </Disclosure.Root>
  );
}
