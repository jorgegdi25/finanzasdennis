'use client'

interface Debt {
    id: string
    name: string
    totalAmount: number
    paidAmount: number
    remainingAmount: number
    dueDate: string | null
    categoryId: string
    category: {
        id: string
        name: string
    }
}

interface DebtCardProps {
    debt: Debt
    onDelete?: (id: string) => void
    onEdit?: (debt: Debt) => void
}

export default function DebtCard({ debt, onDelete, onEdit }: DebtCardProps) {
    const progress = Math.min(100, (debt.paidAmount / debt.totalAmount) * 100)

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-600 mb-2">
                        {debt.category.name}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900">{debt.name}</h3>
                    {debt.dueDate && (
                        <p className="text-sm text-gray-500 mt-1">
                            Vence el: {formatDate(debt.dueDate)}
                        </p>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-sm text-gray-500">Pagado</p>
                        <p className="text-lg font-bold text-green-600">{formatCurrency(debt.paidAmount)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(debt.totalAmount)}</p>
                    </div>
                </div>

                {/* Barra de progreso */}
                <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold inline-block text-indigo-600">
                                {progress.toFixed(0)}% completado
                            </span>
                        </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-100">
                        <div
                            style={{ width: `${progress}%` }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500 transition-all duration-500"
                        ></div>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                    <div>
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Pendiente</p>
                        <p className="text-xl font-black text-red-500">{formatCurrency(debt.remainingAmount)}</p>
                    </div>
                    <div className="flex gap-2">
                        {onEdit && (
                            <button
                                onClick={() => onEdit(debt)}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Editar"
                            >
                                ✏️
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
