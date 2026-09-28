'use client';

import {useTranslations} from 'next-intl';
import {FileText} from 'lucide-react';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger} from '@/components/ui/dialog';
import {EnquiryForm, type EnquiryProductOption} from './enquiry-form';

interface QuoteDialogProps {
    /** Real Vendure products for the form's picker (hidden when empty). */
    products: EnquiryProductOption[];
    /** Classes for the trigger button, so callers can match their CTA row. */
    triggerClassName?: string;
}

/**
 * "Request a quote" button that opens the enquiry form in a modal. Same form
 * and delivery path as the contact page (submit-enquiry.ts) — only the
 * container differs.
 */
export function QuoteDialog({products, triggerClassName}: QuoteDialogProps) {
    const t = useTranslations('Enquiry');

    return (
        <Dialog>
            <DialogTrigger render={<button type="button" className={triggerClassName} />}>
                <FileText />
                {t('requestQuote')}
            </DialogTrigger>
            <DialogContent className="max-h-[92dvh] gap-5 overflow-y-auto rounded-2xl p-5 sm:max-w-2xl sm:p-8">
                <DialogHeader className="pr-8">
                    <DialogTitle className="text-2xl font-extrabold tracking-tight">{t('quoteTitle')}</DialogTitle>
                    <DialogDescription>{t('quoteDescription')}</DialogDescription>
                </DialogHeader>
                <EnquiryForm products={products} />
            </DialogContent>
        </Dialog>
    );
}
