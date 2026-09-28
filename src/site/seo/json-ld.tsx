/**
 * Renders a JSON-LD block. Server Components only — the markup is part of
 * the statically exported HTML, never re-rendered on the client.
 * `<` is escaped so a string value can never close the script element.
 */
export function JsonLd({data}: {data: Record<string, unknown> | Array<Record<string, unknown>>}) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{__html: JSON.stringify(data).replace(/</g, '\\u003c')}}
        />
    );
}
