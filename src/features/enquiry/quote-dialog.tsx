'use client';

import {createContext, useCallback, useContext, useMemo, useState, type ReactNode} from 'react';
import {useTranslations} from 'next-intl';
import {FileText, ShieldCheck} from 'lucide-react';
import {Dialog, DialogContent, DialogDescription, DialogTitle} from '@/components/ui/dialog';
import {cn} from '@/lib/utils';
import {getWhatsAppUrl} from '@/config/contact';
import {EnquiryForm, type EnquiryProductOption} from './enquiry-form';

interface QuoteRequest {
    /** Product slug to pre-select in the form. */
    product?: string;
    /** Requirement text to pre-fill. */
    message?: string;
}

interface QuoteContextValue {
    openQuote: (request?: QuoteRequest) => void;
}

const QuoteContext = createContext<QuoteContextValue | null>(null);

/**
 * One site-wide "Get a Quote" modal (mounted once in the locale layout), so
 * the header, hero, product pages, category pages and footer can all open it
 * with `<QuoteButton>` without each rendering its own dialog. Same form and
 * delivery path as the contact page (submit-enquiry.ts).
 */
export function QuoteProvider({products, children}: {products: EnquiryProductOption[]; children: ReactNode}) {
    const t = useTranslations('Enquiry');
    const [open, setOpen] = useState(false);
    const [request, setRequest] = useState<QuoteRequest>({});
    // Remount the form per opening so a pre-selected product always applies.
    const [session, setSession] = useState(0);

    const openQuote = useCallback((next: QuoteRequest = {}) => {
        setRequest(next);
        setSession((value) => value + 1);
        setOpen(true);
    }, []);
    const value = useMemo(() => ({openQuote}), [openQuote]);
    const whatsappUrl = getWhatsAppUrl(t('handoffIntro', {company: 'Millnex'}));

    return (
        <QuoteContext.Provider value={value}>
            {children}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-h-[92dvh] gap-0 overflow-y-auto rounded-2xl p-0 sm:max-w-3xl">
                    <div className="grid md:grid-cols-[15rem_1fr]">
                        <div className="relative isolate flex flex-col overflow-hidden bg-tint-blue p-6 text-foreground md:rounded-l-2xl md:p-7">
                            <DialogTitle className="font-display-wide text-2xl font-bold leading-tight text-foreground">{t('quoteTitle')}</DialogTitle>
                            <DialogDescription className="mt-3 text-sm leading-relaxed text-muted-foreground">{t('quoteDescription')}</DialogDescription>
                            <p className="mt-6 flex gap-2.5 border-t border-border pt-5 text-xs leading-relaxed text-muted-foreground">
                                <ShieldCheck aria-hidden="true" className="size-4 shrink-0 text-brand" />
                                {t('quoteAssurance')}
                            </p>
                            {whatsappUrl && (
                                <p className="mt-4 text-xs text-muted-foreground md:mt-auto">
                                    {t('preferWhatsApp')}{' '}
                                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-foreground underline decoration-brand underline-offset-4 hover:text-brand">
                                        {t('chatOnWhatsApp')}
                                    </a>
                                </p>
                            )}
                        </div>
                        <div className="p-5 sm:p-7">
                            <EnquiryForm key={session} products={products} variant="quote" defaultProduct={request.product} defaultMessage={request.message} />
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </QuoteContext.Provider>
    );
}

export function useQuote(): QuoteContextValue {
    const context = useContext(QuoteContext);
    if (!context) throw new Error('useQuote must be used inside <QuoteProvider>');
    return context;
}

interface QuoteButtonProps {
    /** Product slug to pre-select. */
    product?: string;
    className?: string;
    /** Button content; defaults to an icon + "Get a Quote". */
    children?: ReactNode;
    /** Hide the default leading icon. */
    hideIcon?: boolean;
}

/** Opens the site-wide quote modal. Style it with `siteButton(...)` from the caller. */
export function QuoteButton({product, className, children, hideIcon}: QuoteButtonProps) {
    const t = useTranslations('Enquiry');
    const {openQuote} = useQuote();

    return (
        <button type="button" onClick={() => openQuote({product})} className={cn('cursor-pointer', className)}>
            {children ?? (
                <>
                    {!hideIcon && <FileText aria-hidden="true" />}
                    {t('getQuote')}
                </>
            )}
        </button>
    );
}
