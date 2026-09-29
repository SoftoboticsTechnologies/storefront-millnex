'use client';

import { useActionState, useEffect } from 'react';
import { updatePasswordAction } from './actions';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {useTranslations} from 'next-intl';

export function ChangePasswordForm() {
    const t = useTranslations('Account');
    const tErrors = useTranslations('Errors');
    const boundAction = (state: {error?: string; success?: boolean} | undefined, formData: FormData) =>
        updatePasswordAction(state, formData, tErrors);
    const [state, formAction, isPending] = useActionState(boundAction, undefined);

    useEffect(() => {
        if (state?.success) {
            const form = document.getElementById('change-password-form') as HTMLFormElement;
            form?.reset();
        }
    }, [state?.success]);

    return (
        <Card className="shadow-none">
            <CardHeader>
                <CardTitle className="font-display text-lg font-bold">{t('changePassword')}</CardTitle>
                <CardDescription>
                    {t('changePasswordDescription')}
                </CardDescription>
            </CardHeader>
            <form id="change-password-form" action={formAction}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="currentPassword">{t('currentPassword')}</Label>
                        <PasswordInput
                            id="currentPassword"
                            name="currentPassword"
                            placeholder="••••••••"
                            required
                            disabled={isPending}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="newPassword">{t('newPassword')}</Label>
                        <PasswordInput
                            id="newPassword"
                            name="newPassword"
                            placeholder="••••••••"
                            required
                            disabled={isPending}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">{t('confirmNewPassword')}</Label>
                        <PasswordInput
                            id="confirmPassword"
                            name="confirmPassword"
                            placeholder="••••••••"
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
                            {t('passwordUpdated')}
                        </div>
                    )}
                    <Button type="submit" className="h-10 rounded-lg bg-brand px-4 font-semibold text-brand-foreground hover:bg-brand/90" disabled={isPending}>
                        {isPending ? t('updating') : t('updatePassword')}
                    </Button>
                </CardContent>
            </form>
        </Card>
    );
}
