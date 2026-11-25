import {
  BriefcaseBusiness,
  Camera,
  Inbox,
  IndianRupee,
  Mail,
  MessageCircle,
  MessageSquareText,
  Phone,
  Send,
  type LucideProps,
} from "lucide-react";
import type { Channel } from "./channels";

/** Generic icons only: no real app logos. */
const ICONS = {
  whatsapp: MessageCircle,
  telegram: Send,
  instagram: Camera,
  linkedin: BriefcaseBusiness,
  sms: MessageSquareText,
  upi: IndianRupee,
  call: Phone,
  gmail: Mail,
  inbox: Inbox,
} satisfies Record<Channel, unknown>;

export function ChannelIcon({ channel, ...props }: { channel: Channel } & LucideProps) {
  const Icon = ICONS[channel];
  return <Icon {...props} />;
}
