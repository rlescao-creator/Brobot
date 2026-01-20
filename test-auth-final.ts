import "dotenv/config";
import prisma from "./src/lib/db";
import bcrypt from "bcryptjs";

async function test() {
    console.log("Starting diagnostic test...");
    const email = "test_auth_" + Date.now() + "@example.com";
    const password = "password123";

    try {
        console.log("1. Testing bcrypt...");
        const hash = await bcrypt.hash(password, 10);
        console.log("Bcrypt hash successful:", hash);

        console.log("2. Testing Prisma...");
        const user = await prisma.user.create({
            data: {
                email,
                password: hash,
            },
        });
        console.log("Prisma create successful:", user.id);

        console.log("3. Testing Prisma find...");
        const found = await prisma.user.findUnique({ where: { email } });
        console.log("Prisma find successful:", found?.email);

        console.log("4. Testing bcrypt compare...");
        const match = await bcrypt.compare(password, found!.password);
        console.log("Bcrypt compare successful:", match);

        console.log("Diagnostic test PASSED");
    } catch (error: any) {
        console.error("Diagnostic test FAILED:", error);
    } finally {
        await prisma.$disconnect();
    }
}

test();
