import Image from 'next/image';
import {getTranslations} from 'next-intl/server';
import {ArrowRight, BadgeCheck, Check, Headset, Ruler, Scale, Wrench, Zap} from 'lucide-react';
import {getRouteLocale} from '@/platform/i18n/server';
import type {ShopCategory} from '@/features/collections/data';
import {NavigationLink} from '@/site/navigation/navigation-link';
import {SectionHeading} from '@/site/ui/section-heading';
import {siteButton, arrowNudge} from '@/site/ui/button-styles';
import {ABOUT_PAGE_COPY} from '@/site/content/company';
import {findCategoryBanner} from '@/site/content/media';

const pad = (value: number) => String(value).padStart(2, '0');
const revealDelay = (ms: number) => ({'--reveal-delay': `${ms}ms`}) as React.CSSProperties;

function stripTags(html: string | null | undefined) {
    return html?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() ?? '';
}

/** 01 — Who we are: Millnex's own About text beside its own banner (shown uncropped — its text is part of the artwork). */
export function WhoWeAre() {
    const {who} = ABOUT_PAGE_COPY;
    return (
        <section className="bg-background py-20 sm:py-24 lg:py-28">
            <div className="site-container grid gap-12 lg:grid-cols-12 lg:gap-16">
                <div className="lg:col-span-6">
                    <SectionHeading title={who.title} />
                    <p data-reveal className="mt-8 text-lg leading-relaxed text-foreground">{who.lead}</p>
                    <div className="mt-6 space-y-4">
                        {who.paragraphs.map((paragraph, index) => (
                            <p key={index} data-reveal style={revealDelay(60 * (index + 1))} className="text-[15px] leading-relaxed text-muted-foreground">
                                {paragraph}
                            </p>
                        ))}
                    </div>
                </div>
                <div className="lg:col-span-6">
                    <div data-reveal="image" className="frame-ticks overflow-hidden rounded-2xl border border-border bg-card p-2 sm:p-3">
                        <Image
                            src={who.image.src}
                            alt={who.image.alt}
                            width={who.image.width}
                            height={who.image.height}
                            sizes="(min-width: 1024px) 45vw, 100vw"
                            className="h-auto w-full rounded-xl"
                        />
                    </div>
                    <ul className="mt-8 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
                        {who.highlights.map((highlight, index) => (
                            <li key={highlight} data-reveal style={revealDelay(60 * index)} className="flex gap-3 bg-card p-5 text-sm font-semibold leading-snug">
                                <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand" />
                                {highlight}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}

/**
 * The category's Millnex banner (`CATEGORY_BANNERS`, matched by name) shown
 * whole — its name is part of the art — or, without one, product images
 * from inside the collection on a light stage; 2 on phones, up to 4 from sm.
 */
function CategoryCollage({category}: {category: ShopCategory}) {
    const banner = findCategoryBanner(category.name);
    if (banner) {
        return (
            <div className="relative aspect-square overflow-hidden">
                <Image
                    src={banner.src}
                    alt={banner.alt}
                    fill
                    sizes="(min-width: 768px) 45vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover/card:scale-[1.03]"
                />
            </div>
        );
    }

    const images = category.productImages.length > 0
        ? category.productImages.slice(0, 4)
        : category.featuredAsset ? [{...category.featuredAsset, alt: category.name.trim()}] : [];

    if (images.length === 0) {
        return (
            <div aria-hidden="true" className="flex aspect-[16/9] items-center justify-center bg-stage font-display-wide text-5xl font-bold text-foreground/15">
                {category.name.trim().charAt(0).toUpperCase()}
            </div>
        );
    }

    return (
        <div className={`grid gap-2 bg-stage p-3 sm:gap-3 sm:p-4 ${images.length === 1 ? 'grid-cols-1' : images.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
            {images.map((image, index) => (
                <div
                    key={image.id}
                    className={`relative overflow-hidden rounded-lg ${images.length === 1 ? 'aspect-[16/10]' : 'aspect-[3/4]'} ${index >= 2 ? 'hidden sm:block' : ''}`}
                >
                    <Image
                        src={`${image.preview}?preset=medium`}
                        alt={image.alt}
                        fill
                        sizes="(min-width: 1024px) 12vw, 45vw"
                        className="object-contain mix-blend-multiply transition-transform duration-500 group-hover/card:scale-[1.04]"
                    />
                </div>
            ))}
        </div>
    );
}

/** 02 — What we build: the real Vendure top-level collections, each with its own product images. */
export async function WhatWeBuild({categories}: {categories: ShopCategory[]}) {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Site'});
    const {build} = ABOUT_PAGE_COPY;

    return (
        <section className="bg-surface py-20 sm:py-24 lg:py-28">
            <div className="site-container">
                <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                    <SectionHeading title={build.title} body={build.body} />
                    <NavigationLink data-reveal href="/shop/" className={siteButton({variant: 'outline', size: 'md'})}>
                        {t('exploreMachines')}
                        <ArrowRight aria-hidden="true" className={arrowNudge} />
                    </NavigationLink>
                </div>

                {categories.length > 0 ? (
                    <ul className={`mt-12 grid gap-5 sm:gap-6 ${categories.length === 1 ? 'max-w-2xl' : categories.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2 xl:grid-cols-3'}`}>
                        {categories.map((category, index) => {
                            const description = stripTags(category.description);
                            return (
                                <li
                                    key={category.id}
                                    data-reveal
                                    style={revealDelay(80 * index)}
                                    className="group/card relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-[0_28px_50px_-34px_rgb(15_20_30/0.5)] has-[a:focus-visible]:ring-3 has-[a:focus-visible]:ring-brand/40"
                                >
                                    <CategoryCollage category={category} />
                                    <div className="flex flex-1 flex-col border-t border-border p-6">
                                        <h3 className="font-display-wide text-xl font-bold sm:text-2xl">
                                            <NavigationLink href={`/collection/${category.slug}/`} className="after:absolute after:inset-0 after:content-['']">
                                                {category.name.trim()}
                                            </NavigationLink>
                                        </h3>
                                        {description && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{description}</p>}
                                        <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-brand">
                                            {t('viewRange')}
                                            <ArrowRight aria-hidden="true" className={`size-4 ${arrowNudge}`} />
                                        </span>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p data-reveal className="mt-12">
                        <NavigationLink href="/shop/" className={siteButton({variant: 'link', size: 'md'})}>
                            {t('browseShopFallback')}
                        </NavigationLink>
                    </p>
                )}
            </div>
        </section>
    );
}

/** 03 — Manufacturing approach: four stages on ink, drawn left-to-right. */
export async function ApproachSection() {
    const locale = await getRouteLocale();
    const t = await getTranslations({locale, namespace: 'Site'});
    const {approach} = ABOUT_PAGE_COPY;

    return (
        <section className="relative isolate overflow-hidden bg-tint-orange py-20 text-foreground sm:py-24 lg:py-28">
            <div className="site-container">
                <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                    <SectionHeading title={approach.title} body={approach.body} />
                    <NavigationLink data-reveal href="/manufacturing/" className={siteButton({variant: 'outline', size: 'md'})}>
                        {t('manufacturingLink')}
                        <ArrowRight aria-hidden="true" className={arrowNudge} />
                    </NavigationLink>
                </div>

                <div className="relative mt-14 lg:mt-20">
                    <span aria-hidden="true" className="absolute inset-x-0 top-[1.375rem] hidden h-px bg-border lg:block" />
                    <span aria-hidden="true" data-reveal className="reveal-line absolute inset-x-0 top-[1.375rem] hidden h-px bg-brand lg:block" />
                    <ol className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:gap-8 lg:overflow-visible lg:rounded-none lg:border-0 lg:bg-transparent lg:grid-cols-4">
                        {approach.steps.map((step, index) => (
                            <li key={step.title} data-reveal style={revealDelay(120 * index)} className="relative bg-card p-6 lg:bg-transparent lg:p-0">
                                <span className="spec-label flex size-11 items-center justify-center rounded-full border border-border bg-card text-brand">
                                    {pad(index + 1)}
                                </span>
                                <h3 className="mt-6 font-display-wide text-xl font-bold">{step.title}</h3>
                                <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{step.body}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </section>
    );
}

const WHY_ICONS = {ruler: Ruler, badge: BadgeCheck, zap: Zap, wrench: Wrench, headset: Headset, scale: Scale} as const;

/** 04 — Why customers choose Millnex: the six WHY_COPY points, numbered 01–06 on a hairline grid. */
export function WhyChoose() {
    const {why} = ABOUT_PAGE_COPY;
    return (
        <section className="bg-background py-20 sm:py-24 lg:py-28">
            <div className="site-container">
                <SectionHeading title={why.title} body={why.body} />
                <ol className="mt-12 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
                    {why.items.map((item, index) => {
                        const Icon = WHY_ICONS[item.icon];
                        return (
                            <li key={item.title} data-reveal style={revealDelay(60 * index)} className="group/why relative bg-card p-7 transition-colors hover:bg-surface sm:p-8">
                                <Icon aria-hidden="true" className="size-6 text-steel transition-colors group-hover/why:text-brand" />
                                <h3 className="mt-6 text-lg font-bold">{item.title}</h3>
                                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{item.body}</p>
                            </li>
                        );
                    })}
                </ol>
            </div>
        </section>
    );
}
