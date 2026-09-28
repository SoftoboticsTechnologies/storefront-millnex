import Image from 'next/image';
import {STORY_COPY} from '@/site/content/home';

type TitlePart = (typeof STORY_COPY.title)[number][number];

function renderPart(part: TitlePart, key: number) {
    if (typeof part === 'string') return <span key={key}>{part}</span>;
    if ('accent' in part) return <strong key={key} className="font-extrabold text-brand">{part.accent}</strong>;
    return <strong key={key} className="font-extrabold">{part.strong}</strong>;
}

/**
 * Editorial "About us" band used on the homepage and the About page: a
 * two-tone headline over a wheat illustration, story paragraphs alongside.
 * Copy lives in STORY_COPY (site/content/home.ts).
 */
export function StorySection() {
    const {image} = STORY_COPY;

    return (
        <section id="story" className="overflow-hidden bg-background pb-8 pt-16 sm:pb-10 sm:pt-20 lg:pb-12 lg:pt-28">
            <div className="site-container grid gap-10 lg:grid-cols-12 lg:gap-16">
                <div className="lg:col-span-5">
                    <p className="inline-block border-b-2 border-brand pb-1.5 text-sm font-bold uppercase tracking-[0.12em] text-muted-foreground sm:text-base">
                        {STORY_COPY.eyebrow}
                    </p>
                    <h2 className="mt-7 text-4xl leading-[1.12] font-light tracking-tight text-foreground sm:text-5xl lg:text-[3.4rem]">
                        {STORY_COPY.title.map((line, index) => (
                            <span key={index} className="block">{line.map(renderPart)}</span>
                        ))}
                    </h2>
                    <div data-reveal className="mt-8 max-w-sm sm:max-w-md lg:mt-12">
                        <Image src={image.src} alt="" width={image.width} height={image.height} className="h-auto w-full" />
                    </div>
                </div>

                <div className="space-y-6 text-base leading-[1.9] text-muted-foreground sm:text-[1.05rem] lg:col-span-7 lg:pt-16">
                    {STORY_COPY.paragraphs.map((paragraph) => (
                        <p key={paragraph} data-reveal>{paragraph}</p>
                    ))}
                </div>
            </div>
        </section>
    );
}
