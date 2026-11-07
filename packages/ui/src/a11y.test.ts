import { describe, expect, it, vi } from 'vitest';
import { onReducedMotionChange, prefersReducedMotion } from './a11y.js';

describe('prefersReducedMotion', () => {
  it('يعيد false في بيئة بلا matchMedia (Node)', () => {
    vi.stubGlobal('matchMedia', undefined);
    expect(prefersReducedMotion()).toBe(false);
  });

  it('يقرأ نتيجة matchMedia عند توفرها', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    expect(prefersReducedMotion()).toBe(true);
  });
});

describe('onReducedMotionChange', () => {
  it('يسجّل المستمع ويلغي تسجيله', () => {
    const added: string[] = [];
    const removed: string[] = [];
    const stub = {
      addEventListener: (type: string) => added.push(type),
      removeEventListener: (type: string) => removed.push(type),
    };
    vi.stubGlobal('matchMedia', () => stub);
    const unsubscribe = onReducedMotionChange(() => undefined);
    expect(added).toEqual(['change']);
    unsubscribe();
    expect(removed).toEqual(['change']);
  });

  it('يعيد دالة عدم-فعل في بيئة بلا matchMedia', () => {
    vi.stubGlobal('matchMedia', undefined);
    expect(() => onReducedMotionChange(() => undefined)()).not.toThrow();
  });
});
