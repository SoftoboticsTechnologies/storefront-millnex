import {getTranslations} from 'next-intl/server';
import {ArrowUpRight, CookingPot, Factory, Home, Wheat} from 'lucide-react';
import {getRouteLocale} from '@/platform/i18n/server';
import {NavigationLink} from '@/site/navigation/navigation-link';
import {APPLICATIONS_COPY} from '@/site/content/home';
import {SectionHeading} from '@/site/ui/section-heading';

const ICONS = {home: Home, factory: Factory, wheat: Wheat, cooking: CookingPot} as const;

/**
 * Use-case discovery: each card is a live Vendure search, so it only ever
 * surfaces products the store really lists.
 */
export async function ApplicationsSection() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Home'});

    return (
        <section id="applications" className="py-16 sm:py-20 lg:py-24">
            <div className="site-container">
                <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
                    <SectionHeading eyebrow={APPLICATIONS_COPY.eyebrow} title={APPLICATIONS_COPY.title} />
                    <p data-reveal className="max-w-lg text-base leading-relaxed text-muted-foreground lg:justify-self-end">
                        {APPLICATIONS_COPY.body}
                    </p>
                </div>

                <ul className="mt-10 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
                    {APPLICATIONS_COPY.items.map((item, index) => {
                        const Icon = ICONS[item.icon];
                        return (
                            <li
                                key={item.title}
                                data-reveal
                                style={{'--reveal-delay': `${index * 80}ms`} as React.CSSProperties}
                            >
                                <NavigationLink
                                    href={`/search/?q=${encodeURIComponent(item.searchTerm)}`}
                                    className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-6 transition-[border-color,box-shadow,transform] duration-300 outline-none hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-[0_22px_45px_-30px_rgb(0_0_0/0.45)] focus-visible:ring-3 focus-visible:ring-brand/40"
                                >
                                    <span aria-hidden="true" className="absolute -right-10 -top-10 size-32 rounded-full bg-brand/5 transition-transform duration-500 group-hover:scale-150" />
                                    <span className="relative flex size-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
                                        <Icon className="size-6" />
                                    </span>
                                    <h3 className="relative mt-6 text-lg font-bold">{item.title}</h3>
                                    <p className="relative mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                                    <span className="relative mt-5 inline-flex items-center gap-1 text-sm font-bold text-brand">
                                        {t('shopApplication')}
                                        <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                                    </span>
                                </NavigationLink>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </section>
    );
}
