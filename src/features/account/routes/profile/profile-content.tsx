'use client';

import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useActiveCustomer } from '@/features/account/customer';
import { ChangePasswordForm } from './change-password-form';
import { EditProfileForm } from './edit-profile-form';
import { EditEmailForm } from './edit-email-form';

export function ProfileContent() {
    const t = useTranslations('Account');
    const {customer, isLoading} = useActiveCustomer();

    if (isLoading) {
        return (
            <div className="flex min-h-[40vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="border-b border-border pb-6">
                <h1 className="font-display-wide text-3xl font-extrabold tracking-tight sm:text-4xl">{t('accountDetails')}</h1>
                <p className="mt-2 text-muted-foreground">
                    {t('manageAccountInfo')}
                </p>
            </div>

            <EditProfileForm customer={customer} />

            <EditEmailForm currentEmail={customer?.emailAddress || ''} />

            <ChangePasswordForm />
        </div>
    );
}
