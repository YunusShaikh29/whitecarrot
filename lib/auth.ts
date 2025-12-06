import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import db from "@/lib/db"

const requiredEnvVars = {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
};

const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

if (missingVars.length > 0) {
    console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';
const trustedOriginsList = process.env.TRUSTED_ORIGINS 
    ? process.env.TRUSTED_ORIGINS.split(/,\s*/).filter(Boolean)
    : [baseUrl].filter(Boolean);

export const auth = betterAuth({
    database: prismaAdapter(db, {
        provider: "postgresql"
    }),
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        }
    },
    secret: process.env.BETTER_AUTH_SECRET || '',
    baseURL: baseUrl,
    trustedOrigins: trustedOriginsList,
    emailAndPassword: {
        enabled: true
    }
})