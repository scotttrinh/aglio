import { FormEvent, useState } from "react";
import { IconPlus } from "@tabler/icons-react";

import {
  StepType,
  isBreak,
  secondsToPaddedHMS,
  stepTypeToBehaviors,
} from "@/utils";
import { Step, Behavior, Sequence, helper } from "@/dbschema/interfaces";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import * as Disclosure from "@/components/Disclosure";
import { Cell } from "@/components/GridTable";
import * as Select from "@/components/Select";
import { createSequence } from "../actions";
import { useSactRefresh } from "../useSact";

type UnsavedStep = Omit<Step, "id">;
type SimpleSequence = Omit<helper.Props<Sequence>, "id"> & {
  steps: UnsavedStep[];
};

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

  const handleTypeChange = (value: string) => {
    onChange(index, {
      ...step,
      behaviors: stepTypeToBehaviors[value as StepType],
    });
  };

  const stepType = isBreak(step) ? "break" : "work";

  return (
    <>
      <Cell className="col-span-4" />
      <Cell className="col-span-4">
        <Select.Root value={stepType} onValueChange={handleTypeChange}>
          <Select.Trigger>
            <Select.Value aria-label={stepType}>
              {stepType === "work" ? "Work" : "Break"}
            </Select.Value>
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="work">Work</Select.Item>
            <Select.Item value="break">Break</Select.Item>
          </Select.Content>
        </Select.Root>
        <input name="step-type" type="hidden" value={stepType} readOnly />
      </Cell>
      <Cell className="col-span-2">
        <Input
          name="step-duration"
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

export function AddSequence({
  onAddSequence,
}: {
  onAddSequence: (seq: SimpleSequence) => void;
}) {
  const [isShowingForm, setIsShowingForm] = useState(false);
  const [name, setName] = useState("");
  const [steps, setSteps] = useState<UnsavedStep[]>([
    { duration: 25, behaviors: [] },
  ]);

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

  const { act: handleSubmit, isBusy } = useSactRefresh(
    (seq: SimpleSequence) => {
      onAddSequence(seq);
      return createSequence(seq);
    }
  );

  const totals = steps.reduce(
    (acc, step) => {
      const seconds = step.duration * 60;
      if (isBreak(step)) {
        acc.break += seconds;
      } else {
        acc.work += seconds;
      }
      acc.total += seconds;
      return acc;
    },
    { total: 0, work: 0, break: 0 }
  );

  return (
    <Disclosure.Root
      asChild
      open={isShowingForm}
      onOpenChange={setIsShowingForm}
    >
      <form
        className="grid grid-cols-12 col-span-full items-center"
        action={(formData) => {
          console.log(Array.from(formData.entries()));
          return handleSubmit({
            name,
            steps: steps.filter((step) => Boolean(step.duration)),
          });
        }}
      >
        <Disclosure.Trigger asChild>
          <Cell className="col-span-1 flex justify-end py-1">
            <Button
              className="bg-transparent dark:bg-transparent border-transparent dark:border-transparent"
              aria-label="Add sequence"
              type="button"
            >
              <IconPlus size={16} />
            </Button>
          </Cell>
        </Disclosure.Trigger>
        <Disclosure.Content asChild>
          <>
            <Cell className="col-span-3">
              <Input
                name="name"
                placeholder="New sequence name"
                aria-label="name"
                type="text"
                value={name}
                required
                onChange={(e) => setName(e.target.value)}
              />
            </Cell>
            <Cell className="col-span-2">
              {secondsToPaddedHMS(totals.total)}
            </Cell>
            <Cell className="col-span-2">
              {secondsToPaddedHMS(totals.work)}
            </Cell>
            <Cell className="col-span-2">
              {secondsToPaddedHMS(totals.break)}
            </Cell>
            <Cell className="col-start-11 col-span-2">
              <Button type="submit" disabled={isBusy}>
                Save
              </Button>
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
          </>
        </Disclosure.Content>
      </form>
    </Disclosure.Root>
  );
}
