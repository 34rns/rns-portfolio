import { site } from "@/content/site";
import { formatPrice } from "@/lib/projects/view";
import type { OrderRecord } from "./store";

export type MessageChannel = "whatsapp" | "telegram" | "email";

export const MESSAGE_CHANNELS: { id: MessageChannel; label: string }[] = [
  { id: "whatsapp", label: "WhatsApp" },
  { id: "telegram", label: "Telegram" },
  { id: "email", label: "Email" },
];

export function isMessageChannel(value: string): value is MessageChannel {
  return MESSAGE_CHANNELS.some((channel) => channel.id === value);
}

/** Short, ordered and the same in every client. */
export function buildInstallSteps(projectTitle: string): string[] {
  return [
    `Open ${projectTitle} and go to Settings → License.`,
    "Paste the key exactly as it is, dashes included.",
    "Press Activate. The app verifies the key online once and stores a signed token.",
    "After that it keeps working offline for 7 days at a time and re-checks in the background.",
  ];
}

/**
 * The message an admin sends by hand. Channels differ only in greeting and
 * length, so the key, the amount and the order link are always the same text —
 * a buyer reading a WhatsApp message and an email sees one story.
 */
export function buildOrderMessage({
  channel,
  order,
  projectTitle,
  key,
  orderUrl,
}: {
  channel: MessageChannel;
  order: OrderRecord;
  projectTitle: string;
  key: string | null;
  orderUrl: string;
}): { subject: string | null; body: string } {
  const firstName = order.name.split(" ")[0] || order.name;
  const amount =
    order.amountCents != null ? formatPrice(order.amountCents, order.currency) : null;

  const lines: string[] = [];

  if (channel === "email") {
    lines.push(`Hi ${firstName},`);
    lines.push("");
    lines.push(
      `Thanks for the request for ${projectTitle}. ${
        amount ? `We agreed on ${amount}.` : "Your request is confirmed."
      }`,
    );
  } else {
    lines.push(`Hi ${firstName} — ${site.name} here.`);
    lines.push(
      amount
        ? `Confirmed: ${projectTitle} for ${amount}.`
        : `Confirmed: ${projectTitle}.`,
    );
  }

  lines.push("");
  lines.push(key ? `Your license key: ${key}` : "Your license key follows once payment clears.");
  lines.push("");

  if (key) {
    lines.push("How to activate it:");
    buildInstallSteps(projectTitle).forEach((step, index) => {
      lines.push(`${index + 1}. ${step}`);
    });
    lines.push("");
  }

  lines.push(`Your private order page: ${orderUrl}`);
  lines.push("Keep that link — it shows your order status and your key if you lose it.");

  if (channel === "email") {
    lines.push("");
    lines.push(`— ${site.name}`);
    return {
      subject: `Your ${projectTitle} license key`,
      body: lines.join("\n"),
    };
  }

  lines.push("");
  lines.push(`— ${site.name}`);
  return { subject: null, body: lines.join("\n") };
}
