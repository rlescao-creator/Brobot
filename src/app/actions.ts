"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function signUp(email: string, password: string) {
    console.log("Server: signUp attempt for", email);
    console.log("Server: DATABASE_URL starts with", process.env.DATABASE_URL?.substring(0, 10));

    try {
        console.log("Server: Hashing password...");
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("Server: Password hashed.");

        console.log("Server: Creating user in DB...");
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
            },
        });
        console.log("Server: User created successfully:", user.id);
        return { success: true, user: { id: user.id, email: user.email } };
    } catch (error: any) {
        console.error("Server: Sign up error details:", error);
        if (error.code === 'P2002') {
            return { success: false, error: "Email already exists" };
        }
        return { success: false, error: `Database error: ${error.message || "Unknown"}` };
    }
}

export async function login(email: string, password: string) {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        return { success: false, error: "Invalid email or password" };
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
        return { success: false, error: "Invalid email or password" };
    }

    return { success: true, user: { id: user.id, email: user.email } };
}

export async function getGoals(userId: string) {
    return await prisma.goal.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            text: true,
            deadline: true,
            completed: true,
            completedAt: true,
            failed: true,
            createdAt: true,
            userId: true,
        },
    });
}

export async function addGoals(userId: string, goals: { text: string; deadline?: string }[]) {
    await prisma.goal.createMany({
        data: goals.map((g) => ({
            text: g.text,
            deadline: g.deadline,
            completed: false,
            userId,
        })),
    });
    revalidatePath("/");
}

export async function toggleGoal(id: string, completed: boolean) {
    await prisma.goal.update({
        where: { id },
        data: { 
            completed,
            completedAt: completed ? new Date() : null
        },
    });
    revalidatePath("/");
}

export async function markGoalFailed(id: string) {
    await prisma.goal.update({
        where: { id },
        data: { 
            failed: true,
            completed: false
        },
    });
    revalidatePath("/");
}

export async function deleteGoal(id: string) {
    await prisma.goal.delete({
        where: { id },
    });
    revalidatePath("/");
}

// Conversation actions
export async function createConversation(userId: string, title: string) {
    const conversation = await prisma.conversation.create({
        data: {
            userId,
            title,
        },
    });
    revalidatePath("/");
    return conversation;
}

export async function getConversations(userId: string) {
    return await prisma.conversation.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        select: {
            id: true,
            title: true,
            createdAt: true,
            updatedAt: true,
        },
    });
}

export async function getConversation(id: string) {
    return await prisma.conversation.findUnique({
        where: { id },
        include: {
            messages: {
                orderBy: { createdAt: "asc" },
            },
        },
    });
}

export async function saveMessage(conversationId: string, role: string, content: string, image?: string) {
    await prisma.message.create({
        data: {
            conversationId,
            role,
            content,
            image,
        },
    });
    
    // Update conversation updatedAt
    await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
    });
    
    revalidatePath("/");
}

export async function deleteConversation(id: string) {
    await prisma.conversation.delete({
        where: { id },
    });
    revalidatePath("/");
}

export async function updateConversationTitle(id: string, title: string) {
    await prisma.conversation.update({
        where: { id },
        data: { title },
    });
    revalidatePath("/");
}
