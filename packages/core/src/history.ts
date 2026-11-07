/**
 * سجل حالات للتراجع خطوة بخطوة — يعمل على لقطات SimState غير القابلة للتعديل.
 * يُستخدم في المحاكاة لتوفير زر "تراجع" دون أي خادم أو حساب.
 */
export class StateHistory<T> {
  private readonly stack: T[] = [];
  private readonly capacity: number;

  constructor(capacity = 50) {
    if (capacity < 1) throw new Error('سعة السجل يجب أن تكون 1 على الأقل');
    this.capacity = capacity;
  }

  /** يدفع لقطة جديدة؛ عند الامتلاء تُحذف الأقدم. */
  push(state: T): void {
    this.stack.push(state);
    if (this.stack.length > this.capacity) this.stack.shift();
  }

  /** يسحب آخر لقطة (الأحدث) أو undefined إن كان السجل فارغاً. */
  undo(): T | undefined {
    return this.stack.pop();
  }

  /** يعيد آخر لقطة دون سحبها — لعرض ما سيُسترجع. */
  peek(): T | undefined {
    return this.stack[this.stack.length - 1];
  }

  clear(): void {
    this.stack.length = 0;
  }

  get canUndo(): boolean {
    return this.stack.length > 0;
  }

  get size(): number {
    return this.stack.length;
  }
}
