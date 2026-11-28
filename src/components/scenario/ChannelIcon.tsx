import {
  BriefcaseBusiness,
  Camera,
  Inbox,
  IndianRupee,
  Mail,
  MessageCircle,
  MessageSquareText,
  Phone,
  type LucideProps,
} from "lucide-react";
import { TelegramGlyph } from "@/shells/telegram/brand";
import type { Channel } from "./channels";

/** Telegram's logo, in one colour so it fits the tile like the line icons. */
function TelegramIcon({ className }: LucideProps) {
  return <TelegramGlyph className={className} />;
}

/** Generic icons, except Telegram's logo (used with permission). */
const ICONS = {
  whatsapp: MessageCircle,
  telegram: TelegramIcon,
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
