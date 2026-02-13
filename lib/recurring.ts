import { prisma } from './prisma'

/**
 * Processes all active recurring transactions for a user that are due.
 * Includes idempotency guard to prevent duplicate transactions.
 */
export async function processRecurringTransactions(userId: string) {
    const now = new Date()

    try {
        const recurring = await (prisma as any).recurringTransaction.findMany({
            where: {
                userId,
                isActive: true,
                nextExecutionDate: {
                    lte: now,
                },
            },
        })

        for (const template of recurring) {
            try {
                // Idempotency guard: check if a transaction was already created
                // for this recurring template at this execution date
                const existingTransaction = await prisma.transaction.findFirst({
                    where: {
                        userId: template.userId,
                        accountId: template.accountId,
                        description: `${template.description} (Recurrente)`,
                        createdAt: template.nextExecutionDate,
                    },
                })

                if (existingTransaction) {
                    // Transaction already exists, just advance the date
                    let nextDate = new Date(template.nextExecutionDate)
                    switch (template.frequency) {
                        case 'daily': nextDate.setDate(nextDate.getDate() + 1); break
                        case 'weekly': nextDate.setDate(nextDate.getDate() + 7); break
                        case 'monthly': nextDate.setMonth(nextDate.getMonth() + 1); break
                        case 'yearly': nextDate.setFullYear(nextDate.getFullYear() + 1); break
                    }

                    let isActive = true
                    if (template.endDate && nextDate > template.endDate) {
                        isActive = false
                    }

                    await (prisma as any).recurringTransaction.update({
                        where: { id: template.id },
                        data: {
                            lastExecuted: now,
                            nextExecutionDate: nextDate,
                            isActive
                        },
                    })
                    console.log(`Skipped duplicate for recurring ${template.id}`)
                    continue
                }

                await prisma.$transaction(async (tx) => {
                    // 1. Create the real transaction
                    await tx.transaction.create({
                        data: {
                            type: template.type,
                            amount: template.amount,
                            description: `${template.description} (Recurrente)`,
                            accountId: template.accountId,
                            userId: template.userId,
                            debtId: template.debtId,
                            createdAt: template.nextExecutionDate,
                        },
                    })

                    // 2. Update account balance
                    const balanceChange = template.type === 'income' ? template.amount : -template.amount
                    await tx.account.update({
                        where: { id: template.accountId },
                        data: { balance: { increment: balanceChange } },
                    })

                    // 3. Calculate next execution date
                    let nextDate = new Date(template.nextExecutionDate)
                    switch (template.frequency) {
                        case 'daily': nextDate.setDate(nextDate.getDate() + 1); break
                        case 'weekly': nextDate.setDate(nextDate.getDate() + 7); break
                        case 'monthly': nextDate.setMonth(nextDate.getMonth() + 1); break
                        case 'yearly': nextDate.setFullYear(nextDate.getFullYear() + 1); break
                    }

                    // 4. Update the recurring template
                    let isActive = true
                    if (template.endDate && nextDate > template.endDate) {
                        isActive = false
                    }

                    await (tx as any).recurringTransaction.update({
                        where: { id: template.id },
                        data: {
                            lastExecuted: now,
                            nextExecutionDate: nextDate,
                            isActive
                        },
                    })
                })
            } catch (innerError) {
                console.error(`Error processing recurring template ${template.id}:`, innerError)
            }
        }
    } catch (error) {
        console.error('CRITICAL: Error in processRecurringTransactions:', error)
    }
}

