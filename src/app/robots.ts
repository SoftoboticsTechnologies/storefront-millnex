export {default} from '@/site/seo/robots';

// Metadata routes must be force-static under `output: 'export'`; Next rejects re-exported config.
export const dynamic = 'force-static';
