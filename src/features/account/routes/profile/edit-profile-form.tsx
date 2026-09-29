'use client';

import { useActionState, useEffect } from 'react';
import { updateCustomerAction } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {useTranslations} from 'next-intl';

interface EditProfileFormProps {
    customer: {
        firstName: string;
        lastName: string;
    } | null;
}

export function EditProfileForm({ customer }: EditProfileFormProps) {
    const t = useTranslations('Account');
    const tErrors = useTranslations('Errors');
    const boundAction = (state: {error?: string; success?: boolean} | undefined, formData: FormData) =>
        updateCustomerAction(state, formData, tErrors);
    const [state, formAction, isPending] = useActionState(boundAction, undefined);

    useEffect(() => {
        if (state?.success) {
            const form = document.getElementById('edit-profile-form') as HTMLFormElement;
            form?.reset();
        }
    }, [state?.success]);

    return (
        <Card className="shadow-none">
            <CardHeader>
                <CardTitle className="font-display text-lg font-bold">{t('personalInformation')}</CardTitle>
                <CardDescription>
                    {t('updatePersonalDetails')}
                </CardDescription>
            </CardHeader>
            <form id="edit-profile-form" action={formAction}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="firstName">{t('firstName')}</Label>
                        <Input
                            id="firstName"
                            name="firstName"
                            type="text"
                            placeholder="John"
                            defaultValue={customer?.firstName || ''}
                            required
                            disabled={isPending}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lastName">{t('lastName')}</Label>
                        <Input
                            id="lastName"
                            name="lastName"
                            type="text"
                            placeholder="Doe"
                            defaultValue={customer?.lastName || ''}
                            required
                            disabled={isPending}
                        />
                    </div>
                    {state?.error && (
                        <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            {state.error}
                        </div>
                    )}
                    {state?.success && (
                        <div className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
                            {t('profileUpdated')}
                        </div>
                    )}
                    <Button type="submit" className="h-10 rounded-lg bg-brand px-4 font-semibold text-brand-foreground hover:bg-brand/90" disabled={isPending}>
                        {isPending ? t('updating') : t('updateProfile')}
                    </Button>
                </CardContent>
            </form>
        </Card>
    );
}
