import Image from 'next/image';
import {cn} from '@/lib/utils';
import type {CatalogImage} from '@/site/content/media';

/**
 * One of Millnex's own product photos on a light plinth. The photos have
 * white backgrounds with model names baked in, so they are always shown
 * whole (`object-contain`) with `mix-blend-multiply` dropping the white —
 * never cropped. Works on light and ink sections alike.
 */
export function MachineStage({
    image,
    sizes,
    priority = false,
    className,
    imageClassName,
}: {
    image: CatalogImage;
    sizes: string;
    priority?: boolean;
    className?: string;
    imageClassName?: string;
}) {
    return (
        <div className={cn('frame-ticks relative aspect-square overflow-hidden rounded-xl bg-stage', className)}>
            <Image
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                sizes={sizes}
                priority={priority}
                className={cn('size-full object-contain p-[8%] mix-blend-multiply', imageClassName)}
            />
        </div>
    );
}
