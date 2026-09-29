'use client';

import {useState} from 'react';
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from '@/components/ui/accordion';
import {cn} from '@/lib/utils';

export interface FaqBrowserCategory {
    id: string;
    label: string;
    /** Pre-formatted count label, e.g. "3 questions". */
    countLabel: string;
    items: Array<{question: string; answer: string}>;
}


/**
 * Categorised FAQ: a category rail (horizontal chips below lg, sticky list
 * from lg) filters the grouped accordions. "All" is the default, so every
 * question and answer is in the prerendered HTML for crawlers; the FAQPage
 * JSON-LD on the page covers all of them regardless of the filter.
 */
export function FaqBrowser({
    categories,
    allLabel,
    allCountLabel,
    navLabel,
}: {
    categories: FaqBrowserCategory[];
    allLabel: string;
    allCountLabel: string;
    navLabel: string;
}) {
    const [active, setActive] = useState<string>('all');
    const visible = active === 'all' ? categories : categories.filter((category) => category.id === active);
    const options = [{id: 'all', label: allLabel, countLabel: allCountLabel}, ...categories];

    return (
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4 xl:col-span-3">
                <div role="group" aria-label={navLabel} className="flex flex-wrap gap-2 lg:sticky lg:top-28 lg:flex-col lg:gap-1">
                    {options.map((option) => {
                        const selected = option.id === active;
                        return (
                            <button
                                key={option.id}
                                type="button"
                                aria-pressed={selected}
                                onClick={() => setActive(option.id)}
                                className={cn(
                                    'group/chip inline-flex cursor-pointer items-center gap-2.5 rounded-lg border px-3.5 py-2 text-sm font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-brand/40',
                                    'lg:justify-between lg:border-0 lg:border-l-2 lg:rounded-none lg:px-4 lg:py-3 lg:text-[15px]',
                                    selected
                                        ? 'border-foreground bg-foreground text-background lg:border-brand lg:bg-surface lg:text-foreground'
                                        : 'border-border bg-card text-foreground hover:border-foreground/35 lg:border-border lg:bg-transparent lg:text-muted-foreground lg:hover:text-foreground',
                                )}
                            >
                                {option.label}
                                <span className={cn('spec-label', selected ? 'text-background/70 lg:text-steel' : 'text-steel')}>{option.countLabel}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="min-w-0 space-y-12 lg:col-span-8 xl:col-span-9">
                {visible.map((category) => {
                    const index = categories.indexOf(category);
                    return (
                        <section key={category.id} aria-labelledby={`faq-${category.id}`} className="animate-fade-up">
                            <div className="border-b border-border pb-4">
                                <h2 id={`faq-${category.id}`} className="font-display-wide text-2xl font-bold sm:text-3xl">{category.label}</h2>
                            </div>
                            <Accordion defaultValue={index === 0 ? [`${category.id}-0`] : []} className="divide-y divide-border">
                                {category.items.map((item, itemIndex) => (
                                    <AccordionItem key={item.question} value={`${category.id}-${itemIndex}`} className="border-0">
                                        <AccordionTrigger className="gap-6 py-6 text-left text-base font-bold hover:text-brand hover:no-underline sm:text-lg">
                                            {item.question}
                                        </AccordionTrigger>
                                        <AccordionContent className="max-w-3xl pb-6 text-[15px] leading-relaxed text-muted-foreground">
                                            {item.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </section>
                    );
                })}
            </div>
        </div>
    );
}
