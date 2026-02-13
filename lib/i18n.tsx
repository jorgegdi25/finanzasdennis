'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

// ─── Translation keys ───────────────────────────────────────────────
export type Locale = 'es' | 'en'

const translations = {
    // ─── Sidebar ───
    'nav.panel': { en: 'Dashboard', es: 'Panel' },
    'nav.accounts': { en: 'Accounts', es: 'Cuentas' },
    'nav.transactions': { en: 'Transactions', es: 'Movimientos' },
    'nav.debts': { en: 'Debts', es: 'Deudas' },
    'nav.recurring': { en: 'Recurring', es: 'Recurrentes' },
    'nav.settings': { en: 'Settings', es: 'Ajustes' },
    'nav.logout': { en: 'Log Out', es: 'Cerrar Sesión' },

    // ─── Dashboard ───
    'dashboard.title': { en: 'Dashboard', es: 'Panel General' },
    'dashboard.subtitle': { en: 'Overview of your financial situation', es: 'Resumen de tu situación financiera' },
    'dashboard.totalBalance': { en: 'Total Balance', es: 'Balance Total' },
    'dashboard.income': { en: 'Income', es: 'Ingresos' },
    'dashboard.expenses': { en: 'Expenses', es: 'Gastos' },
    'dashboard.totalDebt': { en: 'Total Debt', es: 'Deuda Total' },
    'dashboard.upcomingPayments': { en: 'Upcoming Payments', es: 'Próximos Pagos' },
    'dashboard.viewDebts': { en: 'View debts →', es: 'Ver deudas →' },
    'dashboard.noUpcoming': { en: '🎉 No upcoming payments!', es: '🎉 ¡No tienes pagos pendientes próximos!' },
    'dashboard.cashFlow': { en: 'Cash Flow', es: 'Flujo de Caja' },
    'dashboard.debtDistribution': { en: 'Debt Distribution', es: 'Distribución de Deudas' },
    'dashboard.yourAccounts': { en: 'Your Accounts', es: 'Tus Cuentas' },
    'dashboard.viewAll': { en: 'View all →', es: 'Ver todas →' },
    'dashboard.noAccounts': { en: 'No accounts registered', es: 'No hay cuentas registradas' },
    'dashboard.createFirst': { en: 'Create first account', es: 'Crear primera cuenta' },
    'dashboard.debt': { en: 'Debt', es: 'Deuda' },
    'dashboard.recurring': { en: 'Recurring', es: 'Recurrente' },
    'dashboard.uncategorized': { en: 'Uncategorized', es: 'Sin categoría' },

    // ─── Urgency ───
    'urgency.overdue': { en: 'Overdue!', es: '¡Vencida!' },
    'urgency.urgent': { en: 'Urgent!', es: '¡Urgente!' },
    'urgency.upcoming': { en: 'Upcoming', es: 'Próximo' },
    'urgency.overdueAgo': { en: 'Overdue by {days} days', es: 'Venció hace {days} días' },
    'urgency.dueOn': { en: 'Due: {date}', es: 'Vence: {date}' },

    // ─── Accounts ───
    'accounts.title': { en: 'Bank Accounts', es: 'Cuentas Bancarias' },
    'accounts.subtitle': { en: 'Manage your accounts and balances', es: 'Administra tus cuentas y balances' },
    'accounts.new': { en: 'New Account', es: 'Nueva Cuenta' },
    'accounts.edit': { en: 'Edit Account', es: 'Editar Cuenta' },
    'accounts.totalBalance': { en: 'Total Balance', es: 'Balance Total' },
    'accounts.count': { en: '{n} account(s) registered', es: '{n} cuenta(s) registrada(s)' },
    'accounts.noAccounts': { en: 'No accounts yet', es: 'Sin cuentas aún' },
    'accounts.noAccountsDesc': { en: 'Create your first bank account to get started', es: 'Crea tu primera cuenta bancaria para comenzar' },
    'accounts.confirmDelete': { en: 'Are you sure you want to delete this account?', es: '¿Estás seguro de que deseas eliminar esta cuenta?' },
    'accounts.deleteError': { en: 'Error deleting account', es: 'Error al eliminar la cuenta' },
    'accounts.createdOn': { en: 'Created on {date}', es: 'Creada el {date}' },
    'accounts.balance': { en: 'Balance:', es: 'Saldo:' },
    'accounts.editBtn': { en: 'Edit', es: 'Editar' },
    'accounts.deleteBtn': { en: 'Delete', es: 'Eliminar' },
    'accounts.deleting': { en: 'Deleting...', es: 'Eliminando...' },
    'accounts.confirm': { en: 'Confirm?', es: '¿Confirmar?' },

    // ─── Transactions ───
    'transactions.title': { en: 'Transactions', es: 'Movimientos' },
    'transactions.subtitle': { en: 'Record income and expenses', es: 'Registra ingresos y gastos' },
    'transactions.new': { en: 'New Transaction', es: 'Nuevo Movimiento' },
    'transactions.edit': { en: 'Edit Transaction', es: 'Editar Movimiento' },
    'transactions.income': { en: 'Income', es: 'Ingresos' },
    'transactions.expenses': { en: 'Expenses', es: 'Gastos' },
    'transactions.netBalance': { en: 'Net Balance', es: 'Balance Neto' },
    'transactions.all': { en: 'All', es: 'Todos' },
    'transactions.incomeFilter': { en: 'Income', es: 'Ingresos' },
    'transactions.expenseFilter': { en: 'Expenses', es: 'Gastos' },
    'transactions.noTransactions': { en: 'No transactions', es: 'Sin movimientos' },
    'transactions.noTransactionsFor': { en: 'No transactions for {month} {year}', es: 'No hay movimientos para {month} {year}' },
    'transactions.confirmDelete': { en: 'Are you sure you want to delete this transaction?', es: '¿Estás seguro de que deseas eliminar este movimiento?' },
    'transactions.deleteError': { en: 'Error deleting', es: 'Error al eliminar' },

    // ─── Month names ───
    'month.0': { en: 'January', es: 'Enero' },
    'month.1': { en: 'February', es: 'Febrero' },
    'month.2': { en: 'March', es: 'Marzo' },
    'month.3': { en: 'April', es: 'Abril' },
    'month.4': { en: 'May', es: 'Mayo' },
    'month.5': { en: 'June', es: 'Junio' },
    'month.6': { en: 'July', es: 'Julio' },
    'month.7': { en: 'August', es: 'Agosto' },
    'month.8': { en: 'September', es: 'Septiembre' },
    'month.9': { en: 'October', es: 'Octubre' },
    'month.10': { en: 'November', es: 'Noviembre' },
    'month.11': { en: 'December', es: 'Diciembre' },

    // ─── Debts ───
    'debts.title': { en: 'Debts & Payments', es: 'Deudas y Pagos' },
    'debts.subtitle': { en: 'Track your debts and payment progress', es: 'Controla tus deudas y el progreso de pago' },
    'debts.add': { en: 'Add Debt', es: 'Agregar Deuda' },
    'debts.editTitle': { en: 'Edit Debt', es: 'Editar Deuda' },
    'debts.newTitle': { en: 'New Debt', es: 'Nueva Deuda' },
    'debts.totalDebt': { en: 'Total Debt', es: 'Deuda Total' },
    'debts.totalPaid': { en: 'Total Paid', es: 'Total Pagado' },
    'debts.remaining': { en: 'Remaining Balance', es: 'Saldo Pendiente' },
    'debts.noDebts': { en: 'No debts registered', es: 'Sin deudas registradas' },
    'debts.noDebtsDesc': { en: 'Add your first debt to track your payments', es: 'Agrega tu primera deuda para rastrear tus pagos' },
    'debts.confirmDelete': { en: 'Are you sure you want to delete this debt?', es: '¿Estás seguro de que deseas eliminar esta deuda?' },
    'debts.deleteError': { en: 'Error deleting debt', es: 'Error al eliminar la deuda' },
    'debts.paid': { en: 'Paid', es: 'Pagado' },
    'debts.total': { en: 'Total', es: 'Total' },
    'debts.completed': { en: '{pct}% completed', es: '{pct}% completado' },
    'debts.pending': { en: 'Pending', es: 'Pendiente' },
    'debts.monthlyBreakdown': { en: 'Monthly Breakdown', es: 'Resumen Mensual' },
    'debts.monthlyPayment': { en: 'Monthly Payment', es: 'Pago Mensual' },
    'debts.linkedIncome': { en: 'Linked Income', es: 'Ingreso Vinculado' },
    'debts.netCost': { en: 'Your Net Cost', es: 'Tu Costo Neto' },
    'debts.totalProgress': { en: 'Total Progress', es: 'Progreso Total' },

    // ─── Recurring ───
    'recurring.title': { en: 'Recurring Transactions', es: 'Transacciones Recurrentes' },
    'recurring.subtitle': { en: 'Automate fixed income and expenses', es: 'Automatiza ingresos y gastos fijos' },
    'recurring.new': { en: 'New Schedule', es: 'Nuevo Programa' },
    'recurring.scheduleNew': { en: 'Schedule New Transaction', es: 'Programar Nueva Transacción' },
    'recurring.noSchedules': { en: 'No schedules yet', es: 'Sin programas aún' },
    'recurring.noSchedulesDesc': { en: 'Add subscriptions, salaries or automatic rent payments', es: 'Agrega suscripciones, salarios o pagos automáticos de renta' },
    'recurring.confirmDelete': { en: 'Delete this schedule? No more automatic transactions will be created.', es: '¿Eliminar este programa? No se crearán más transacciones automáticas.' },
    'recurring.deleteError': { en: 'Error deleting', es: 'Error al eliminar' },
    'recurring.frequency': { en: 'Frequency:', es: 'Frecuencia:' },
    'recurring.next': { en: 'Next:', es: 'Próximo:' },
    'recurring.ends': { en: 'Ends:', es: 'Termina:' },
    'recurring.account': { en: 'Account:', es: 'Cuenta:' },
    'recurring.linkDebt': { en: 'Link to Debt', es: 'Vincular a Deuda' },
    'recurring.linkDebtHint': { en: '(e.g. rent that covers a mortgage)', es: '(ej. arriendo que cubre una hipoteca)' },
    'recurring.none': { en: 'None', es: 'Ninguna' },
    'freq.daily': { en: 'Daily', es: 'Diario' },
    'freq.weekly': { en: 'Weekly', es: 'Semanal' },
    'freq.monthly': { en: 'Monthly', es: 'Mensual' },
    'freq.yearly': { en: 'Yearly', es: 'Anual' },

    // ─── Form labels ───
    'form.type': { en: 'Type', es: 'Tipo' },
    'form.typeIncome': { en: 'Income (Salary, Rent, etc.)', es: 'Ingreso (Salario, Arriendo, etc.)' },
    'form.typeExpense': { en: 'Expense (Subscriptions, Services, etc.)', es: 'Gasto (Suscripciones, Servicios, etc.)' },
    'form.frequency': { en: 'Frequency', es: 'Frecuencia' },
    'form.amount': { en: 'Amount', es: 'Monto' },
    'form.startDate': { en: 'Start Date', es: 'Fecha de Inicio' },
    'form.endDate': { en: 'End Date', es: 'Fecha Fin' },
    'form.optional': { en: '(Optional)', es: '(Opcional)' },
    'form.description': { en: 'Description', es: 'Descripción' },
    'form.descriptionPlaceholder': { en: 'e.g. Netflix, Monthly salary, Rent', es: 'ej. Netflix, Salario mensual, Arriendo' },
    'form.account': { en: 'Account', es: 'Cuenta' },
    'form.cancel': { en: 'Cancel', es: 'Cancelar' },
    'form.saving': { en: 'Saving...', es: 'Guardando...' },
    'form.scheduleTransaction': { en: 'Schedule Transaction', es: 'Programar Transacción' },
    'form.name': { en: 'Name', es: 'Nombre' },
    'form.totalAmount': { en: 'Total Amount', es: 'Monto Total' },
    'form.category': { en: 'Category', es: 'Categoría' },
    'form.newCategory': { en: 'New Category', es: 'Nueva Categoría' },
    'form.addCategory': { en: '+ Add', es: '+ Agregar' },
    'form.dueDate': { en: 'Due Date', es: 'Fecha de Vencimiento' },
    'form.save': { en: 'Save', es: 'Guardar' },
    'form.update': { en: 'Update', es: 'Actualizar' },

    // ─── Transaction Card ───
    'card.income': { en: 'Income', es: 'Ingreso' },
    'card.expense': { en: 'Expense', es: 'Gasto' },
    'card.amount': { en: 'Amount:', es: 'Monto:' },
    'card.delete': { en: 'Delete', es: 'Eliminar' },
    'card.edit': { en: 'Edit', es: 'Editar' },
    'card.confirm': { en: 'Confirm?', es: '¿Confirmar?' },
    'card.deleting': { en: 'Deleting...', es: 'Eliminando...' },

    // ─── Transaction Form ───
    'tform.selectAccount': { en: 'Select an account', es: 'Selecciona una cuenta' },
    'tform.noAccounts': { en: 'No accounts available', es: 'No hay cuentas disponibles' },
    'tform.noAccountsDesc': { en: 'You need to create at least one account before adding transactions.', es: 'Necesitas crear al menos una cuenta antes de agregar transacciones.' },
    'tform.linkDebt': { en: 'Link to debt (optional)', es: 'Vincular a deuda (opcional)' },
    'tform.generalExpense': { en: 'None - General expense', es: 'Ninguna - Gasto general' },
    'tform.currentBalance': { en: 'Current remaining balance:', es: 'Saldo restante actual:' },
    'tform.isRecurring': { en: 'Is this a recurring transaction?', es: '¿Es esta una transacción recurrente?' },
    'tform.convertToRecurring': { en: 'Convert to recurring transaction?', es: '¿Convertir a transacción recurrente?' },
    'tform.recurringUpdateHint': { en: 'This instance will be updated and a new schedule will be created for future transactions.', es: 'Esta instancia se actualizará y se creará un nuevo programa para futuras transacciones.' },
    'tform.recurringCreateHint': { en: 'A new transaction will be created automatically based on this schedule.', es: 'Se creará una nueva transacción automáticamente basada en este programa.' },
    'tform.createTransaction': { en: 'Create Transaction', es: 'Crear Transacción' },
    'tform.createRecurring': { en: 'Create Recurring Transaction', es: 'Crear Transacción Recurrente' },
    'tform.updateTransaction': { en: 'Update Transaction', es: 'Actualizar Transacción' },
    'tform.loadingAccounts': { en: 'Loading accounts...', es: 'Cargando cuentas...' },

    // ─── Settings ───
    'settings.title': { en: 'Settings', es: 'Ajustes' },
    'settings.subtitle': { en: 'Manage your account preferences and security.', es: 'Administra tus preferencias de cuenta y seguridad.' },
    'settings.language': { en: 'Language', es: 'Idioma' },
    'settings.languageDesc': { en: 'Choose the interface language', es: 'Elige el idioma de la interfaz' },
    'settings.english': { en: 'English', es: 'English' },
    'settings.spanish': { en: 'Español', es: 'Español' },
} as const

export type TranslationKey = keyof typeof translations

// ─── Context ─────────────────────────────────────────────────────────
interface I18nContextValue {
    locale: Locale
    setLocale: (locale: Locale) => void
    t: (key: TranslationKey, params?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

// ─── Provider ────────────────────────────────────────────────────────
export function I18nProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>('en')
    const [isHydrated, setIsHydrated] = useState(false)

    useEffect(() => {
        // Check localStorage first, then browser language
        const saved = localStorage.getItem('app-locale') as Locale | null
        if (saved && (saved === 'en' || saved === 'es')) {
            setLocaleState(saved)
        } else {
            const browserLang = navigator.language.toLowerCase()
            const detectedLocale: Locale = browserLang.startsWith('es') ? 'es' : 'en'
            setLocaleState(detectedLocale)
        }
        setIsHydrated(true)
    }, [])

    const setLocale = useCallback((newLocale: Locale) => {
        setLocaleState(newLocale)
        localStorage.setItem('app-locale', newLocale)
    }, [])

    const t = useCallback((key: TranslationKey, params?: Record<string, string | number>): string => {
        const entry = translations[key]
        if (!entry) return key
        let text: string = entry[locale] || entry['en'] || key
        if (params) {
            Object.entries(params).forEach(([k, v]) => {
                text = text.replace(`{${k}}`, String(v))
            })
        }
        return text
    }, [locale])

    // Avoid SSR mismatch — render with 'en' until hydrated
    const value: I18nContextValue = { locale, setLocale, t }

    return (
        <I18nContext.Provider value={value}>
            {children}
        </I18nContext.Provider>
    )
}

// ─── Hook ────────────────────────────────────────────────────────────
export function useTranslation() {
    const ctx = useContext(I18nContext)
    if (!ctx) {
        // Fallback for components outside provider
        return {
            locale: 'en' as Locale,
            setLocale: () => { },
            t: (key: TranslationKey): string => {
                const entry = translations[key]
                return entry ? (entry['en'] as string) : key
            },
        }
    }
    return ctx
}
