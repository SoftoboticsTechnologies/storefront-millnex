import type {Metadata} from 'next';
import {Suspense} from 'react';
import {getRouteLocale} from '@/platform/i18n/server';
import {getTranslations} from 'next-intl/server';
import {LoginForm} from "./login-form";
import {Card, CardContent, CardFooter} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";
import {SITE_NAME} from "@/config/metadata";

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Auth'});
    return {
        title: t('pageTitle'),
    };
}

function LoginFormSkeleton() {
    return (
        <Card>
            <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-12"/>
                    <Skeleton className="h-10 w-full"/>
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-16"/>
                    <Skeleton className="h-10 w-full"/>
                </div>
                <Skeleton className="h-10 w-full"/>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">

                <div className="flex flex-col items-center space-y-2">
                    <Skeleton className="h-4 w-40"/>
                </div>
            </CardFooter>
        </Card>
    );
}

export default async function SignInPage() {
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
                        {t('welcomeBack')}
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
                        <h1 className="font-display-wide text-3xl font-extrabold tracking-tight sm:text-4xl">{t('signIn')}</h1>
                        <p className="text-muted-foreground">
                            {t('enterCredentials')}
                        </p>
                    </div>
                    <Suspense fallback={<LoginFormSkeleton/>}>
                        <LoginForm/>
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
