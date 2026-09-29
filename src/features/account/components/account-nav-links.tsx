'use client';

import { Link, usePathname } from '@/platform/i18n/navigation';
import {cn} from '@/lib/utils';
import {Heart, LayoutDashboard, Package, User, MapPin} from 'lucide-react';
import type {LucideIcon} from 'lucide-react';
import {useTranslations} from 'next-intl';

const iconMap: Record<string, LucideIcon> = {
    LayoutDashboard,
    Package,
    Heart,
    MapPin,
    User,
};

interface NavItem {
    href: string;
    labelKey: string;
    icon: string;
    /** Highlight only on an exact path match (for the `/account` overview). */
    exact?: boolean;
}

interface AccountNavLinksProps {
    items: NavItem[];
    layout: 'horizontal' | 'vertical';
}

export function AccountNavLinks({items, layout}: AccountNavLinksProps) {
    const pathname = usePathname();
    const t = useTranslations('Account');
    const isActive = (item: NavItem) =>
        item.exact ? pathname.replace(/\/$/, '') === item.href : pathname.startsWith(item.href);

    if (layout === 'horizontal') {
        // Scrollable tab strip: bleeds to the screen edge so tabs never wrap
        // or push the page wider than the viewport.
        return (
            <nav aria-label={t('accountNavigation')} className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:-mx-6 sm:px-6 [&::-webkit-scrollbar]:hidden">
                <ul className="flex w-max gap-2 pb-1">
                    {items.map((item) => {
                        const active = isActive(item);
                        const Icon = iconMap[item.icon];
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    aria-current={active ? 'page' : undefined}
                                    className={cn(
                                        'flex h-10 items-center gap-2 whitespace-nowrap rounded-lg border px-3.5 text-sm font-semibold transition-colors',
                                        active
                                            ? 'border-foreground bg-foreground text-background'
                                            : 'border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground',
                                    )}
                                >
                                    {Icon && <Icon className="size-4" />}
                                    {t(item.labelKey)}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        );
    }

    return (
        <nav aria-label={t('accountNavigation')}>
            <ul className="space-y-1">
                {items.map((item) => {
                    const active = isActive(item);
                    const Icon = iconMap[item.icon];
                    return (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                aria-current={active ? 'page' : undefined}
                                className={cn(
                                    'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors',
                                    active
                                        ? 'bg-surface text-foreground before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-brand'
                                        : 'text-muted-foreground hover:bg-surface hover:text-foreground',
                                )}
                            >
                                {Icon && <Icon className={cn('size-[18px]', active ? 'text-brand' : 'text-steel')} />}
                                {t(item.labelKey)}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
