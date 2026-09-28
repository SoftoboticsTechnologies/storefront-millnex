import type {MetadataRoute} from 'next';
import {SITE_NAME} from '@/config/metadata';

/** Web app manifest; icons from public/favicon_io (Millnex logo). */
export default function manifest(): MetadataRoute.Manifest {
    return {
        name: SITE_NAME,
        short_name: SITE_NAME,
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        icons: [
            {src: '/favicon_io/android-chrome-192x192.png', sizes: '192x192', type: 'image/png'},
            {src: '/favicon_io/android-chrome-512x512.png', sizes: '512x512', type: 'image/png'},
        ],
    };
}
