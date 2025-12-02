import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import db from "@/lib/db"


if (!process.env.NEXT_PUBLIC_APP_URL) {
    throw new Error('NEXT_PUBLIC_APP_URL is not set in .env file');
}
if (!process.env.BETTER_AUTH_SECRET) {
    throw new Error('BETTER_AUTH_SECRET is not set in .env file');
}
if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error('GOOGLE_CLIENT_ID is not set in .env file');
}
if (!process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error('GOOGLE_CLIENT_SECRET is not set in .env file');
}
if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set in .env file');
}


export const auth = betterAuth({
    database: prismaAdapter(db, {
        provider: "postgresql"
    }),
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
        }
    },
    secret: process.env.BETTER_AUTH_SECRET!,
    baseURL: process.env.NEXT_PUBLIC_APP_URL!,
    trustedOrigins: (
        process.env.TRUSTED_ORIGINS ||
        `${process.env.NEXT_PUBLIC_APP_URL}`
    ).split(/,\s*/).filter(Boolean),
    emailAndPassword: {
        enabled: true
    }
})