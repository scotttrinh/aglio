"use client";

import * as React from "react";
import clsx from "clsx";
import * as SelectPrimitive from "@radix-ui/react-select";
import { IconChevronDown, IconCheck } from "@tabler/icons-react";

const Root = SelectPrimitive.Root;

const Group = SelectPrimitive.Group;

const Value = SelectPrimitive.Value;

const Trigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={clsx(
      "flex items-center justify-between",
      "px-1 py-2 block w-full rounded-sm",
      "text-xs text-gray-200 placeholder:text-gray-600",
      "border focus-visible:border-transparent border-gray-700 bg-gray-800",
      "focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75",
      className
    )}
    {...props}
  >
    {children}
    <IconChevronDown size={16} className="opacity-50" />
  </SelectPrimitive.Trigger>
));
Trigger.displayName = SelectPrimitive.Trigger.displayName;

const Content = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={clsx(
        "animate-in fade-in-80 relative z-50 overflow-hidden rounded-sm border shadow-md border-gray-800 bg-gray-800",
        className
      )}
      {...props}
    >
      <SelectPrimitive.Viewport>
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
Content.displayName = SelectPrimitive.Content.displayName;

const Label = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={clsx(
      "py-1.5 pr-2 pl-8 text-sm font-semibold text-gray-300",
      className
    )}
    {...props}
  />
));
Label.displayName = SelectPrimitive.Label.displayName;

const Item = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={clsx(
      "relative flex cursor-default select-none items-center rounded-sm px-1 py-2 text-xs font-medium outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 focus:bg-gray-700",
      className
    )}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>

    <span className="absolute right-1">
      <SelectPrimitive.ItemIndicator>
        <IconCheck size={16} />
      </SelectPrimitive.ItemIndicator>
    </span>
  </SelectPrimitive.Item>
));
Item.displayName = SelectPrimitive.Item.displayName;

const Separator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={clsx("-mx-1 my-1 h-px bg-gray-700", className)}
    {...props}
  />
));
Separator.displayName = SelectPrimitive.Separator.displayName;

export {
  Root,
  Group,
  Value,
  Trigger,
  Content,
  Label,
  Item,
  Separator,
};
