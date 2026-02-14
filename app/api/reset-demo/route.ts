
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getSharedUserIds } from '@/lib/user-utils'

// DEMO DATA GENERATOR
// Danger: DELETES ALL DATA for the user and seeds example scenario

export async function POST(request: NextRequest) {
    try {
        const session = await getSession()
        if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

        const userId = session
        console.log(`RESETTING DEMO DATA FOR USER: ${userId}`)

        // 1. Clean up existing data (Transactional delete to avoid constraint errors)
        // Order matters due to foreign keys
        // Transactions -> Recurring -> Accounts -> Debts -> Categories
        await prisma.$transaction(async (tx) => {
            await tx.transaction.deleteMany({ where: { userId } })
            await tx.recurringTransaction.deleteMany({ where: { userId } })
            await tx.debt.deleteMany({ where: { userId } })
            await tx.account.deleteMany({ where: { userId } })
            await tx.debtCategory.deleteMany({ where: { userId } })
        })

        // 2. Create Categories
        const catProperty = await prisma.debtCategory.create({ data: { name: 'Propiedades', userId } })
        const catVehicle = await prisma.debtCategory.create({ data: { name: 'Vehículos', userId } })

        // 3. Create Main Account
        const mainAccount = await prisma.account.create({
            data: {
                name: 'Banco Principal',
                balance: 15_000,
                userId
            }
        })

        // 4. Create 3 Houses (Debts)
        const houses = [
            { name: 'Casa Playa', amount: 250_000, installments: 120, payment: 2_500, rent: 1_800 },
            { name: 'Casa Ciudad', amount: 180_000, installments: 120, payment: 1_900, rent: 2_100 },
            { name: 'Casa Campo', amount: 120_000, installments: 60, payment: 2_200, rent: 0 } // No rent for this one
        ]

        for (const house of houses) {
            const debt = await prisma.debt.create({
                data: {
                    name: house.name,
                    totalAmount: house.amount,
                    totalInstallments: house.installments,
                    categoryId: catProperty.id,
                    userId,
                    dueDate: new Date(new Date().setFullYear(new Date().getFullYear() + 10))
                }
            })

            // Recurring Expense (Mortgage Payment)
            await prisma.recurringTransaction.create({
                data: {
                    type: 'expense',
                    amount: house.payment,
                    description: `Hipoteca ${house.name}`,
                    frequency: 'monthly',
                    accountId: mainAccount.id,
                    userId,
                    debtId: debt.id,
                    nextExecutionDate: new Date()
                }
            })

            // Recurring Income (Rent Received) - if applicable
            if (house.rent > 0) {
                await prisma.recurringTransaction.create({
                    data: {
                        type: 'income',
                        amount: house.rent,
                        description: `Arriendo ${house.name}`,
                        frequency: 'monthly',
                        accountId: mainAccount.id,
                        userId,
                        debtId: debt.id,
                        nextExecutionDate: new Date()
                    }
                })
            }

            // Simulate some paid installments (e.g. 5)
            for (let i = 0; i < 5; i++) {
                await prisma.transaction.create({
                    data: {
                        type: 'expense',
                        amount: house.payment,
                        description: `Hipoteca ${house.name} (Cuota ${i + 1})`,
                        accountId: mainAccount.id,
                        userId,
                        debtId: debt.id,
                        createdAt: new Date(new Date().setMonth(new Date().getMonth() - i - 1))
                    }
                })
                // Also income if applicable
                if (house.rent > 0) {
                    await prisma.transaction.create({
                        data: {
                            type: 'income',
                            amount: house.rent,
                            description: `Arriendo ${house.name} (Mes ${i + 1})`,
                            accountId: mainAccount.id,
                            userId,
                            debtId: debt.id, // Linked to debt to track net cost history? Mostly for monthly calculation
                            createdAt: new Date(new Date().setMonth(new Date().getMonth() - i - 1))
                        }
                    })
                }
            }
        }

        // 5. Create 3 Cars (Debts)
        const cars = [
            { name: 'Toyota Fortuner', amount: 55_000, installments: 48, payment: 1_200 },
            { name: 'Mazda CX-30', amount: 32_000, installments: 60, payment: 550 },
            { name: 'Ford Ranger', amount: 48_000, installments: 36, payment: 1_500 }
        ]

        for (const car of cars) {
            const debt = await prisma.debt.create({
                data: {
                    name: car.name,
                    totalAmount: car.amount,
                    totalInstallments: car.installments,
                    categoryId: catVehicle.id,
                    userId,
                    dueDate: new Date(new Date().setFullYear(new Date().getFullYear() + 4))
                }
            })

            // Recurring Expense (Car Loan)
            await prisma.recurringTransaction.create({
                data: {
                    type: 'expense',
                    amount: car.payment,
                    description: `Crédito ${car.name}`,
                    frequency: 'monthly',
                    accountId: mainAccount.id,
                    userId,
                    debtId: debt.id,
                    nextExecutionDate: new Date()
                }
            })

            // Simulate some paid installments (e.g. 2)
            for (let i = 0; i < 2; i++) {
                await prisma.transaction.create({
                    data: {
                        type: 'expense',
                        amount: car.payment,
                        description: `Crédito ${car.name} (Cuota ${i + 1})`,
                        accountId: mainAccount.id,
                        userId,
                        debtId: debt.id,
                        createdAt: new Date(new Date().setMonth(new Date().getMonth() - i - 1))
                    }
                })
            }
        }

        return NextResponse.json({ success: true, message: 'Demo data seeded!' })

    } catch (error: any) {
        console.error('Error resetting demo:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
