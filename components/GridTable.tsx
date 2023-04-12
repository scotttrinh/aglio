import { ComponentProps, forwardRef } from "react";
import clsx from "clsx";

export const rowClass = clsx(
  "grid grid-cols-12",
  "border-b",
  "first-of-type:border-t"
);

export const cellClass = clsx("px-2 py-1 flex items-center tabular-nums");

export const headerCellClass = clsx(cellClass, "text-xs font-medium");

export const Row = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    return <div {...props} ref={ref} className={clsx(rowClass, className)} />;
  }
);

export const Cell = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    return <div {...props} ref={ref} className={clsx(cellClass, className)} />;
  }
);

export const HeaderCell = forwardRef<HTMLDivElement, ComponentProps<"div">>(
  ({ className, ...props }, ref) => {
    return (
      <div {...props} ref={ref} className={clsx(headerCellClass, className)} />
    );
  }
);
