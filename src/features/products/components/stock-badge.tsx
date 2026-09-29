import {useTranslations} from 'next-intl';
import {cn} from '@/lib/utils';

/**
 * Availability pill. Only ever reflects Vendure's own stock answer — a
 * product is never shown as available when Vendure says it isn't.
 */
export function StockBadge({inStock, lowStock, className}: {inStock: boolean; lowStock?: boolean; className?: string}) {
    const t = useTranslations('Product');
    const tone = !inStock ? 'out' : lowStock ? 'low' : 'in';

    return (
        <span
            className={cn(
                'inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-[11px] font-semibold uppercase tracking-[0.08em]',
                tone === 'out' && 'bg-stock-out/10 text-stock-out',
                tone === 'low' && 'bg-warning/15 text-[oklch(0.45_0.11_65)]',
                tone === 'in' && 'bg-success/10 text-success',
                className,
            )}
        >
            <span aria-hidden="true" className={cn('size-1.5 rounded-full', tone === 'out' ? 'bg-stock-out' : tone === 'low' ? 'bg-warning' : 'bg-success')} />
            {tone === 'out' ? t('outOfStock') : tone === 'low' ? t('lowStock') : t('inStock')}
        </span>
    );
}
