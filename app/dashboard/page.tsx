'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import AppLayout from '@/components/AppLayout'
import FinancialOverviewChart from '@/components/FinancialOverviewChart'
import DebtDistributionChart from '@/components/DebtDistributionChart'
import { TrendingUp, CreditCard, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'

export default function DashboardPage() {
  const { data: accData, isLoading: loadingAcc } = useSWR('/api/accounts', fetcher)
  const { data: transData, isLoading: loadingTrans } = useSWR('/api/transactions', fetcher)
  const { data: debtData, isLoading: loadingDebt } = useSWR('/api/debts', fetcher)

  const accounts = accData?.accounts || []
  const transactions = transData?.transactions || []
  const debts = debtData?.debts || []

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
      const current = map.get(d.category?.name || 'Uncategorized') || 0
      map.set(d.category?.name || 'Uncategorized', current + d.totalAmount)
    })
    return Array.from(map.entries()).map(([categoryName, amount]) => ({ categoryName, amount }))
  }, [debts])

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(balance)
  }

  const isLoading = loadingAcc || loadingTrans || loadingDebt

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-gray-500 mt-2 text-lg">Overview of your financial situation</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Balance */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-base font-medium text-gray-500">Total Balance</span>
            <Wallet className="w-6 h-6 text-gray-900" />
          </div>
          <p className="text-4xl font-bold text-gray-900 tracking-tight">
            {isLoading ? '...' : formatBalance(totalBalance)}
          </p>
        </div>

        {/* Income */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-base font-medium text-gray-500">Income</span>
            <ArrowUpRight className="w-6 h-6 text-gray-900" />
          </div>
          <p className="text-3xl font-bold text-gray-900 tracking-tight">
            {isLoading ? '...' : formatBalance(income)}
          </p>
        </div>

        {/* Expenses */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-base font-medium text-gray-500">Expenses</span>
            <ArrowDownRight className="w-6 h-6 text-gray-900" />
          </div>
          <p className="text-3xl font-bold text-gray-900 tracking-tight">
            {isLoading ? '...' : formatBalance(expenses)}
          </p>
        </div>

        {/* Debts */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-base font-medium text-gray-500">Pending Debts</span>
            <CreditCard className="w-6 h-6 text-gray-900" />
          </div>
          <p className="text-3xl font-bold text-gray-900 tracking-tight">
            {isLoading ? '...' : formatBalance(totalDebt)}
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Cash Flow Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <h3 className="font-bold text-lg text-gray-900">Cash Flow</h3>
          </div>
          <div className="h-64">
            <FinancialOverviewChart income={income} expenses={expenses} />
          </div>
        </div>

        {/* Debt Distribution Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <h3 className="font-bold text-lg text-gray-900">Debt Distribution</h3>
          </div>
          <div className="h-64">
            <DebtDistributionChart data={debtDistributionData} />
          </div>
        </div>
      </div>

      {/* Accounts Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg text-gray-900">Your Accounts</h3>
          <Link href="/accounts" className="text-base text-gray-600 hover:text-black font-medium border-b border-transparent hover:border-black transition-colors">
            View all →
          </Link>
        </div>

        {isLoading && accounts.length === 0 ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          </div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4 text-base">No accounts registered</p>
            <Link href="/accounts" className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors">
              <Wallet className="w-5 h-5" />
              Create first account
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentAccounts.map((account: any) => (
              <Link
                key={account.id}
                href="/accounts"
                className="p-6 bg-white rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 group"
              >
                <p className="font-medium text-gray-600 text-base mb-2 group-hover:text-black">{account.name}</p>
                <p className={`text-2xl font-bold text-gray-900`}>
                  {formatBalance(account.balance)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
