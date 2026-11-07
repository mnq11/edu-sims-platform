import { describe, expect, it } from 'vitest';
import { derived, Property } from './property.js';

describe('Property', () => {
  it('يخزن القيمة الابتدائية ويحدثها', () => {
    const p = new Property(5);
    expect(p.value).toBe(5);
    p.value = 10;
    expect(p.value).toBe(10);
  });

  it('يخطر المشتركين بالقيمة الجديدة والسابقة', () => {
    const p = new Property('أ');
    const seen: Array<[string, string]> = [];
    p.link((next, prev) => seen.push([next, prev]));
    p.value = 'ب';
    expect(seen).toEqual([['ب', 'أ']]);
  });

  it('لا يخطر عند تكرار القيمة ذاتها', () => {
    const p = new Property(1);
    let calls = 0;
    p.link(() => calls++);
    p.value = 1;
    expect(calls).toBe(0);
  });

  it('إلغاء الاشتراك يوقف الإخطارات', () => {
    const p = new Property(0);
    let calls = 0;
    const dispose = p.link(() => calls++);
    dispose();
    p.value = 1;
    expect(calls).toBe(0);
    expect(p.listenerCount).toBe(0);
  });

  it('linkImmediate يزامن القيمة الحالية فوراً', () => {
    const p = new Property(42);
    let synced = 0;
    p.linkImmediate((v) => (synced = v));
    expect(synced).toBe(42);
  });
});

describe('derived', () => {
  it('يعكس التحويل مباشرة ومع كل تحديث', () => {
    const source = new Property(2);
    const doubled = derived(source, (v) => v * 2);
    expect(doubled.value).toBe(4);
    source.value = 7;
    expect(doubled.value).toBe(14);
  });
});
