import { afterEach, describe, expect, it } from 'vitest';
import {
  getAvailableLocales, getDirection, getLocale, onLocaleChange,
  registerDictionary, setLocale, t,
} from './locale.js';

afterEach(() => setLocale('ar'));

describe('i18n — العربية أولاً', () => {
  it('العربية هي اللغة الافتراضية وRTL هو الاتجاه الأصلي', () => {
    expect(getLocale()).toBe('ar');
    expect(getDirection()).toBe('rtl');
  });

  it('يترجم السلاسل المشتركة بالعربية والإنجليزية', () => {
    expect(t('sim.launch')).toBe('إطلاق');
    setLocale('en');
    expect(t('sim.launch')).toBe('Launch');
    expect(getDirection()).toBe('ltr');
  });

  it('يستوفي المعاملات داخل القوالب', () => {
    setLocale('en');
    expect(t('app.resultCount', { shown: 12, total: 200 })).toBe('Showing 12 of 200 new simulations');
  });

  it('يسقط إلى العربية (المرجع) عند غياب المفتاح في اللغة النشطة', () => {
    registerDictionary('fr', { 'sim.launch': 'Lancer' });
    setLocale('fr');
    expect(t('sim.launch')).toBe('Lancer');
    expect(t('sim.reset')).toBe('إعادة ضبط'); // من القاموس المرجعي العربي
  });

  it('يعيد المفتاح نفسه عند غيابه من كل القواميس', () => {
    expect(t('missing.key')).toBe('missing.key');
  });

  it('registerDictionary يدمج دون مسح المفاتيح الموجودة', () => {
    registerDictionary('en', { 'custom.key': 'Custom' });
    setLocale('en');
    expect(t('custom.key')).toBe('Custom');
    expect(t('sim.launch')).toBe('Launch');
  });

  it('يخطر المشتركين عند تغيّر اللغة ويدعم إلغاء الاشتراك', () => {
    const seen: string[] = [];
    const off = onLocaleChange((l) => seen.push(l));
    setLocale('en');
    off();
    setLocale('ar');
    expect(seen).toEqual(['en']);
  });

  it('يرفض لغة غير مسجلة برسالة واضحة', () => {
    expect(() => setLocale('xx')).toThrow('لغة غير مسجلة');
  });

  it('يسرد اللغات المتاحة', () => {
    expect(getAvailableLocales()).toContain('ar');
    expect(getAvailableLocales()).toContain('en');
  });
});
