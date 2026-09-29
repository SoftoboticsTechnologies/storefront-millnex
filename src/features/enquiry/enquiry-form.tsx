'use client';

import {useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {useTranslations} from 'next-intl';
import {AlertCircle, ArrowRight, CheckCircle2, ChevronDown, ExternalLink, Loader2} from 'lucide-react';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@/components/ui/form';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {cn} from '@/lib/utils';
import {CONTACT_CONFIG, isPlaceholder} from '@/config/contact';
import {
    EnquiryNotConfiguredError,
    formatEnquiryText,
    submitEnquiry,
    type EnquiryPayload,
    type EnquiryResult,
} from './submit-enquiry';

export interface EnquiryProductOption {
    value: string;
    label: string;
}

const PHONE_PATTERN = /^\+?[\d\s()-]{10,20}$/;

function createEnquirySchema(t: ReturnType<typeof useTranslations<'Enquiry'>>) {
    return z.object({
        name: z.string().trim().min(2, t('validation.name')),
        phone: z
            .string()
            .trim()
            .regex(PHONE_PATTERN, t('validation.phone'))
            .refine((value) => {
                const digits = value.replace(/\D/g, '').length;
                return digits >= 10 && digits <= 15;
            }, t('validation.phone')),
        email: z.union([z.literal(''), z.email(t('validation.email'))]),
        company: z.string().trim().max(120),
        businessType: z.string(),
        product: z.string(),
        quantity: z.string().trim().max(200),
        message: z.string().trim().min(10, t('validation.message')).max(2000, t('validation.messageTooLong')),
    });
}

type EnquiryFormData = z.infer<ReturnType<typeof createEnquirySchema>>;

type Status =
    | {state: 'idle'}
    | {state: 'submitting'}
    | {state: 'success'; result: EnquiryResult}
    | {state: 'error'; notConfigured: boolean};

const inputClass = 'h-12 rounded-lg border-input bg-card px-4 text-[15px] shadow-none focus-visible:border-brand focus-visible:ring-brand/20';

/** Business-type choices for quote requests (labels in `Enquiry.businessTypes`). */
const BUSINESS_TYPES = ['home', 'smallBusiness', 'commercial', 'foodBusiness', 'dealer'] as const;

interface EnquiryFormProps {
    products: EnquiryProductOption[];
    className?: string;
    /**
     * `contact` (default): name, phone, email, company, product, message.
     * `quote`: adds business type and quantity, and submits as "Request Quote".
     */
    variant?: 'contact' | 'quote';
    /** Product slug to pre-select (e.g. the quote was opened from a product page). */
    defaultProduct?: string;
    /** Pre-filled requirement text (e.g. the machine finder's answers). */
    defaultMessage?: string;
    /** Overrides the submit button label. */
    submitLabel?: string;
}

/**
 * Enquiry / quote request form. Validates client-side, then delivers via
 * submit-enquiry.ts (configured endpoint → WhatsApp hand-off → email
 * hand-off). A `?product=<slug>` query param pre-selects a product; it is
 * read from window.location after mount — never via useSearchParams, which
 * would de-opt the whole static page to client rendering (docs/decisions.md).
 */
export function EnquiryForm({products, className, variant = 'contact', defaultProduct, defaultMessage, submitLabel}: EnquiryFormProps) {
    const t = useTranslations('Enquiry');
    const [status, setStatus] = useState<Status>({state: 'idle'});

    const form = useForm<EnquiryFormData>({
        resolver: zodResolver(createEnquirySchema(t)),
        defaultValues: {
            name: '',
            phone: '',
            email: '',
            company: '',
            businessType: '',
            product: defaultProduct && products.some((product) => product.value === defaultProduct) ? defaultProduct : '',
            quantity: '',
            message: defaultMessage ?? '',
        },
    });
    const isQuote = variant === 'quote';

    useEffect(() => {
        if (defaultProduct) return;
        // `?product=<slug>` (from a product page); `?machine=` kept for old links.
        const params = new URLSearchParams(window.location.search);
        const slug = params.get('product') ?? params.get('machine');
        if (slug && products.some((product) => product.value === slug)) {
            form.setValue('product', slug);
        }
    }, [form, products, defaultProduct]);

    const onSubmit = async (data: EnquiryFormData) => {
        setStatus({state: 'submitting'});
        const productLabel = products.find((product) => product.value === data.product)?.label;
        const payload: EnquiryPayload = {
            name: data.name,
            phone: data.phone,
            email: data.email || undefined,
            company: data.company || undefined,
            businessType: data.businessType ? t(`businessTypes.${data.businessType as (typeof BUSINESS_TYPES)[number]}`) : undefined,
            product: productLabel ?? (data.product ? data.product : undefined),
            quantity: data.quantity || undefined,
            message: data.message,
        };
        const text = formatEnquiryText(
            payload,
            {
                name: t('fields.name'),
                phone: t('fields.phone'),
                email: t('fields.email'),
                company: t('fields.company'),
                businessType: t('fields.businessType'),
                product: t('fields.product'),
                quantity: t('fields.quantity'),
                message: t('fields.message'),
            },
            t('handoffIntro', {company: CONTACT_CONFIG.companyName}),
        );

        try {
            const result = await submitEnquiry(payload, text, t('subject', {product: productLabel ?? t('generalEnquiry')}));
            // Still inside the submit gesture's activation window; the success
            // state also offers a link in case a popup blocker wins.
            if (result.kind === 'whatsapp') {
                window.open(result.handoffUrl, '_blank', 'noopener,noreferrer');
            } else if (result.kind === 'email') {
                window.location.href = result.handoffUrl;
            }
            setStatus({state: 'success', result});
            form.reset();
        } catch (error) {
            setStatus({state: 'error', notConfigured: error instanceof EnquiryNotConfiguredError});
        }
    };

    if (status.state === 'success') {
        const {result} = status;
        return (
            <div role="status" className={cn('flex flex-col items-start gap-4 rounded-2xl border border-success/25 bg-success/5 p-8', className)}>
                <CheckCircle2 aria-hidden="true" className="size-10 text-success" />
                <h3 className="text-xl font-extrabold">
                    {result.kind === 'endpoint' ? t('success.title') : t('success.handoffTitle')}
                </h3>
                <p className="text-muted-foreground">
                    {result.kind === 'endpoint'
                        ? t('success.body')
                        : result.kind === 'whatsapp' ? t('success.whatsappBody') : t('success.emailBody')}
                </p>
                <div className="flex flex-wrap gap-3">
                    {result.kind !== 'endpoint' && (
                        <a
                            href={result.handoffUrl}
                            target={result.kind === 'whatsapp' ? '_blank' : undefined}
                            rel="noopener noreferrer"
                            className="inline-flex h-11 items-center gap-2 rounded-lg bg-brand px-5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90"
                        >
                            {result.kind === 'whatsapp' ? t('success.openWhatsApp') : t('success.openEmail')}
                            <ExternalLink className="size-4" />
                        </a>
                    )}
                    <button
                        type="button"
                        onClick={() => setStatus({state: 'idle'})}
                        className="inline-flex h-11 items-center rounded-lg border border-border bg-card px-5 text-sm font-semibold transition-colors hover:border-foreground/25"
                    >
                        {t('success.sendAnother')}
                    </button>
                </div>
            </div>
        );
    }

    const submitting = status.state === 'submitting';
    const phoneConfigured = !isPlaceholder(CONTACT_CONFIG.phone);
    const emailConfigured = !isPlaceholder(CONTACT_CONFIG.email);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate className={cn('grid gap-5 sm:grid-cols-2', className)} aria-busy={submitting}>
                <FormField
                    control={form.control}
                    name="name"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>{t('fields.name')} <span className="text-brand">*</span></FormLabel>
                            <FormControl>
                                <Input autoComplete="name" placeholder={t('placeholders.name')} className={inputClass} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="phone"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>{t('fields.phone')} <span className="text-brand">*</span></FormLabel>
                            <FormControl>
                                <Input type="tel" inputMode="tel" autoComplete="tel" placeholder={t('placeholders.phone')} className={inputClass} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>{t('fields.email')}</FormLabel>
                            <FormControl>
                                <Input type="email" inputMode="email" autoComplete="email" placeholder={t('placeholders.email')} className={inputClass} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="company"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>{t('fields.company')}</FormLabel>
                            <FormControl>
                                <Input autoComplete="organization" placeholder={t('placeholders.company')} className={inputClass} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {isQuote && <FormField
                    control={form.control}
                    name="businessType"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>{t('fields.businessType')}</FormLabel>
                            <div className="relative">
                                <FormControl>
                                    <select
                                        {...field}
                                        className={cn(inputClass, 'w-full appearance-none border pr-10 outline-none focus-visible:ring-3')}
                                    >
                                        <option value="">{t('businessTypes.notSpecified')}</option>
                                        {BUSINESS_TYPES.map((type) => (
                                            <option key={type} value={type}>{t(`businessTypes.${type}`)}</option>
                                        ))}
                                    </select>
                                </FormControl>
                                <ChevronDown aria-hidden="true" className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted-foreground" />
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />}
                {products.length > 0 && <FormField
                    control={form.control}
                    name="product"
                    render={({field}) => (
                        <FormItem className={isQuote ? undefined : 'sm:col-span-2'}>
                            <FormLabel>{t('fields.product')}</FormLabel>
                            <div className="relative">
                                <FormControl>
                                    <select
                                        {...field}
                                        className={cn(inputClass, 'w-full appearance-none border pr-10 outline-none focus-visible:ring-3 aria-invalid:border-destructive')}
                                    >
                                        <option value="">{t('productNotSure')}</option>
                                        {products.map((product) => (
                                            <option key={product.value} value={product.value}>{product.label}</option>
                                        ))}
                                    </select>
                                </FormControl>
                                <ChevronDown aria-hidden="true" className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted-foreground" />
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />}
                {isQuote && <FormField
                    control={form.control}
                    name="quantity"
                    render={({field}) => (
                        <FormItem className={products.length > 0 ? 'sm:col-span-2' : undefined}>
                            <FormLabel>{t('fields.quantity')}</FormLabel>
                            <FormControl>
                                <Input placeholder={t('placeholders.quantity')} className={inputClass} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />}
                <FormField
                    control={form.control}
                    name="message"
                    render={({field}) => (
                        <FormItem className="sm:col-span-2">
                            <FormLabel>{t('fields.message')} <span className="text-brand">*</span></FormLabel>
                            <FormControl>
                                <Textarea rows={5} placeholder={t('placeholders.message')} className={cn(inputClass, 'h-auto min-h-32 py-3')} {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {status.state === 'error' && (
                    <div role="alert" className="flex gap-3 rounded-lg border border-destructive/25 bg-destructive/5 p-4 text-sm sm:col-span-2">
                        <AlertCircle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-destructive" />
                        <div>
                            <p className="font-semibold">{status.notConfigured ? t('error.notConfiguredTitle') : t('error.title')}</p>
                            <p className="mt-1 text-muted-foreground">
                                {status.notConfigured ? t('error.notConfiguredBody') : t('error.body')}
                                {(phoneConfigured || emailConfigured) && (
                                    <> {[phoneConfigured && CONTACT_CONFIG.phone, emailConfigured && CONTACT_CONFIG.email].filter(Boolean).join(' · ')}</>
                                )}
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-muted-foreground">{t('requiredNote')}</p>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="group/btn inline-flex h-12 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-brand px-7 text-[15px] font-semibold text-brand-foreground shadow-[0_10px_30px_-14px_var(--brand)] transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-[oklch(0.52_0.17_37)] focus-visible:ring-3 focus-visible:ring-brand/40 outline-none disabled:pointer-events-none disabled:opacity-70"
                    >
                        {submitting ? (
                            <>
                                <Loader2 aria-hidden="true" className="size-[18px] animate-spin" />
                                {t('submitting')}
                            </>
                        ) : (
                            <>
                                {submitLabel ?? (isQuote ? t('submitQuote') : t('submit'))}
                                <ArrowRight aria-hidden="true" className="size-[18px] transition-transform group-hover/btn:translate-x-0.5" />
                            </>
                        )}
                    </button>
                </div>
            </form>
        </Form>
    );
}
