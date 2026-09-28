'use client';

import {useEffect, useRef, type ReactNode} from 'react';
import {Loader2, LogOut} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {logoutAction} from '@/features/authentication/logout';
import {useAuth} from '@/features/authentication/auth-context';
import {useRouter} from '@/platform/i18n/navigation';
import {AccountNavLinks} from '@/features/account/components/account-nav-links';

const navItems = [
    {href: '/account', labelKey: 'overview', icon: 'LayoutDashboard', exact: true},
    {href: '/account/orders', labelKey: 'orders', icon: 'Package'},
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

    return (
        <div className="site-container pb-16 pt-24 sm:pt-28">
            {/* Mobile: horizontal tab bar */}
            <div className="md:hidden mb-6">
                <AccountNavLinks items={navItems} layout="horizontal" />
            </div>

            <div className="flex gap-8">
                {/* Desktop: sidebar */}
                <aside className="hidden md:block w-64 shrink-0 space-y-1">
                    <AccountNavLinks items={navItems} layout="vertical" />
                    <button
                        type="button"
                        onClick={signOut}
                        className="flex w-full items-center gap-3 rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                        <LogOut className="h-5 w-5" />
                        {t('signOut')}
                    </button>
                </aside>
                <main className="flex-1 min-w-0">
                    {children}
                </main>
            </div>
        </div>
    );
}
