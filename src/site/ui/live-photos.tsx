import Image from 'next/image';
import {cn} from '@/lib/utils';
import {LIVE_PHOTOS_COPY} from '@/site/content/home';
import {LIVE_PHOTOS} from '@/site/content/media';
import {SectionHeading} from '@/site/ui/section-heading';

/**
 * "See the Machine Up Close": Millnex's own real photographs of a machine
 * (media.ts#LIVE_PHOTOS), three portrait frames with captions. The photos
 * are already cropped to 3:4, so the frames show them whole. Phones list
 * them one under another; sm+ shows three across.
 */
export function LivePhotos({className}: {className?: string}) {
    if (LIVE_PHOTOS.length === 0) return null;

    return (
        <section className={cn('py-20 sm:py-24 lg:py-28', className)}>
            <div className="site-container">
                <SectionHeading title={LIVE_PHOTOS_COPY.title} body={LIVE_PHOTOS_COPY.body} />
                <ul className="mt-10 grid gap-6 sm:grid-cols-3 sm:gap-5 lg:mt-12 lg:gap-6">
                    {LIVE_PHOTOS.map((photo, index) => (
                        <li
                            key={photo.src}
                            data-reveal
                            style={{'--reveal-delay': `${index * 90}ms`} as React.CSSProperties}
                            className="min-w-0"
                        >
                            <figure className="group/photo">
                                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-border bg-stage shadow-[0_24px_48px_-34px_rgb(15_20_30/0.5)]">
                                    <Image
                                        src={photo.src}
                                        alt={photo.alt}
                                        fill
                                        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 32vw, 100vw"
                                        className="object-cover transition-transform duration-700 ease-out group-hover/photo:scale-[1.03]"
                                    />
                                </div>
                                <figcaption className="mt-3 text-sm font-semibold text-foreground">{photo.caption}</figcaption>
                            </figure>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
