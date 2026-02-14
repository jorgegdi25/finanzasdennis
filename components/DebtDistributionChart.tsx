'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface DebtData {
    categoryName: string
    amount: number
}

interface DebtDistributionChartProps {
    data: DebtData[]
}

// Vibrant modern palette
const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#f43f5e', '#06b6d4', '#8b5cf6']

export default function DebtDistributionChart({ data }: DebtDistributionChartProps) {
    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-xl">
                <p className="text-gray-400 text-sm">No debt data available</p>
            </div>
        )
    }

    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="45%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="amount"
                        nameKey="categoryName"
                        strokeWidth={0}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
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
                        itemStyle={{ color: '#334155', fontWeight: 600 }}
                    />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        formatter={(value) => <span className="text-gray-600 text-sm font-medium">{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}
