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
        { name: 'Income', amount: income, color: '#000000' }, // Black for Income
        { name: 'Expenses', amount: expenses, color: '#9ca3af' }, // Gray for Expenses
    ]

    return (
        <div className="h-64 w-full"> {/* Reduced height to match container better */}
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{ top: 10, right: 10, left: 0, bottom: 20 }} // More bottom margin
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#374151', fontSize: 13, fontWeight: 500 }}
                        dy={10} // Push labels down
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                        cursor={{ fill: '#f3f4f6' }}
                        formatter={(value: any) => new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            currencyDisplay: 'narrowSymbol',
                            maximumFractionDigits: 0
                        }).format(Number(value))}
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: 'none' }}
                    />
                    <Bar dataKey="amount" radius={[4, 4, 0, 0]} barSize={50}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
