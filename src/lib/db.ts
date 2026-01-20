import { PrismaClient } from '@prisma/client'

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
    throw new Error(
        'DATABASE_URL is not set in environment variables. ' +
        'Please set it in Vercel Settings → Environment Variables for all environments.'
    )
}

const prismaClientSingleton = () => {
    return new PrismaClient()
}

declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma
