'use client';

import {useTranslations} from 'next-intl';
import {LayoutDashboard, LogIn, LogOut, MapPin, Package, User, UserPlus} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {cn} from '@/lib/utils';
import {Link, useRouter} from '@/platform/i18n/navigation';
import {useAuth} from '@/features/authentication/auth-context';
import {logoutAction} from '@/features/authentication/logout';

/**
 * Header account menu. Reflects the real Vendure session from AuthProvider:
 * signed out → Sign in / Create account; signed in → account links and
 * sign out. No customer data is shown that Vendure didn't return.
 */
export function AccountMenu({triggerClassName}: {triggerClassName?: string}) {
    const t = useTranslations('Navigation');
    const router = useRouter();
    const {customer, logout} = useAuth();

    const signOut = async () => {
        await logoutAction();
        await logout();
        router.push('/');
    };

    const itemClass = 'gap-2.5 px-2.5 py-2 text-sm';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <button
                        type="button"
                        aria-label={customer ? t('accountFor', {name: customer.firstName}) : t('account')}
                        className={cn(
                            'inline-flex size-10 items-center justify-center rounded-xl text-sm font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-brand/40',
                            triggerClassName,
                        )}
                    />
                }
            >
                <User className="size-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8} className="w-60 p-1.5">
                {customer ? (
                    <>
                        <div className="px-2.5 pb-2 pt-1.5">
                            <p className="truncate text-sm font-bold">{customer.firstName} {customer.lastName}</p>
                            <p className="truncate text-xs text-muted-foreground">{customer.emailAddress}</p>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className={itemClass} render={<Link href="/account" />}>
                            <LayoutDashboard className="size-4" />{t('myAccount')}
                        </DropdownMenuItem>
                        <DropdownMenuItem className={itemClass} render={<Link href="/account/orders" />}>
                            <Package className="size-4" />{t('myOrders')}
                        </DropdownMenuItem>
                        <DropdownMenuItem className={itemClass} render={<Link href="/account/addresses" />}>
                            <MapPin className="size-4" />{t('savedAddresses')}
                        </DropdownMenuItem>
                        <DropdownMenuItem className={itemClass} render={<Link href="/account/profile" />}>
                            <User className="size-4" />{t('profile')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className={cn(itemClass, 'text-destructive')} onClick={signOut}>
                            <LogOut className="size-4" />{t('signOut')}
                        </DropdownMenuItem>
                    </>
                ) : (
                    <>
                        <div className="px-2.5 pb-2 pt-1.5">
                            <p className="text-sm font-bold">{t('welcome')}</p>
                            <p className="text-xs text-muted-foreground">{t('signInPrompt')}</p>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className={itemClass} render={<Link href="/sign-in" />}>
                            <LogIn className="size-4" />{t('signIn')}
                        </DropdownMenuItem>
                        <DropdownMenuItem className={itemClass} render={<Link href="/register" />}>
                            <UserPlus className="size-4" />{t('createAccount')}
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
