'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import AppLayout from '@/components/AppLayout'
import FinancialOverviewChart from '@/components/FinancialOverviewChart'
import DebtDistributionChart from '@/components/DebtDistributionChart'
import { TrendingUp, TrendingDown, Landmark, Receipt, Clock, CalendarClock, ArrowRight } from 'lucide-react'
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      currencyDisplay: 'narrowSymbol',
      maximumFractionDigits: 0
    }).format(balance)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(locale === 'es' ? 'es-CO' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const getUrgencyStyles = (urgency: string) => {
    switch (urgency) {
      case 'overdue': return { bg: 'bg-red-50 border-red-200', text: 'text-red-600', badge: 'bg-red-100 text-red-700', label: t('urgency.overdue'), dot: 'bg-red-500' }
      case 'urgent': return { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-600', badge: 'bg-amber-100 text-amber-700', label: t('urgency.urgent'), dot: 'bg-amber-500' }
      case 'upcoming': return { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-600', badge: 'bg-blue-100 text-blue-700', label: t('urgency.upcoming'), dot: 'bg-blue-500' }
      default: return { bg: 'bg-white border-gray-200', text: 'text-gray-500', badge: 'bg-gray-100 text-gray-600', label: '', dot: 'bg-gray-400' }
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Total Balance */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{t('dashboard.totalBalance')}</span>
            <div className="icon-blue p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
              <Landmark className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight truncate" title={formatBalance(totalBalance)}>
            {isLoading ? '...' : formatBalance(totalBalance)}
          </p>
        </div>

        {/* Income */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{t('dashboard.income')}</span>
            <div className="icon-emerald p-2.5 rounded-xl shadow-lg shadow-emerald-500/20">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-xl md:text-2xl font-extrabold text-emerald-600 tracking-tight truncate" title={formatBalance(income)}>
            {isLoading ? '...' : formatBalance(income)}
          </p>
        </div>

        {/* Expenses */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{t('dashboard.expenses')}</span>
            <div className="icon-rose p-2.5 rounded-xl shadow-lg shadow-rose-500/20">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-xl md:text-2xl font-extrabold text-rose-600 tracking-tight truncate" title={formatBalance(expenses)}>
            {isLoading ? '...' : formatBalance(expenses)}
          </p>
        </div>

        {/* Total Debt */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{t('dashboard.totalDebt')}</span>
            <div className="icon-amber p-2.5 rounded-xl shadow-lg shadow-amber-500/20">
              <Receipt className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight truncate" title={formatBalance(totalDebt)}>
            {isLoading ? '...' : formatBalance(totalDebt)}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-bold text-lg text-gray-900 mb-6">{t('dashboard.cashFlow')}</h3>
          <div className="h-64">
            <FinancialOverviewChart income={income} expenses={expenses} />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-bold text-lg text-gray-900 mb-6">{t('dashboard.debtDistribution')}</h3>
          <div className="h-64">
            <DebtDistributionChart data={debtDistributionData} />
          </div>
        </div>
      </div>

      {/* Bottom Row: Upcoming Payments + Accounts side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Payments — compact */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-base text-gray-900">{t('dashboard.upcomingPayments')}</h3>
            </div>
            <Link href="/recurring" className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition-colors">
              {t('dashboard.viewDebts')} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            </div>
          ) : upcomingPayments.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-400 text-sm">{t('dashboard.noUpcoming')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingPayments.slice(0, 4).map((payment) => {
                const styles = getUrgencyStyles(payment.urgency)
                return (
                  <div key={`${payment.type}-${payment.id}`} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-2 h-2 rounded-full ${styles.dot} shrink-0`} />
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{payment.name}</p>
                        <p className={`text-xs ${styles.text}`}>{formatDate(payment.dueDate)}</p>
                      </div>
                    </div>
                    <p className="font-bold text-gray-900 text-sm shrink-0 ml-3">{formatBalance(payment.amount)}</p>
                  </div>
                )
              })}
              {upcomingPayments.length > 4 && (
                <Link href="/recurring" className="block text-center text-xs text-indigo-600 font-semibold pt-2 hover:text-indigo-800 transition-colors">
                  +{upcomingPayments.length - 4} más
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Accounts */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-gray-900">{t('dashboard.yourAccounts')}</h3>
            <Link href="/accounts" className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition-colors">
              {t('dashboard.viewAll')} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading && accounts.length === 0 ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-gray-400 mb-3 text-sm">{t('dashboard.noAccounts')}</p>
              <Link href="/accounts" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-sm shadow-lg shadow-indigo-500/20">
                <Landmark className="w-4 h-4" />
                {t('dashboard.createFirst')}
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {recentAccounts.map((account: any) => (
                <Link key={account.id} href="/accounts" className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-gray-50 transition-colors group">
                  <p className="font-medium text-gray-500 text-sm group-hover:text-indigo-600 transition-colors">{account.name}</p>
                  <p className="text-lg font-bold text-gray-900">{formatBalance(account.balance)}</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
