import { prisma } from './prisma'

/**
 * Gets all user IDs that belong to the same group as the given userId.
 * If the user has no groupId, it returns only the given userId in an array.
 * @param userId - The ID of the current user
 * @returns An array of user IDs in the same group
 */
export async function getSharedUserIds(userId: string): Promise<string[]> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { groupId: true }
    })

    if (!user?.groupId) {
        return [userId]
    }

    const sharedUsers = await prisma.user.findMany({
        where: { groupId: user.groupId },
        select: { id: true }
    })

    return sharedUsers.map(u => u.id)
}
