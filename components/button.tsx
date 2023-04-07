import { clsx } from "clsx";
import Link, { LinkProps } from "next/link";
import {
  forwardRef,
  ComponentProps,
  ReactNode,
  AnchorHTMLAttributes,
  RefAttributes,
} from "react";

type Props = Omit<ComponentProps<"button">, "className">;

const buttonClassName = clsx(
  "inline-flex select-none items-center justify-center rounded-sm px-3 py-2 text-xs font-medium",
  "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-900",
  "hover:bg-gray-50 cursor-default",
  "focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75",
  // Register all radix states
  "group",
  "radix-state-open:bg-gray-50 dark:radix-state-open:bg-gray-900",
  "radix-state-on:bg-gray-50 dark:radix-state-on:bg-gray-900",
  "radix-state-instant-open:bg-gray-50 radix-state-delayed-open:bg-gray-50"
);

const ButtonComp = forwardRef<HTMLButtonElement, Props>(
  ({ children, ...props }, ref) => (
    <button ref={ref} {...props} className={buttonClassName}>
      {children}
    </button>
  )
);

ButtonComp.displayName = "Button";
export const Button = ButtonComp;

type LinkButtonProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  keyof LinkProps
> &
  LinkProps & {
    children?: ReactNode;
  } & RefAttributes<HTMLAnchorElement>;

const LinkButtonComp = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  ({ children, ...props }, ref) => (
    <Link ref={ref} {...props} className={buttonClassName}>
      {children}
    </Link>
  )
);

LinkButtonComp.displayName = "LinkButton";
export const LinkButton = LinkButtonComp;
