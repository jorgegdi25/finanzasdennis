'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface OverviewData {
    name: string
    amount: number
    color: string
}

interface FinancialOverviewChartProps {
    income: number
    expenses: number
}

export default function FinancialOverviewChart({ income, expenses }: FinancialOverviewChartProps) {
    const data: OverviewData[] = [
        { name: 'Income', amount: income, color: '#10b981' },
        { name: 'Expenses', amount: expenses, color: '#f43f5e' },
    ]

    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 13, fontWeight: 600 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        tickFormatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <Tooltip
                        cursor={{ fill: '#f8fafc', radius: 8 }}
                        formatter={(value: any) => new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            currencyDisplay: 'narrowSymbol',
                            maximumFractionDigits: 0
                        }).format(Number(value))}
                        contentStyle={{
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                            padding: '8px 14px'
                        }}
                    />
                    <Bar dataKey="amount" radius={[8, 8, 0, 0]} barSize={56}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
