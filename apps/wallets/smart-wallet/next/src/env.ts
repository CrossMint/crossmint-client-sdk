import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    client: {
        NEXT_PUBLIC_BASE_URL: z.string().optional(),
        NEXT_PUBLIC_CROSSMINT_API_KEY_PROD: z.string().optional(),
        NEXT_PUBLIC_CROSSMINT_API_KEY_STG: z.string().min(1),
        NEXT_PUBLIC_FIREBASE_API_KEY: z.string().min(1),
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().min(1),
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().min(1),
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1),
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
        NEXT_PUBLIC_FIREBASE_APP_ID: z.string().min(1),
        NEXT_PUBLIC_WEB3_AUTH_CLIENT_ID_PROD: z.string().optional(),
        NEXT_PUBLIC_WEB3_AUTH_CLIENT_ID_STG: z.string().min(1),
        NEXT_PUBLIC_WEB3_AUTH_NETWORK_PROD: z.string().optional(),
        NEXT_PUBLIC_WEB3_AUTH_NETWORK_STG: z.string().min(1),
        NEXT_PUBLIC_WEB3_AUTH_VERIFIER_ID_PROD: z.string().optional(),
        NEXT_PUBLIC_WEB3_AUTH_VERIFIER_ID_STG: z.string().min(1),
    },
    // For Next.js >= 13.4.4, you only need to destructure client variables:
    experimental__runtimeEnv: {
        NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
        NEXT_PUBLIC_CROSSMINT_API_KEY_PROD: process.env.NEXT_PUBLIC_CROSSMINT_API_KEY_PROD,
        NEXT_PUBLIC_CROSSMINT_API_KEY_STG: process.env.NEXT_PUBLIC_CROSSMINT_API_KEY_STG,
        NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        NEXT_PUBLIC_WEB3_AUTH_CLIENT_ID_PROD: process.env.NEXT_PUBLIC_WEB3_AUTH_CLIENT_ID_PROD,
        NEXT_PUBLIC_WEB3_AUTH_CLIENT_ID_STG: process.env.NEXT_PUBLIC_WEB3_AUTH_CLIENT_ID_STG,
        NEXT_PUBLIC_WEB3_AUTH_NETWORK_PROD: process.env.NEXT_PUBLIC_WEB3_AUTH_NETWORK_PROD,
        NEXT_PUBLIC_WEB3_AUTH_NETWORK_STG: process.env.NEXT_PUBLIC_WEB3_AUTH_NETWORK_STG,
        NEXT_PUBLIC_WEB3_AUTH_VERIFIER_ID_PROD: process.env.NEXT_PUBLIC_WEB3_AUTH_VERIFIER_ID_PROD,
        NEXT_PUBLIC_WEB3_AUTH_VERIFIER_ID_STG: process.env.NEXT_PUBLIC_WEB3_AUTH_VERIFIER_ID_STG,
    },
});
