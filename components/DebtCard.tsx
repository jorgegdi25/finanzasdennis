'use client'

import { useTranslation } from '@/lib/i18n'
import { ArrowDown, ArrowUp, Minus } from 'lucide-react'

interface LinkedRecurring {
    id: string
    type: string
    amount: number
    description: string | null
    frequency: string
}

interface Debt {
    id: string
    name: string
    totalAmount: number
    paidAmount: number
    remainingAmount: number
    dueDate: string | null
    monthlyPayment?: number
    monthlyIncome?: number
    monthlyNetCost?: number
    totalInstallments?: number
    paidInstallments?: number
    linkedRecurring?: LinkedRecurring[]
    categoryId: string
    category: { id: string; name: string }
}

interface DebtCardProps {
    debt: Debt
    onDelete?: (id: string) => void
    onEdit?: (debt: Debt) => void
}

export default function DebtCard({ debt, onDelete, onEdit }: DebtCardProps) {
    const { t, locale } = useTranslation()
    const progress = Math.min(100, (debt.paidAmount / debt.totalAmount) * 100)

    const hasLinkedRecurring = (debt.linkedRecurring?.length ?? 0) > 0
    const monthlyPayment = debt.monthlyPayment ?? 0
    const monthlyIncome = debt.monthlyIncome ?? 0
    const monthlyNetCost = debt.monthlyNetCost ?? 0

    // Urgency calculation
    const now = new Date()
    let urgency: 'overdue' | 'urgent' | 'upcoming' | 'normal' = 'normal'
    let daysUntilDue: number | null = null

    if (debt.dueDate) {
        const due = new Date(debt.dueDate)
        daysUntilDue = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        if (debt.remainingAmount > 0) {
            if (daysUntilDue < 0) urgency = 'overdue'
            else if (daysUntilDue <= 7) urgency = 'urgent'
            else if (daysUntilDue <= 30) urgency = 'upcoming'
        }
    }

    const urgencyStyles = {
        overdue: { border: 'border-red-300 ring-1 ring-red-200', badge: 'bg-red-100 text-red-700', label: t('urgency.overdue') },
        urgent: { border: 'border-orange-300 ring-1 ring-orange-200', badge: 'bg-orange-100 text-orange-700', label: t('urgency.urgent') },
        upcoming: { border: 'border-yellow-300 ring-1 ring-yellow-200', badge: 'bg-yellow-100 text-yellow-700', label: t('urgency.upcoming') },
        normal: { border: 'border-gray-100', badge: '', label: '' },
    }

    const styles = urgencyStyles[urgency]

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(locale === 'es' ? 'es-CO' : 'en-US', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        }).format(amount)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(locale === 'es' ? 'es-CO' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    }

    return (
        <div className={`bg-white rounded-xl shadow-sm border ${styles.border} p-6 hover:shadow-md transition-shadow`}>
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-600">
                            {debt.category.name}
                        </span>
                        {styles.label && (
                            <span className={`inline-block px-2 py-1 text-xs font-bold rounded-full ${styles.badge}`}>
                                {styles.label}
                            </span>
                        )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{debt.name}</h3>
                    {debt.dueDate && (
                        <p className={`text-sm mt-1 ${urgency === 'overdue' ? 'text-red-600 font-medium' : urgency === 'urgent' ? 'text-orange-600 font-medium' : 'text-gray-500'}`}>
                            {urgency === 'overdue'
                                ? t('urgency.overdueAgo', { days: Math.abs(daysUntilDue!) })
                                : t('urgency.dueOn', { date: formatDate(debt.dueDate) })
                            }
                        </p>
                    )}
                </div>
                <div className="flex gap-1">
                    {onEdit && (
                        <button onClick={() => onEdit(debt)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title={t('accounts.editBtn')}>
                            ✏️
                        </button>
                    )}
                    {onDelete && (
                        <button onClick={() => onDelete(debt.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title={t('accounts.deleteBtn')}>
                            🗑️
                        </button>
                    )}
                </div>
            </div>

            {/* Monthly Breakdown — only when linked recurring items exist */}
            {hasLinkedRecurring && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-100">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                        {t('debts.monthlyBreakdown')}
                    </h4>
                    <div className="space-y-2">
                        {monthlyPayment > 0 && (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-1 bg-red-100 rounded">
                                        <ArrowUp className="w-3 h-3 text-red-600" />
                                    </div>
                                    <span className="text-sm text-gray-600">{t('debts.monthlyPayment')}</span>
                                </div>
                                <span className="text-sm font-bold text-red-600">{formatCurrency(monthlyPayment)}</span>
                            </div>
                        )}
                        {monthlyIncome > 0 && (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-1 bg-green-100 rounded">
                                        <ArrowDown className="w-3 h-3 text-green-600" />
                                    </div>
                                    <span className="text-sm text-gray-600">{t('debts.linkedIncome')}</span>
                                </div>
                                <span className="text-sm font-bold text-green-600">-{formatCurrency(monthlyIncome)}</span>
                            </div>
                        )}
                        {monthlyPayment > 0 && monthlyIncome > 0 && (
                            <>
                                <div className="border-t border-gray-200 my-1"></div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1 bg-indigo-100 rounded">
                                            <Minus className="w-3 h-3 text-indigo-600" />
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900">{t('debts.netCost')}</span>
                                    </div>
                                    <span className={`text-base font-black ${monthlyNetCost > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                        {formatCurrency(Math.abs(monthlyNetCost))}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Installments Progress */}
            {debt.totalInstallments && debt.totalInstallments > 0 && (
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            {t('debts.installmentProgress', {
                                current: Math.min((debt.paidInstallments || 0) + 1, debt.totalInstallments).toString(),
                                total: debt.totalInstallments.toString()
                            })}
                        </span>
                        <span className="text-xs text-indigo-600 font-medium">
                            {t('debts.installmentsLeft', { n: Math.max(0, debt.totalInstallments - (debt.paidInstallments || 0)).toString() })}
                        </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                            className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, ((debt.paidInstallments || 0) / debt.totalInstallments) * 100)}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {/* Progress Section */}
            <div className="space-y-4">
                {hasLinkedRecurring && (
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {t('debts.totalProgress')}
                    </h4>
                )}
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-sm text-gray-500">{t('debts.paid')}</p>
                        <p className="text-lg font-bold text-green-600">{formatCurrency(debt.paidAmount)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">{t('debts.total')}</p>
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(debt.totalAmount)}</p>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                        <span className="text-xs font-semibold inline-block text-indigo-600">
                            {t('debts.completed', { pct: progress.toFixed(0) })}
                        </span>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-100">
                        <div style={{ width: `${progress}%` }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500 transition-all duration-500"></div>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-50">
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">{t('debts.pending')}</p>
                    <p className="text-xl font-black text-red-500">{formatCurrency(debt.remainingAmount)}</p>
                </div>
            </div>
        </div>
    )
}
