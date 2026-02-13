'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import AppLayout from '@/components/AppLayout'
import FinancialOverviewChart from '@/components/FinancialOverviewChart'
import DebtDistributionChart from '@/components/DebtDistributionChart'
import { CreditCard, Wallet, ArrowUpRight, ArrowDownRight, Clock, CalendarClock } from 'lucide-react'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import { useTranslation } from '@/lib/i18n'

export default function DashboardPage() {
  const { t, locale } = useTranslation()
  const { data: accData, isLoading: loadingAcc } = useSWR('/api/accounts', fetcher)
  const { data: transData, isLoading: loadingTrans } = useSWR('/api/transactions', fetcher)
  const { data: debtData, isLoading: loadingDebt } = useSWR('/api/debts', fetcher)
  const { data: recurringData, isLoading: loadingRecurring } = useSWR('/api/recurring-transactions', fetcher)

  const accounts = accData?.accounts || []
  const transactions = transData?.transactions || []
  const debts = debtData?.debts || []
  const recurringItems = recurringData?.recurring || []

  const totalBalance = useMemo(() => accounts.reduce((sum: number, acc: any) => sum + acc.balance, 0), [accounts])

  const recentAccounts = useMemo(() => [...accounts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4), [accounts])

  const income = useMemo(() => transactions
    .filter((t: any) => t.type === 'income')
    .reduce((sum: number, t: any) => sum + t.amount, 0), [transactions])

  const expenses = useMemo(() => transactions
    .filter((t: any) => t.type === 'expense')
    .reduce((sum: number, t: any) => sum + t.amount, 0), [transactions])

  const totalDebt = useMemo(() => debts.reduce((sum: number, d: any) => sum + d.totalAmount, 0), [debts])

  const debtDistributionData = useMemo(() => {
    const map = new Map<string, number>()
    debts.forEach((d: any) => {
      const current = map.get(d.category?.name || t('dashboard.uncategorized')) || 0
      map.set(d.category?.name || t('dashboard.uncategorized'), current + d.totalAmount)
    })
    return Array.from(map.entries()).map(([categoryName, amount]) => ({ categoryName, amount }))
  }, [debts, t])

  const upcomingPayments = useMemo(() => {
    const now = new Date()
    const items: Array<{
      id: string; name: string; amount: number; dueDate: Date
      type: 'debt' | 'recurring'; urgency: 'overdue' | 'urgent' | 'upcoming' | 'normal'
    }> = []

    debts.forEach((d: any) => {
      if (d.dueDate && d.remainingAmount > 0) {
        const due = new Date(d.dueDate)
        const daysUntil = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        let urgency: 'overdue' | 'urgent' | 'upcoming' | 'normal' = 'normal'
        if (daysUntil < 0) urgency = 'overdue'
        else if (daysUntil <= 7) urgency = 'urgent'
        else if (daysUntil <= 30) urgency = 'upcoming'
        items.push({ id: d.id, name: d.name, amount: d.remainingAmount, dueDate: due, type: 'debt', urgency })
      }
    })

    recurringItems.forEach((r: any) => {
      if (r.isActive && r.type === 'expense') {
        const next = new Date(r.nextExecutionDate)
        const daysUntil = Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        let urgency: 'overdue' | 'urgent' | 'upcoming' | 'normal' = 'normal'
        if (daysUntil < 0) urgency = 'overdue'
        else if (daysUntil <= 7) urgency = 'urgent'
        else if (daysUntil <= 30) urgency = 'upcoming'
        items.push({ id: r.id, name: r.description || 'Recurring', amount: r.amount, dueDate: next, type: 'recurring', urgency })
      }
    })

    return items.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()).slice(0, 8)
  }, [debts, recurringItems])

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat(locale === 'es' ? 'es-CO' : 'en-US', { style: 'currency', currency: 'USD' }).format(balance)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(locale === 'es' ? 'es-CO' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const getUrgencyStyles = (urgency: string) => {
    switch (urgency) {
      case 'overdue': return { bg: 'bg-red-50 border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-700', label: t('urgency.overdue') }
      case 'urgent': return { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700', label: t('urgency.urgent') }
      case 'upcoming': return { bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-100 text-yellow-700', label: t('urgency.upcoming') }
      default: return { bg: 'bg-white border-gray-200', text: 'text-gray-600', badge: 'bg-gray-100 text-gray-600', label: '' }
    }
  }

  const isLoading = loadingAcc || loadingTrans || loadingDebt || loadingRecurring

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t('dashboard.title')}</h1>
        <p className="text-gray-500 mt-2 text-lg">{t('dashboard.subtitle')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-base font-medium text-gray-500">{t('dashboard.totalBalance')}</span>
            <Wallet className="w-6 h-6 text-gray-900" />
          </div>
          <p className="text-4xl font-bold text-gray-900 tracking-tight">
            {isLoading ? '...' : formatBalance(totalBalance)}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-base font-medium text-gray-500">{t('dashboard.income')}</span>
            <ArrowUpRight className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600 tracking-tight">
            {isLoading ? '...' : formatBalance(income)}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-base font-medium text-gray-500">{t('dashboard.expenses')}</span>
            <ArrowDownRight className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-600 tracking-tight">
            {isLoading ? '...' : formatBalance(expenses)}
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-base font-medium text-gray-500">{t('dashboard.totalDebt')}</span>
            <CreditCard className="w-6 h-6 text-gray-900" />
          </div>
          <p className="text-3xl font-bold text-gray-900 tracking-tight">
            {isLoading ? '...' : formatBalance(totalDebt)}
          </p>
        </div>
      </div>

      {/* Upcoming Payments */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-gray-900" />
            <h3 className="font-bold text-lg text-gray-900">{t('dashboard.upcomingPayments')}</h3>
          </div>
          <Link href="/debts" className="text-base text-gray-600 hover:text-black font-medium border-b border-transparent hover:border-black transition-colors">
            {t('dashboard.viewDebts')}
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          </div>
        ) : upcomingPayments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-base">{t('dashboard.noUpcoming')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingPayments.map((payment) => {
              const styles = getUrgencyStyles(payment.urgency)
              return (
                <div key={`${payment.type}-${payment.id}`} className={`flex items-center justify-between p-4 rounded-lg border ${styles.bg} transition-colors`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${payment.urgency === 'overdue' ? 'bg-red-100' : payment.urgency === 'urgent' ? 'bg-orange-100' : 'bg-gray-100'}`}>
                      {payment.type === 'debt' ? (
                        <CreditCard className={`w-4 h-4 ${styles.text}`} />
                      ) : (
                        <Clock className={`w-4 h-4 ${styles.text}`} />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{payment.name}</p>
                      <p className={`text-sm ${styles.text}`}>
                        {payment.type === 'debt' ? t('dashboard.debt') : t('dashboard.recurring')} · {formatDate(payment.dueDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {styles.label && (
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${styles.badge}`}>
                        {styles.label}
                      </span>
                    )}
                    <p className="font-bold text-gray-900 text-lg">{formatBalance(payment.amount)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="font-bold text-lg text-gray-900 mb-6">{t('dashboard.cashFlow')}</h3>
          <div className="h-64">
            <FinancialOverviewChart income={income} expenses={expenses} />
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h3 className="font-bold text-lg text-gray-900 mb-6">{t('dashboard.debtDistribution')}</h3>
          <div className="h-64">
            <DebtDistributionChart data={debtDistributionData} />
          </div>
        </div>
      </div>

      {/* Accounts */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg text-gray-900">{t('dashboard.yourAccounts')}</h3>
          <Link href="/accounts" className="text-base text-gray-600 hover:text-black font-medium border-b border-transparent hover:border-black transition-colors">
            {t('dashboard.viewAll')}
          </Link>
        </div>

        {isLoading && accounts.length === 0 ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          </div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4 text-base">{t('dashboard.noAccounts')}</p>
            <Link href="/accounts" className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors">
              <Wallet className="w-5 h-5" />
              {t('dashboard.createFirst')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentAccounts.map((account: any) => (
              <Link key={account.id} href="/accounts" className="p-6 bg-white rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 group">
                <p className="font-medium text-gray-600 text-base mb-2 group-hover:text-black">{account.name}</p>
                <p className="text-2xl font-bold text-gray-900">{formatBalance(account.balance)}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
