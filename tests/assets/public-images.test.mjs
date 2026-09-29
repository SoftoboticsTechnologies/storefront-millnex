import assert from 'node:assert/strict';
import {readdir, readFile, stat} from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const root = path.join(import.meta.dirname, '..', '..');
const IMAGE_PATH = /(['"`])(\/[^'"`?)\s]*?\.(?:webp|jpe?g|png|svg|gif|avif|ico))(?=[?'"`])/g;

async function findSourceFiles(directory) {
    const files = [];
    for (const entry of await readdir(directory, {withFileTypes: true})) {
        const file = path.join(directory, entry.name);
        if (entry.isDirectory()) files.push(...await findSourceFiles(file));
        if (entry.isFile() && /\.tsx?$/.test(entry.name)) files.push(file);
    }
    return files;
}

async function exists(file) {
    try {
        return (await stat(file)).isFile();
    } catch {
        return false;
    }
}

// Images under public/ are referenced by path strings (src/site/content/media.ts
// etc.); moving or renaming a file there silently breaks the page. This fails
// the test run instead.
test('every local image path referenced in src/ exists in public/', async () => {
    const missing = [];
    for (const file of await findSourceFiles(path.join(root, 'src'))) {
        const content = await readFile(file, 'utf8');
        for (const [, , reference] of content.matchAll(IMAGE_PATH)) {
            if (!await exists(path.join(root, 'public', decodeURI(reference)))) {
                missing.push(`${path.relative(root, file)} → public${decodeURI(reference)}`);
            }
        }
    }
    assert.deepEqual(missing, []);
});
