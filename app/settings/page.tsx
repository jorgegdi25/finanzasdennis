import AppLayout from '@/components/AppLayout'
import PasswordChangeForm from '@/components/PasswordChangeForm'

export default function SettingsPage() {
    return (
        <AppLayout>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-500">Manage your account preferences and security.</p>
            </div>

            <div className="space-y-6">
                <PasswordChangeForm />
            </div>
        </AppLayout>
    )
}
