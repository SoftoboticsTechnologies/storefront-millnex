'use client';

import {useState} from 'react';
import {ArrowUpRight} from 'lucide-react';
import {cn} from '@/lib/utils';

export interface InsightCard {
    slug: string;
    title: string;
    excerpt: string;
    topic: string;
    /** Pre-formatted publish date. */
    date: string;
    dateTime: string;
    href?: string;
}

/**
 * Topic chips + editorial card grid for real `INSIGHTS` entries (the page
 * renders an empty state instead while there are none). "All" is the
 * default so every card is in the prerendered HTML.
 */
export function InsightsBrowser({
    articles,
    topics,
    allLabel,
    navLabel,
    noResults,
    readLabel,
}: {
    articles: InsightCard[];
    topics: readonly string[];
    allLabel: string;
    navLabel: string;
    noResults: string;
    readLabel: string;
}) {
    const [active, setActive] = useState<string | null>(null);
    const visible = active ? articles.filter((article) => article.topic === active) : articles;

    return (
        <>
            <div role="group" aria-label={navLabel} className="flex flex-wrap gap-2">
                {[null, ...topics].map((topic) => {
                    const selected = topic === active;
                    return (
                        <button
                            key={topic ?? 'all'}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => setActive(topic)}
                            className={cn(
                                'cursor-pointer rounded-lg border px-3.5 py-2 text-sm font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-brand/40',
                                selected ? 'border-foreground bg-foreground text-background' : 'border-border bg-card hover:border-foreground/35',
                            )}
                        >
                            {topic ?? allLabel}
                        </button>
                    );
                })}
            </div>

            {visible.length === 0 ? (
                <p className="mt-10 rounded-xl border border-dashed border-border bg-surface p-8 text-center text-muted-foreground">{noResults}</p>
            ) : (
                <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {visible.map((article, index) => (
                        <li
                            key={article.slug}
                            className={cn(
                                'group/card relative flex flex-col rounded-xl border border-border bg-card p-7 transition-[box-shadow,transform] duration-300',
                                article.href && 'hover:-translate-y-0.5 hover:shadow-[0_28px_50px_-34px_rgb(15_20_30/0.5)]',
                                // Lead story spans two columns on desktop for an editorial rhythm.
                                index === 0 && !active && visible.length > 2 && 'lg:col-span-2',
                            )}
                        >
                            <p className="spec-label text-brand">{article.topic}</p>
                            <h3 className={cn('mt-4 font-display-wide font-bold leading-tight', index === 0 && !active ? 'text-2xl sm:text-3xl' : 'text-xl')}>
                                {article.href ? (
                                    <a href={article.href} className="after:absolute after:inset-0 after:content-[''] hover:text-brand">{article.title}</a>
                                ) : (
                                    article.title
                                )}
                            </h3>
                            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{article.excerpt}</p>
                            <div className="mt-auto pt-6">
                                <div className="flex items-center justify-between gap-4 border-t border-border pt-5">
                                    <time dateTime={article.dateTime} className="spec-label text-steel">{article.date}</time>
                                    {article.href && (
                                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand">
                                            {readLabel}
                                            <ArrowUpRight aria-hidden="true" className="size-4 transition-transform group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5" />
                                        </span>
                                    )}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
}
