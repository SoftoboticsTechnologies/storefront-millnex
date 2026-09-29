'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Tag, Loader2} from 'lucide-react';
import {applyPromotionCode, removePromotionCode} from './actions';
import {useTranslations} from 'next-intl';

type ActiveOrder = {
    id: string;
    couponCodes?: string[] | null;
};

export function PromotionCode({activeOrder}: { activeOrder: ActiveOrder }) {
    const t = useTranslations('Cart');
    const [code, setCode] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [removingCode, setRemovingCode] = useState<string | null>(null);

    const handleApply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code) return;
        setSubmitting(true);
        try {
            await applyPromotionCode(code);
            setCode('');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemove = async (couponCode: string) => {
        setRemovingCode(couponCode);
        try {
            await removePromotionCode(couponCode);
        } finally {
            setRemovingCode(null);
        }
    };

    return (
        <section aria-labelledby="promo-code-heading" className="rounded-xl border border-border bg-card p-5 sm:p-6">
            <h2 id="promo-code-heading" className="flex items-center gap-2 font-display text-base font-bold">
                <Tag className="size-4 text-steel"/>
                {t('promotionCode')}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{t('enterDiscountCode')}</p>

            <div className="mt-4">
                {activeOrder.couponCodes && activeOrder.couponCodes.length > 0 ? (
                    <div className="space-y-2">
                        {activeOrder.couponCodes.map((couponCode) => (
                            <div key={couponCode}
                                 className="flex items-center justify-between gap-2 rounded-lg border border-success/25 bg-success/10 px-3 py-2">
                                <div className="flex min-w-0 items-center gap-2">
                                    <Tag className="size-4 shrink-0 text-success"/>
                                    <span className="spec-label truncate text-foreground">{couponCode}</span>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 rounded-lg text-stock-out hover:bg-stock-out/10 hover:text-stock-out"
                                    disabled={removingCode === couponCode}
                                    onClick={() => handleRemove(couponCode)}
                                >
                                    {removingCode === couponCode && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                                    {t('remove')}
                                </Button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <form onSubmit={handleApply} className="flex gap-2">
                        <Input
                            type="text"
                            name="code"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder={t('enterCode')}
                            aria-label={t('promotionCode')}
                            className="h-10 min-w-0 flex-1 rounded-lg"
                            required
                        />
                        <Button type="submit" variant="outline" className="h-10 rounded-lg px-4 font-semibold" disabled={submitting}>
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t('apply')}
                        </Button>
                    </form>
                )}
            </div>
        </section>
    );
}
