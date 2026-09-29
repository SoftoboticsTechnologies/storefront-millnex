import type {Metadata} from 'next';
import {Suspense} from 'react';
import {getRouteLocale} from '@/platform/i18n/server';
import {getTranslations} from 'next-intl/server';
import { RegistrationForm } from "./registration-form";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {SITE_NAME} from "@/config/metadata";

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Auth'});
    return {
        title: t('createAccount'),
    };
}

function RegistrationFormSkeleton() {
    return (
        <Card>
            <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 mt-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-44 mx-auto" />
            </CardFooter>
        </Card>
    );
}

export default async function RegisterPage() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Auth'});

    return (
        <div className="flex min-h-dvh">
            {/* Branded panel - desktop only */}
            <div className="hidden border-r border-border bg-surface p-12 lg:flex lg:w-1/2 lg:items-center lg:justify-center">
                <div className="max-w-md space-y-6 text-foreground">
                    <span aria-hidden="true" className="block h-1 w-12 rounded-full bg-brand" />
                    <h2 className="font-display-wide text-5xl font-extrabold tracking-tight">{SITE_NAME}</h2>
                    <p className="text-xl leading-relaxed text-muted-foreground">
                        {t('joinUs')}
                    </p>
                    <div className="grid grid-cols-3 gap-6 border-t border-border pt-6">
                        <div>
                            <p className="font-display-wide text-2xl font-extrabold text-brand">{t('featureFast')}</p>
                            <p className="spec-label mt-1 text-steel">{t('featureCheckout')}</p>
                        </div>
                        <div>
                            <p className="font-display-wide text-2xl font-extrabold text-brand">{t('featureSecure')}</p>
                            <p className="spec-label mt-1 text-steel">{t('featurePayments')}</p>
                        </div>
                        <div>
                            <p className="font-display-wide text-2xl font-extrabold text-brand">{t('featureEasy')}</p>
                            <p className="spec-label mt-1 text-steel">{t('featureReturns')}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form panel */}
            <div className="flex w-full items-center justify-center px-4 pb-12 pt-24 sm:pt-28 lg:w-1/2 lg:py-12">
                <div className="w-full max-w-md space-y-6">
                    <div className="space-y-2 text-center">
                        <p className="spec-label text-brand lg:hidden">{SITE_NAME}</p>
                        <h1 className="font-display-wide text-3xl font-extrabold tracking-tight sm:text-4xl">{t('createAccount')}</h1>
                        <p className="text-muted-foreground">
                            {t('signUpMessage')}
                        </p>
                    </div>
                    <Suspense fallback={<RegistrationFormSkeleton />}>
                        <RegistrationForm />
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
