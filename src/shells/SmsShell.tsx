import { ChatShell } from "./ChatShell";
import { PhoneFrame } from "./PhoneFrame";
import type { ShellProps } from "./types";

/**
 * The phone's own text messages: a plain chat with grey bubbles. `contact.name` is the sender id.
 * Phone-only, so on desktop it sits in the phone mockup.
 */
export function SmsShell(props: ShellProps) {
  return (
    <PhoneFrame>
      <ChatShell theme="sms" {...props} />
    </PhoneFrame>
  );
}
