import { clsx } from "clsx";
import { forwardRef, ComponentProps } from "react";

const InputComp = forwardRef<HTMLInputElement, ComponentProps<"input">>(
  ({ children, className, ...props }, ref) => (
    <input
      ref={ref}
      {...props}
      className={clsx(
        "px-1 py-2 block w-full rounded-sm",
        "text-xs text-gray-200 placeholder:text-gray-600",
        "border focus-visible:border-transparent border-gray-700 bg-gray-800",
        "focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75",
        className
      )}
    >
      {children}
    </input>
  )
);

InputComp.displayName = "Input";
export const Input = InputComp;
