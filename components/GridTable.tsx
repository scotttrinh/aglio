import { ComponentProps } from "react";
import clsx from "clsx";

export const rowClass = clsx(
  "grid grid-cols-12",
  "border-b",
  "first-of-type:border-t"
);

export const cellClass = clsx("px-2 py-1 flex items-center tabular-nums");

export const headerCellClass = clsx(cellClass, "text-xs font-medium");

export function Row(props: ComponentProps<"div">) {
  return <div {...props} className={clsx(rowClass, props.className)} />;
}

export function Cell(props: ComponentProps<"div">) {
  return <div {...props} className={clsx(cellClass, props.className)} />;
}

export function HeaderCell(props: ComponentProps<"div">) {
  return <div {...props} className={clsx(headerCellClass, props.className)} />;
}
