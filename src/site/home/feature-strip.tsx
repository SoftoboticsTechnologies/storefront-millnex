import {Award, Factory, Headset, ThumbsUp} from 'lucide-react';
import {FEATURES_COPY} from '@/site/content/home';

const ICONS = {thumbsUp: ThumbsUp, award: Award, factory: Factory, headset: Headset} as const;

/**
 * Full-width four-up feature band directly under the hero: 2×2 on phones,
 * one row from lg up, hairline dividers between cells.
 */
export function FeatureStrip() {
    return (
        <section aria-label="Millnex features" className="border-b border-border bg-card">
            <div className="mx-auto max-w-[1920px]">
                <ul className="grid grid-cols-2 lg:grid-cols-4">
                    {FEATURES_COPY.map(({icon, title, body}, index) => {
                        const Icon = ICONS[icon];
                        return (
                            <li
                                key={title}
                                data-reveal
                                className={`flex flex-col items-start gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-center sm:gap-4 sm:px-6 sm:py-7 lg:py-8 ${index % 2 === 1 ? 'border-l border-border' : ''} ${index >= 2 ? 'border-t border-border lg:border-t-0' : ''} ${index === 2 ? 'lg:border-l' : ''}`}
                            >
                                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand sm:size-12">
                                    <Icon aria-hidden="true" className="size-5 sm:size-6" />
                                </span>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-foreground sm:text-base">{title}</p>
                                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">{body}</p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}
