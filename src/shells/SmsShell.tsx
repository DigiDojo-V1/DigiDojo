import { ChatShell } from "./ChatShell";
import type { ShellProps } from "./types";

/** The phone's own text messages: a plain chat with grey bubbles. `contact.name` is the sender id. */
export function SmsShell(props: ShellProps) {
  return <ChatShell theme="sms" {...props} />;
}
