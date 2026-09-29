import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import ts from 'typescript';

const root = path.join(import.meta.dirname, '..', '..');

async function loadDisplayPrice() {
    const source = await readFile(path.join(root, 'src/features/pricing/display-price.ts'), 'utf8');
    const {outputText} = ts.transpileModule(source, {
        compilerOptions: {module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022},
    });
    return import(`data:text/javascript,${encodeURIComponent(outputText)}`);
}

test('reference price is the Vendure price + 10%, in whole minor units', async () => {
    const {calculateDisplayOriginalPrice, SHOW_REFERENCE_PRICE} = await loadDisplayPrice();
    if (!SHOW_REFERENCE_PRICE) return;
    // Vendure prices are minor units (paise): ₹10,000 = 1_000_000.
    assert.equal(calculateDisplayOriginalPrice(1_000_000), 1_100_000); // ₹11,000
    assert.equal(calculateDisplayOriginalPrice(2_500_000), 2_750_000); // ₹27,500
    assert.equal(calculateDisplayOriginalPrice(1_250_000), 1_375_000); // ₹13,750
    assert.equal(calculateDisplayOriginalPrice(849_900), 934_890); // ₹9,348.90
    assert.equal(calculateDisplayOriginalPrice(5), 6); // rounds half up to a whole paisa
});

test('no reference price is invented without a real price', async () => {
    const {calculateDisplayOriginalPrice} = await loadDisplayPrice();
    for (const value of [null, undefined, 0, -100, Number.NaN, Number.POSITIVE_INFINITY]) {
        assert.equal(calculateDisplayOriginalPrice(value), null, `expected null for ${value}`);
    }
});

test('a real Vendure MRP above the price is used with its saving', async () => {
    const {resolveReferencePrice} = await loadDisplayPrice();
    // MRP ₹21,000, Vendure price ₹16,000 → strike ₹21,000, save ₹5,000.
    assert.deepEqual(resolveReferencePrice(1_600_000, 2_100_000), {original: 2_100_000, saving: 500_000});
});

test('without a usable MRP the ×1.10 price is used and no saving is claimed', async () => {
    const {resolveReferencePrice, SHOW_REFERENCE_PRICE} = await loadDisplayPrice();
    for (const mrp of [null, undefined, 0, 1_000_000, 900_000]) {
        const result = resolveReferencePrice(1_000_000, mrp);
        assert.deepEqual(result, SHOW_REFERENCE_PRICE ? {original: 1_100_000, saving: null} : null, `mrp ${mrp}`);
    }
    assert.equal(resolveReferencePrice(0, 2_000_000), null);
    assert.equal(resolveReferencePrice(null, 2_000_000), null);
});
