import { clsx } from "clsx";
import { forwardRef, ComponentProps } from "react";

type Props = Omit<ComponentProps<"input">, "className"> & {};

const InputComp = forwardRef<HTMLInputElement, Props>(
  ({ children, ...props }, ref) => (
    <input
      ref={ref}
      {...props}
      className={clsx(
        "px-1 block w-full rounded-sm",
        "text-sm text-gray-200 placeholder:text-gray-600",
        "border focus-visible:border-transparent border-gray-700 bg-gray-800",
        "focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75"
      )}
    >
      {children}
    </input>
  )
);

InputComp.displayName = "Input";
export const Input = InputComp;
