"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";

import { Button } from "@/components/Button";
import { Input } from "@/components/Input";

interface Step {
  duration: number;
}

function EditStep({
  step,
  index,
  onChange,
  onRemove,
  onAdd,
}: {
  step: Step;
  index: number;
  onAdd: () => void;
  onChange: (index: number, step: Step) => void;
  onRemove: (index: number) => void;
}) {
  const handleDurationChange = (e: FormEvent<HTMLInputElement>) => {
    onChange(index, { ...step, duration: parseInt(e.currentTarget.value) });
  };

  return (
    <>
      <div className="col-start-10 col-span-1">
        <Input
          aria-label="duration"
          type="number"
          min="1"
          step="1"
          value={step.duration}
          required
          onChange={handleDurationChange}
        />
      </div>
      <div className="col-start-11 col-end-13">
        <Button type="button" onClick={() => onRemove(index)}>
          Remove
        </Button>
      </div>
      <div className="col-start-4 col-end-13">
        <Button type="button" onClick={onAdd}>
          Add Step
        </Button>
      </div>
    </>
  );
}

export function AddSequence() {
  const [name, setName] = useState("");
  const [steps, setSteps] = useState([{ duration: 20 }]);
  const router = useRouter();
  const [isFetching, setIsFetching] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isBusy = isFetching || isPending;

  const handleAddStep = () => {
    setSteps((existingSteps) => [
      ...existingSteps,
      { duration: 20 },
    ]);
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

  return (
    <form
      className="grid grid-cols-12 gap-2 col-span-full"
      onSubmit={handleSubmit}
    >
      <div className="col-start-1 col-span-3">Name</div>
      <div className="col-start-4 col-span-3">Audio</div>
      <div className="col-start-7 col-span-3">Video</div>
      <div className="col-start-10 col-span-1">Duration</div>
      <div className="col-start-11 col-end-13">
        <Button type="submit" disabled={isBusy}>
          Save
        </Button>
      </div>
      <div className="col-start-1 col-span-3">
        <Input
          aria-label="name"
          type="text"
          value={name}
          required
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      {steps.map((step, index) => (
        <EditStep
          key={index}
          step={step}
          index={index}
          onAdd={handleAddStep}
          onChange={handleChangeStep}
          onRemove={handleRemoteStep}
        />
      ))}
    </form>
  );
}
