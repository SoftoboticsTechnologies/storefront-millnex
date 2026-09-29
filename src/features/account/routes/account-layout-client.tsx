'use client';

import {useEffect, useRef, type ReactNode} from 'react';
import {Loader2, LogOut, User} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {logoutAction} from '@/features/authentication/logout';
import {useAuth} from '@/features/authentication/auth-context';
import {useRouter} from '@/platform/i18n/navigation';
import {AccountNavLinks} from '@/features/account/components/account-nav-links';

const navItems = [
    {href: '/account', labelKey: 'overview', icon: 'LayoutDashboard', exact: true},
    {href: '/account/orders', labelKey: 'orders', icon: 'Package'},
    // Wishlist lives outside /account (it's device-local and works signed out),
    // but belongs in the account menu.
    {href: '/wishlist', labelKey: 'wishlist', icon: 'Heart'},
    {href: '/account/addresses', labelKey: 'addresses', icon: 'MapPin'},
    {href: '/account/profile', labelKey: 'profile', icon: 'User'},
];

/**
 * Client-side guard for the whole `/account` section. Previously each page
 * that needed an authenticated customer did its own server-side
 * `redirect({href:'/sign-in'})` check (see e.g. account/routes/orders/page.tsx,
 * owned separately). There is no server-side session to check anymore, so
 * this centralizes the same behavior as a client check on the auth context.
 */
export function AccountLayoutClient({children}: {children: ReactNode}) {
    const {customer, isLoading, logout} = useAuth();
    const router = useRouter();
    const t = useTranslations('Account');

    // Signing out clears `customer`, which would otherwise trip the
    // "signed-out → /sign-in" redirect below before we get home.
    const signingOut = useRef(false);

    const signOut = async () => {
        signingOut.current = true;
        await logoutAction();
        await logout();
        router.push('/');
    };

    useEffect(() => {
        if (!isLoading && !customer && !signingOut.current) {
            router.push('/sign-in');
        }
    }, [isLoading, customer, router]);

    if (isLoading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!customer) {
        // Redirecting via the effect above.
        return null;
    }

    const initials = [customer.firstName, customer.lastName]
        .map((part) => part?.trim().charAt(0) ?? '')
        .join('')
        .toUpperCase();

    return (
        <div className="site-container pb-20 pt-24 sm:pt-28 lg:pt-36">
            {/* < lg: horizontal scrolling tabs */}
            <div className="mb-6 lg:hidden">
                <AccountNavLinks items={navItems} layout="horizontal" />
            </div>

            <div className="flex gap-10">
                {/* lg+: sidebar */}
                <aside className="hidden w-64 shrink-0 lg:block">
                    <div className="sticky top-32 rounded-xl border border-border bg-card p-3">
                        <div className="flex items-center gap-3 border-b border-border px-2 pb-4 pt-2">
                            <span
                                aria-hidden="true"
                                className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-logo-blue font-display text-sm font-bold text-white"
                            >
                                {initials || <User className="size-4" />}
                            </span>
                            <div className="min-w-0">
                                <p className="truncate font-display text-sm font-bold">
                                    {[customer.firstName, customer.lastName].filter(Boolean).join(' ') || t('pageTitle')}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">{customer.emailAddress}</p>
                            </div>
                        </div>
                        <div className="pt-3">
                            <AccountNavLinks items={navItems} layout="vertical" />
                        </div>
                        <div className="mt-3 border-t border-border pt-3">
                            <button
                                type="button"
                                onClick={signOut}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-stock-out/10 hover:text-stock-out"
                            >
                                <LogOut className="size-[18px]" />
                                {t('signOut')}
                            </button>
                        </div>
                    </div>
                </aside>
                <main className="min-w-0 flex-1">
                    {children}
                    <button
                        type="button"
                        onClick={signOut}
                        className="mt-10 inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:border-stock-out/30 hover:text-stock-out lg:hidden"
                    >
                        <LogOut className="size-4" />
                        {t('signOut')}
                    </button>
                </main>
            </div>
        </div>
    );
}
