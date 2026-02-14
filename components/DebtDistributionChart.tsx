'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface DebtData {
    categoryName: string
    amount: number
}

interface DebtDistributionChartProps {
    data: DebtData[]
}

// Monochrome palette: Black -> Grays
const COLORS = ['#000000', '#374151', '#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb']

export default function DebtDistributionChart({ data }: DebtDistributionChartProps) {
    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-sm">No debt data available</p>
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
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="amount"
                        nameKey="categoryName"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value: any) => new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            currencyDisplay: 'narrowSymbol',
                            maximumFractionDigits: 0
                        }).format(Number(value))}
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: 'none' }}
                        itemStyle={{ color: '#000' }}
                    />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        formatter={(value) => <span className="text-gray-600 text-sm">{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}
