"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";

interface Step {
  audio: string;
  video: string;
  duration: number;
}

function EditStep(props: {
  step: Step;
  index: number;
  onChange: (index: number, step: Step) => void;
  onRemove: (index: number) => void;
}) {
  const { step, index, onChange, onRemove } = props;

  const handleAudioChange = (e: FormEvent<HTMLInputElement>) => {
    onChange(index, { ...step, audio: e.currentTarget.value });
  };

  const handleVideoChange = (e: FormEvent<HTMLInputElement>) => {
    onChange(index, { ...step, video: e.currentTarget.value });
  };

  const handleDurationChange = (e: FormEvent<HTMLInputElement>) => {
    onChange(index, { ...step, duration: parseInt(e.currentTarget.value) });
  };

  return (
    <div>
      <label>
        Audio
        <input type="text" value={step.audio} onChange={handleAudioChange} />
      </label>
      <label>
        Video
        <input type="text" value={step.video} onChange={handleVideoChange} />
      </label>
      <label>
        Duration
        <input
          type="number"
          min="1"
          step="1"
          value={step.duration}
          onChange={handleDurationChange}
        />
      </label>
      <button type="button" onClick={() => onRemove(index)}>
        Remove Step
      </button>
    </div>
  );
}

export function AddSequence() {
  const [name, setName] = useState("");
  const [steps, setSteps] = useState([{ audio: "", video: "", duration: 0 }]);
  const router = useRouter();
  const [isFetching, setIsFetching] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isBusy = isFetching || isPending;

  const addStep = () => {
    setSteps((existingSteps) => [
      ...existingSteps,
      { audio: "", video: "", duration: 0 },
    ]);
  };

  const removeStep = (index: number) => {
    setSteps((existingSteps) => {
      const newSteps = [...existingSteps];
      newSteps.splice(index, 1);
      return newSteps;
    });
  };

  const handleStepChange = (index: number, step: any) => {
    setSteps((existingSteps) => {
      const newSteps = [...existingSteps];
      newSteps[index] = step;
      return newSteps;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    console.log({ name, steps });
    setIsFetching(true);
    await fetch("/api/sequence/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, steps }),
    });
    setIsFetching(false);
    startTransition(() => {
      setName("");
      setSteps([{ audio: "", video: "", duration: 0 }]);
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Name
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <button type="button" onClick={addStep}>
        Add Step
      </button>
      {steps.map((step, index) => (
        <EditStep
          key={index}
          step={step}
          index={index}
          onChange={handleStepChange}
          onRemove={removeStep}
        />
      ))}
      <button type="submit" disabled={isBusy}>
        Create Sequence
      </button>
    </form>
  );
}
