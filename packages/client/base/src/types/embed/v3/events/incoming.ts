import { z } from "zod";

export const embeddedCheckoutV3IncomingEvents = {
    "ui:height.changed": z.object({
        height: z.number(),
    }),
    "crypto:connect-wallet.show": z.object({
        show: z.boolean(),
    }),
    "crypto:send-transaction": z.object({
        chain: z.string(),
        serializedTransaction: z.string(),
    }),
};
export type EmbeddedCheckoutV3IncomingEventMap = typeof embeddedCheckoutV3IncomingEvents;
