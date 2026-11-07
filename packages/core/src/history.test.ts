import { describe, expect, it } from 'vitest';
import { StateHistory } from './history.js';

describe('StateHistory — تراجع بسعة محدودة', () => {
  it('يسحب اللقطات بترتيب عكسي (الأحدث أولاً)', () => {
    const h = new StateHistory<number>();
    h.push(1);
    h.push(2);
    h.push(3);
    expect(h.undo()).toBe(3);
    expect(h.undo()).toBe(2);
    expect(h.undo()).toBe(1);
    expect(h.undo()).toBeUndefined();
  });

  it('يحترم السعة القصوى بحذف الأقدم', () => {
    const h = new StateHistory<number>(3);
    for (let i = 1; i <= 5; i += 1) h.push(i);
    expect(h.size).toBe(3);
    expect(h.peek()).toBe(5);
    h.undo();
    h.undo();
    h.undo();
    expect(h.canUndo).toBe(false);
  });

  it('peek لا يستهلك اللقطة', () => {
    const h = new StateHistory<string>();
    h.push('أ');
    expect(h.peek()).toBe('أ');
    expect(h.size).toBe(1);
    expect(h.undo()).toBe('أ');
  });

  it('clear يفرغ السجل بالكامل', () => {
    const h = new StateHistory<number>();
    h.push(1);
    h.push(2);
    h.clear();
    expect(h.canUndo).toBe(false);
    expect(h.size).toBe(0);
  });

  it('يرفض سعة صفرية', () => {
    expect(() => new StateHistory<number>(0)).toThrow();
  });
});
