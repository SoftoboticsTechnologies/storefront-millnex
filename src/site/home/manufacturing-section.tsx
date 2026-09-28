import Image from 'next/image';
import {MANUFACTURING_COPY} from '@/site/content/home';
import {SectionHeading} from '@/site/ui/section-heading';

export function ManufacturingSection() {
    return (
        <section className="py-24 lg:py-32">
            <div className="site-container grid items-center gap-14 lg:grid-cols-12 lg:gap-16">
                <figure data-reveal className="lg:col-span-7">
                    <div className="grid grid-cols-2 gap-3 rounded-3xl border border-border bg-card p-3 sm:gap-4 sm:p-4">
                        {MANUFACTURING_COPY.images.map((image) => (
                            <div key={image.src} className="overflow-hidden rounded-2xl bg-white">
                                <Image
                                    src={image.src}
                                    alt={image.alt}
                                    width={image.width}
                                    height={image.height}
                                    sizes="(min-width: 1024px) 27vw, 50vw"
                                    className="aspect-square size-full object-contain"
                                />
                            </div>
                        ))}
                    </div>
                    <figcaption className="mt-4 text-lg leading-tight font-extrabold">{MANUFACTURING_COPY.imageCaption}</figcaption>
                </figure>

                <div className="lg:col-span-5">
                    <SectionHeading eyebrow={MANUFACTURING_COPY.eyebrow} title={MANUFACTURING_COPY.title} body={MANUFACTURING_COPY.body} />
                    <ol className="relative mt-10 space-y-2 before:absolute before:bottom-6 before:left-[19px] before:top-6 before:w-px before:bg-border">
                        {MANUFACTURING_COPY.pillars.map((pillar, index) => (
                            <li
                                key={pillar.title}
                                data-reveal
                                style={{'--reveal-delay': `${index * 90}ms`} as React.CSSProperties}
                                className="relative flex gap-5 rounded-2xl p-3 transition-colors hover:bg-surface"
                            >
                                <span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-card font-mono text-xs font-bold text-brand">
                                    {String(index + 1).padStart(2, '0')}
                                </span>
                                <div className="pt-1.5">
                                    <h3 className="text-base font-bold">{pillar.title}</h3>
                                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{pillar.body}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </section>
    );
}
